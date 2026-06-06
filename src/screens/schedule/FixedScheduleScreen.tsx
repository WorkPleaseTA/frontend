import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Modal, FlatList, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

// ── 상수 ──────────────────────────────────────────────────────────────────────

const DAY_TABS = ['월', '화', '수', '목', '금', '토', '일'];
const DAY_API: Record<string, string> = {
  '월': 'MONDAY', '화': 'TUESDAY', '수': 'WEDNESDAY',
  '목': 'THURSDAY', '금': 'FRIDAY', '토': 'SATURDAY', '일': 'SUNDAY',
};

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

const DEFAULT_TIME = { start: '09:00', end: '18:00' };

// ── 타입 ──────────────────────────────────────────────────────────────────────

interface EditViewItem {
  storeMemberId: number;
  staffName: string;
  hasSchedule: boolean;
  scheduleId?: number;
  startTime?: string; // HH:mm:ss
  endTime?: string;
}

// ── TimePicker ────────────────────────────────────────────────────────────────

function TimePicker({ value, onChange }: { value: string; onChange: (t: string) => void }) {
  const [visible, setVisible] = useState(false);
  const listRef = useRef<FlatList>(null);

  const open = () => {
    setVisible(true);
    setTimeout(() => {
      const idx = TIME_OPTIONS.indexOf(value);
      if (idx >= 0 && listRef.current) {
        listRef.current.scrollToIndex({ index: idx, animated: false, viewPosition: 0.4 });
      }
    }, 80);
  };

  return (
    <>
      <TouchableOpacity style={s.timeBox} onPress={open} activeOpacity={0.7}>
        <Text style={s.timeText}>{value}</Text>
        <Text style={s.timeArrow}>▼</Text>
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity style={s.pickerOverlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <View style={s.pickerBox}>
            <FlatList
              ref={listRef}
              data={TIME_OPTIONS}
              keyExtractor={t => t}
              showsVerticalScrollIndicator={false}
              getItemLayout={(_, idx) => ({ length: 44, offset: 44 * idx, index: idx })}
              renderItem={({ item }) => {
                const sel = item === value;
                return (
                  <TouchableOpacity
                    style={[s.pickerItem, sel && s.pickerItemSel]}
                    onPress={() => { onChange(item); setVisible(false); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.pickerItemText, sel && s.pickerItemTextSel]}>{item}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

// ── 메인 화면 ─────────────────────────────────────────────────────────────────

export default function FixedScheduleScreen() {
  const navigation = useNavigation();
  const { storeInfo } = useAuth();

  const [activeDay, setActiveDay] = useState('월');
  const [mode, setMode] = useState<'view' | 'input'>('view');
  const [items, setItems] = useState<EditViewItem[]>([]); // edit-view 응답
  const [originalItems, setOriginalItems] = useState<EditViewItem[]>([]); // 저장 전 원본 (삭제 판단용)
  const [checkedIds, setCheckedIds] = useState<number[]>([]);
  const [times, setTimes] = useState<Record<number, { start: string; end: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadEditView = useCallback(async (day: string) => {
    if (!storeInfo) return;
    setLoading(true);
    try {
      const res = await api.get(
        `/stores/${storeInfo.storeId}/fixed-schedules/edit-view?dayOfWeek=${DAY_API[day]}`
      );
      const data: EditViewItem[] = res.data.data ?? [];
      setItems(data);
      setOriginalItems(data);
    } catch {
      setItems([]);
      setOriginalItems([]);
    } finally {
      setLoading(false);
    }
  }, [storeInfo?.storeId]);

  useEffect(() => { loadEditView(activeDay); }, [activeDay, loadEditView]);

  const selectDay = (day: string) => {
    setActiveDay(day);
    setMode('view');
  };

  const toggleCheck = (id: number) =>
    setCheckedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const setTime = (memberId: number, field: 'start' | 'end', val: string) =>
    setTimes(prev => ({ ...prev, [memberId]: { ...(prev[memberId] ?? DEFAULT_TIME), [field]: val } }));

  // 조회 모드 → 입력 모드 진입
  const enterInputMode = () => {
    const initChecked: number[] = [];
    const initTimes: Record<number, { start: string; end: string }> = {};
    items.forEach(item => {
      if (item.hasSchedule) {
        initChecked.push(item.storeMemberId);
        initTimes[item.storeMemberId] = {
          start: item.startTime?.substring(0, 5) ?? DEFAULT_TIME.start,
          end: item.endTime?.substring(0, 5) ?? DEFAULT_TIME.end,
        };
      } else {
        initTimes[item.storeMemberId] = { ...DEFAULT_TIME };
      }
    });
    setCheckedIds(initChecked);
    setTimes(initTimes);
    setMode('input');
  };

  // 저장
  const handleSave = async () => {
    if (!storeInfo) return;
    setSaving(true);
    try {
      // 1. 기존에 스케줄 있었지만 지금 체크 해제된 직원 → DELETE
      const toDelete = originalItems.filter(
        item => item.hasSchedule && item.scheduleId != null && !checkedIds.includes(item.storeMemberId)
      );
      if (toDelete.length > 0) {
        await Promise.all(
          toDelete.map(item =>
            api.delete(`/stores/${storeInfo.storeId}/fixed-schedules/${item.scheduleId}`)
          )
        );
      }

      // 2. 체크된 직원 → PUT (upsert)
      if (checkedIds.length > 0) {
        const schedules = checkedIds.map(id => ({
          storeMemberId: id,
          startTime: (times[id]?.start ?? DEFAULT_TIME.start) + ':00',
          endTime: (times[id]?.end ?? DEFAULT_TIME.end) + ':00',
        }));
        await api.put(`/stores/${storeInfo.storeId}/fixed-schedules`, { dayOfWeek: DAY_API[activeDay], schedules });
      }

      await loadEditView(activeDay);
      setMode('view');
    } catch (e: any) {
      Alert.alert('저장 실패', e.response?.data?.message ?? '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const hasSchedule = items.some(item => item.hasSchedule);

  return (
    <SafeAreaView style={s.safe}>
      {/* 헤더 */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={s.backBtn}
        >
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>고정 스케줄 입력 및 수정</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* 요일 선택 */}
        <View style={s.daySection}>
          <Text style={s.dayLabel}>요일 선택</Text>
          <View style={s.dayRow}>
            {DAY_TABS.map(day => (
              <TouchableOpacity
                key={day}
                style={[s.dayTag, activeDay === day && s.dayTagActive]}
                onPress={() => selectDay(day)}
                activeOpacity={0.7}
              >
                <Text style={[s.dayTagText, activeDay === day && s.dayTagTextActive]}>{day}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 로딩 */}
        {loading && <ActivityIndicator color="#FF8D28" style={{ marginTop: 32 }} />}

        {/* 상태 1: 조회 모드 — 스케줄 없음 */}
        {!loading && mode === 'view' && !hasSchedule && (
          <View style={s.emptyArea} />
        )}

        {/* 상태 2: 입력 모드 */}
        {!loading && mode === 'input' && (
          <View style={s.list}>
            {items.map(emp => {
              const checked = checkedIds.includes(emp.storeMemberId);
              const t = times[emp.storeMemberId] ?? DEFAULT_TIME;
              return (
                <View key={emp.storeMemberId}>
                  <View style={s.employeeRow}>
                    <Text style={s.employeeName}>{emp.staffName}</Text>
                    <TouchableOpacity
                      style={[s.checkbox, checked && s.checkboxChecked]}
                      onPress={() => toggleCheck(emp.storeMemberId)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      {checked && <MaterialIcons name="check" size={14} color="#FFFFFF" />}
                    </TouchableOpacity>
                  </View>
                  {checked && (
                    <View style={s.timeRow}>
                      <TimePicker value={t.start} onChange={v => setTime(emp.storeMemberId, 'start', v)} />
                      <Text style={s.timeSep}>~</Text>
                      <TimePicker value={t.end} onChange={v => setTime(emp.storeMemberId, 'end', v)} />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* 상태 3: 조회 모드 — 스케줄 있음 */}
        {!loading && mode === 'view' && hasSchedule && (
          <View style={s.list}>
            {items.filter(item => item.hasSchedule).map(item => (
              <View key={item.storeMemberId} style={s.viewCard}>
                <Text style={s.viewName}>{item.staffName}</Text>
                <Text style={s.viewTime}>
                  {item.startTime?.substring(0, 5)} - {item.endTime?.substring(0, 5)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 하단 버튼 */}
      {!loading && (
        <View style={s.footer}>
          {mode === 'view' && !hasSchedule && (
            <TouchableOpacity style={s.actionBtn} onPress={enterInputMode} activeOpacity={0.85}>
              <Text style={s.actionBtnText}>추가하기</Text>
              <MaterialIcons name="edit" size={18} color="#FFFFFF" style={s.btnIcon} />
            </TouchableOpacity>
          )}
          {mode === 'input' && (
            <TouchableOpacity style={s.actionBtn} onPress={handleSave} activeOpacity={0.85} disabled={saving}>
              {saving
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text style={s.actionBtnText}>입력 완료</Text>
              }
            </TouchableOpacity>
          )}
          {mode === 'view' && hasSchedule && (
            <TouchableOpacity style={s.actionBtn} onPress={enterInputMode} activeOpacity={0.85}>
              <Text style={s.actionBtnText}>수정하기</Text>
              <MaterialIcons name="edit" size={18} color="#FFFFFF" style={s.btnIcon} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: 36 },
  backArrow: { fontSize: 22, color: '#1A1A1A' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', color: '#000000' },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24, gap: 20 },

  daySection: { gap: 10 },
  dayLabel: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  dayRow: { flexDirection: 'row', gap: 8 },
  dayTag: {
    width: 44, height: 32, borderRadius: 5,
    backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center',
  },
  dayTagActive: { backgroundColor: '#FF8D28' },
  dayTagText: { fontSize: 13, color: '#757575' },
  dayTagTextActive: { color: '#FFFFFF', fontWeight: '700' },

  emptyArea: { height: 120 },
  list: { gap: 10 },

  employeeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#E9F1FF', borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FFFFFF',
  },
  employeeName: { fontSize: 14, fontWeight: '500', color: '#1A1A1A' },
  checkbox: {
    width: 22, height: 22, borderRadius: 4,
    backgroundColor: '#E6E6E6', alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#FF8D28' },

  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  timeBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#E9F1FF', borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  timeText: { fontSize: 16, color: '#000000', fontWeight: '500' },
  timeArrow: { fontSize: 10, color: '#9C9C9C' },
  timeSep: { fontSize: 20, color: '#000000' },

  viewCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#E9F1FF', borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FFFFFF',
  },
  viewName: { fontSize: 13, color: '#848A94' },
  viewTime: { fontSize: 14, color: '#848A94' },

  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  pickerBox: {
    width: 160, maxHeight: 300, backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  pickerItem: { height: 44, alignItems: 'center', justifyContent: 'center' },
  pickerItemSel: { backgroundColor: '#FFF0E5' },
  pickerItemText: { fontSize: 16, color: '#1A1A1A' },
  pickerItemTextSel: { color: '#FF8D28', fontWeight: '700' },

  footer: {
    paddingHorizontal: 20, paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: '#F0F0F0', backgroundColor: '#FFFFFF',
  },
  actionBtn: {
    height: 48, backgroundColor: '#FF8C00', borderRadius: 5,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  actionBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  btnIcon: { marginLeft: 8 },
});
