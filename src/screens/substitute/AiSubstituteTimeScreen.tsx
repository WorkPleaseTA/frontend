import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';

// ── Constants ──────────────────────────────────────────────────────────────

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

const TIMES: string[] = [];
for (let h = 0; h < 24; h++) {
  TIMES.push(`${String(h).padStart(2, '0')}:00`);
  TIMES.push(`${String(h).padStart(2, '0')}:30`);
}

// ── Inline time dropdown ───────────────────────────────────────────────────

function TimeDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={td.wrap}>
      <TouchableOpacity
        style={[td.btn, open && td.btnOpen]}
        onPress={() => setOpen((o) => !o)}
        activeOpacity={0.8}
      >
        <Text style={td.btnText}>{value}</Text>
        <Text style={td.arrow}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={td.menu}>
          <ScrollView style={td.scroll} showsVerticalScrollIndicator={false} nestedScrollEnabled>
            {TIMES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[td.option, t === value && td.optionActive]}
                onPress={() => { onChange(t); setOpen(false); }}
              >
                <Text style={[td.optionText, t === value && td.optionTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const td = StyleSheet.create({
  wrap: { flex: 1, position: 'relative', zIndex: 20 },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F5F5F5', borderRadius: 8, borderWidth: 1.5,
    borderColor: '#E8E8E8', paddingHorizontal: 10, paddingVertical: 9,
  },
  btnOpen: { borderColor: Colors.primary, backgroundColor: '#FFF9F5' },
  btnText: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  arrow: { fontSize: 8, color: '#AAAAAA' },
  menu: {
    position: 'absolute', top: 44, left: 0, right: 0, zIndex: 30,
    backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14, shadowRadius: 10, elevation: 10,
  },
  scroll: { maxHeight: 160 },
  option: { paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center' },
  optionActive: { backgroundColor: '#FFF4EE' },
  optionText: { fontSize: 13, color: '#555555' },
  optionTextActive: { color: Colors.primary, fontWeight: '700' },
});

// ── Main (center modal popup) ──────────────────────────────────────────────

export default function AiSubstituteTimeScreen() {
  const navigation = useNavigation();

  const [selectedDays, setSelectedDays] = useState<number[]>([0, 2, 4]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime,   setEndTime]   = useState('18:00');

  const toggleDay = (i: number) =>
    setSelectedDays((prev) =>
      prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i]
    );

  const handleConfirm = () => {
    if (selectedDays.length === 0) {
      Alert.alert('요일 선택', '최소 하나의 요일을 선택하세요.');
      return;
    }
    if (startTime >= endTime) {
      Alert.alert('시간 오류', '종료 시간이 시작 시간보다 늦어야 합니다.');
      return;
    }
    Alert.alert('저장 완료', '대타 가능 시간대가 저장되었습니다.', [
      { text: '확인', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    /* Dimmed backdrop — tap outside to close */
    <Pressable style={s.backdrop} onPress={() => navigation.goBack()}>
      {/* Center popup card — stop propagation */}
      <Pressable style={s.card} onPress={() => {}}>

        {/* Title */}
        <View style={s.titleRow}>
          <Text style={s.titleIcon}>🕐</Text>
          <Text style={s.title}>대타 가능 시간대</Text>
        </View>
        <Text style={s.subtitle}>요일과 시간대를 선택하세요.</Text>

        {/* ── 요일 버튼 ── */}
        <View style={s.section}>
          <Text style={s.label}>요일</Text>
          <View style={s.dayRow}>
            {DAYS.map((d, i) => {
              const active = selectedDays.includes(i);
              return (
                <TouchableOpacity
                  key={d}
                  style={[s.dayBtn, active && s.dayBtnActive]}
                  onPress={() => toggleDay(i)}
                  activeOpacity={0.75}
                >
                  <Text style={[s.dayText, active && s.dayTextActive]}>{d}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── 시간 드롭다운 (한 줄) ── */}
        <View style={[s.section, { zIndex: 20 }]}>
          <Text style={s.label}>시간</Text>
          <View style={s.timeRow}>
            <TimeDropdown value={startTime} onChange={setStartTime} />
            <Text style={s.tilde}>~</Text>
            <TimeDropdown value={endTime} onChange={setEndTime} />
          </View>
        </View>

        {/* ── 버튼 ── */}
        <View style={s.btnRow}>
          <TouchableOpacity style={s.cancelBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Text style={s.cancelText}>이전</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
            <Text style={s.confirmText}>확인</Text>
          </TouchableOpacity>
        </View>

      </Pressable>
    </Pressable>
  );
}

const s = StyleSheet.create({
  /* Dimmed overlay — fills the whole screen */
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  /* White rounded popup card */
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },

  titleRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 7,
  },
  titleIcon: { fontSize: 20 },
  title: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  subtitle: {
    fontSize: 12, color: '#BBBBBB',
    textAlign: 'center', marginTop: -10,
  },

  section: { gap: 8 },
  label: { fontSize: 12, fontWeight: '700', color: '#666666' },

  /* Day buttons — compact */
  dayRow: { flexDirection: 'row', gap: 4 },
  dayBtn: {
    flex: 1, height: 36, borderRadius: 8,
    backgroundColor: '#F2F2F2',
    alignItems: 'center', justifyContent: 'center',
  },
  dayBtnActive: { backgroundColor: Colors.primary },
  dayText: { fontSize: 12, fontWeight: '700', color: '#BBBBBB' },
  dayTextActive: { color: '#FFFFFF' },

  /* Time row — single line */
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tilde: { fontSize: 18, color: '#CCCCCC', fontWeight: '300' },

  /* Buttons */
  btnRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  cancelBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#E8E8E8',
    borderRadius: 10, paddingVertical: 12, alignItems: 'center',
    backgroundColor: '#F7F7F7',
  },
  cancelText: { fontSize: 14, fontWeight: '700', color: '#888888' },
  confirmBtn: {
    flex: 1, backgroundColor: Colors.primary,
    borderRadius: 10, paddingVertical: 12, alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  confirmText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});
