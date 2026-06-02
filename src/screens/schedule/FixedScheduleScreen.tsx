import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

// ── 시간 옵션 (00:00 ~ 23:30, 30분 단위) ──────────────────────────────────
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

// ── TimePicker 컴포넌트 ───────────────────────────────────────────────────
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

// ── 상수 ──────────────────────────────────────────────────────────────────
const DAY_TABS = ['월', '화', '수', '목', '금', '토', '일'];

const ALL_EMPLOYEES = [
  { id: '1', name: '이주하' },
  { id: '2', name: '김주영' },
  { id: '3', name: '이하은' },
  { id: '4', name: '정규람' },
  { id: '5', name: '노민혁' },
];

type ScheduleEntry = { name: string; startTime: string; endTime: string };

const DEFAULT_TIMES = Object.fromEntries(
  ALL_EMPLOYEES.map(e => [e.id, { start: '09:00', end: '18:00' }])
);

// ── Screen ────────────────────────────────────────────────────────────────
export default function FixedScheduleScreen() {
  const navigation = useNavigation();

  const [activeDay, setActiveDay] = useState('월');
  const [mode, setMode] = useState<'view' | 'input'>('view');
  const [scheduleData, setScheduleData] = useState<Record<string, ScheduleEntry[]>>({});
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [times, setTimes] = useState<Record<string, { start: string; end: string }>>(DEFAULT_TIMES);

  const dayData = scheduleData[activeDay] ?? [];
  const hasData = dayData.length > 0;

  // 요일 전환 시 조회 모드로 복귀
  const selectDay = (day: string) => {
    setActiveDay(day);
    setMode('view');
  };

  const toggleCheck = (id: string) =>
    setCheckedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const setTime = (empId: string, field: 'start' | 'end', val: string) =>
    setTimes(prev => ({ ...prev, [empId]: { ...prev[empId], [field]: val } }));

  // 추가하기: 빈 상태로 입력 모드 진입
  const handleAddStart = () => {
    setCheckedIds([]);
    setTimes({ ...DEFAULT_TIMES });
    setMode('input');
  };

  // 수정하기: 기존 데이터를 세팅한 상태로 입력 모드 진입
  const handleEditStart = () => {
    const newChecked: string[] = [];
    const newTimes = { ...DEFAULT_TIMES };
    dayData.forEach(entry => {
      const emp = ALL_EMPLOYEES.find(e => e.name === entry.name);
      if (emp) {
        newChecked.push(emp.id);
        newTimes[emp.id] = { start: entry.startTime, end: entry.endTime };
      }
    });
    setCheckedIds(newChecked);
    setTimes(newTimes);
    setMode('input');
  };

  // 입력 완료: 저장 후 조회 모드로 전환
  const handleSave = () => {
    const entries: ScheduleEntry[] = checkedIds.map(id => {
      const emp = ALL_EMPLOYEES.find(e => e.id === id)!;
      return { name: emp.name, startTime: times[id].start, endTime: times[id].end };
    });
    setScheduleData(prev => ({ ...prev, [activeDay]: entries }));
    setMode('view');
  };

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
            {DAY_TABS.map(day => {
              const active = day === activeDay;
              return (
                <TouchableOpacity
                  key={day}
                  style={[s.dayTag, active && s.dayTagActive]}
                  onPress={() => selectDay(day)}
                  activeOpacity={0.7}
                >
                  <Text style={[s.dayTagText, active && s.dayTagTextActive]}>{day}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── 상태 1: 빈 화면 ── */}
        {mode === 'view' && !hasData && (
          <View style={s.emptyArea} />
        )}

        {/* ── 상태 2: 입력 모드 ── */}
        {mode === 'input' && (
          <View style={s.list}>
            {ALL_EMPLOYEES.map(emp => {
              const checked = checkedIds.includes(emp.id);
              return (
                <View key={emp.id}>
                  <View style={s.employeeRow}>
                    <Text style={s.employeeName}>{emp.name}</Text>
                    <TouchableOpacity
                      style={[s.checkbox, checked && s.checkboxChecked]}
                      onPress={() => toggleCheck(emp.id)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      {checked && <MaterialIcons name="check" size={14} color="#FFFFFF" />}
                    </TouchableOpacity>
                  </View>

                  {checked && (
                    <View style={s.timeRow}>
                      <TimePicker value={times[emp.id].start} onChange={v => setTime(emp.id, 'start', v)} />
                      <Text style={s.timeSep}>~</Text>
                      <TimePicker value={times[emp.id].end} onChange={v => setTime(emp.id, 'end', v)} />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* ── 상태 3: 조회 모드 (데이터 있음) ── */}
        {mode === 'view' && hasData && (
          <View style={s.list}>
            {dayData.map((entry, idx) => (
              <View key={idx} style={s.viewCard}>
                <Text style={s.viewName}>{entry.name}</Text>
                <Text style={s.viewTime}>{entry.startTime} - {entry.endTime}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={s.footer}>
        {/* 상태 1: 추가하기 */}
        {mode === 'view' && !hasData && (
          <TouchableOpacity style={s.actionBtn} onPress={handleAddStart} activeOpacity={0.85}>
            <Text style={s.actionBtnText}>추가하기</Text>
            <MaterialIcons name="edit" size={18} color="#FFFFFF" style={s.btnIcon} />
          </TouchableOpacity>
        )}

        {/* 상태 2: 입력 완료 */}
        {mode === 'input' && (
          <TouchableOpacity style={s.actionBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={s.actionBtnText}>입력 완료</Text>
          </TouchableOpacity>
        )}

        {/* 상태 3: 수정하기 */}
        {mode === 'view' && hasData && (
          <TouchableOpacity style={s.actionBtn} onPress={handleEditStart} activeOpacity={0.85}>
            <Text style={s.actionBtnText}>수정하기</Text>
            <MaterialIcons name="edit" size={18} color="#FFFFFF" style={s.btnIcon} />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },

  /* 헤더 */
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: 36 },
  backArrow: { fontSize: 22, color: '#1A1A1A' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', color: '#000000' },

  /* ScrollView */
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24, gap: 20 },

  /* 요일 선택 */
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

  /* 빈 영역 (상태 1) */
  emptyArea: { height: 120 },

  /* 직원 리스트 공통 */
  list: { gap: 10 },

  /* 입력 모드 - 직원 행 */
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

  /* 시간 입력 행 */
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  timeBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#E9F1FF', borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  timeText: { fontSize: 16, color: '#000000', fontWeight: '500' },
  timeArrow: { fontSize: 10, color: '#9C9C9C' },
  timeSep: { fontSize: 20, color: '#000000' },

  /* 조회 모드 - 직원 카드 (상태 3) */
  viewCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#E9F1FF', borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FFFFFF',
  },
  viewName: { fontSize: 13, color: '#848A94' },
  viewTime: { fontSize: 14, color: '#848A94' },

  /* 시간 피커 */
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  pickerBox: {
    width: 160, maxHeight: 300,
    backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  pickerItem: { height: 44, alignItems: 'center', justifyContent: 'center' },
  pickerItemSel: { backgroundColor: '#FFF0E5' },
  pickerItemText: { fontSize: 16, color: '#1A1A1A' },
  pickerItemTextSel: { color: '#FF8D28', fontWeight: '700' },

  /* 하단 버튼 */
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
