import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../constants/colors';
import { BottomTabBarStatic } from '../../components/BottomTabBar';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ── Constants ──────────────────────────────────────────────────────────────

const TIMES_12H: string[] = [];
for (let h = 0; h < 24; h++) {
  const ampm = h < 12 ? 'AM' : 'PM';
  const h12  = h % 12 === 0 ? 12 : h % 12;
  TIMES_12H.push(`${h12}:00 ${ampm}`);
  TIMES_12H.push(`${h12}:30 ${ampm}`);
}

const ALL_WORKERS = [
  { id: '1', name: '김희영', color: '#5B9BD5' },
  { id: '2', name: '홍지희', color: '#7B68EE' },
  { id: '3', name: '정혜영', color: '#52B788' },
  { id: '4', name: '정유나', color: '#E07070' },
];

// ── Time dropdown ──────────────────────────────────────────────────────────

function TimeDropdown({
  value,
  onSelect,
  placeholder,
}: {
  value: string;
  onSelect: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={td.wrap}>
      <TouchableOpacity
        style={[td.btn, open && td.btnOpen]}
        onPress={() => setOpen((o) => !o)}
        activeOpacity={0.8}
      >
        <Text style={[td.btnText, !value && td.placeholder]}>
          {value || placeholder || '선택'}
        </Text>
        <Text style={td.arrow}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={td.menu}>
          <ScrollView style={td.scroll} showsVerticalScrollIndicator={false} nestedScrollEnabled>
            {TIMES_12H.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[td.option, opt === value && td.optionActive]}
                onPress={() => { onSelect(opt); setOpen(false); }}
              >
                <Text style={[td.optionText, opt === value && td.optionTextActive]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const td = StyleSheet.create({
  wrap: { flex: 1, position: 'relative', zIndex: 10 },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1,
    borderColor: '#E5E5E5', paddingHorizontal: 12, paddingVertical: 12,
  },
  btnOpen: { borderColor: Colors.primary },
  btnText: { fontSize: 13, color: '#1A1A1A', fontWeight: '500' },
  placeholder: { color: '#BBBBBB' },
  arrow: { fontSize: 9, color: '#AAAAAA' },
  menu: {
    position: 'absolute', top: 48, left: 0, right: 0, zIndex: 20,
    backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 6,
  },
  scroll: { maxHeight: 180 },
  option: { paddingHorizontal: 14, paddingVertical: 11 },
  optionActive: { backgroundColor: '#FFF4EE' },
  optionText: { fontSize: 13, color: '#444444' },
  optionTextActive: { color: Colors.primary, fontWeight: '700' },
});

// ── Main screen ────────────────────────────────────────────────────────────

export default function SubstituteFailScreen() {
  const navigation = useNavigation<Nav>();

  const [message,    setMessage]   = useState('자격증 시험 때문에 대타 요청드립니다ㅜㅜ');
  const [selected,   setSelected]  = useState<Set<string>>(new Set());
  const [startTime,  setStart]     = useState('8:00 AM');
  const [endTime,    setEnd]       = useState('12:00 PM');

  const allFilled = message.trim() && selected.size > 0 && startTime && endTime;

  const toggleWorker = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleSend = () => {
    Alert.alert('전송 완료', '대타 요청이 전송되었습니다.', [
      { text: '확인', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={s.backBtn}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>대타 요청</Text>
        <View style={s.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* 대타 요청 메시지 작성 */}
        <View style={s.section}>
          <Text style={s.label}>대타 요청 메시지 작성</Text>
          <TextInput
            style={s.messageInput}
            placeholder="내용을 입력하세요"
            placeholderTextColor="#BBBBBB"
            value={message}
            onChangeText={setMessage}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* 가능한 근무자 */}
        <View style={s.section}>
          <Text style={s.label}>가능한 근무자</Text>
          <View style={s.workersRow}>
            {ALL_WORKERS.map((w) => {
              const isSelected = selected.has(w.id);
              return (
                <TouchableOpacity
                  key={w.id}
                  style={[s.workerBubble, isSelected && s.workerBubbleSelected]}
                  onPress={() => toggleWorker(w.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.workerInitial, isSelected && s.workerInitialSelected]}>
                    {w.name[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={s.workerNamesRow}>
            {ALL_WORKERS.map((w) => (
              <Text key={w.id} style={s.workerName}>{w.name}</Text>
            ))}
          </View>
        </View>

        {/* 근무일자 */}
        <View style={s.section}>
          <Text style={s.label}>근무일자</Text>
          <View style={s.dateBox}>
            <Text style={s.dateText}>2026년 5월 22일</Text>
          </View>
        </View>

        {/* 출근 / 퇴근 시간 */}
        <View style={[s.section, { zIndex: 15 }]}>
          <View style={s.timeRow}>
            <View style={s.timeCol}>
              <Text style={s.label}>출근 시간</Text>
              <TimeDropdown value={startTime} onSelect={setStart} placeholder="8:00 AM" />
            </View>
            <View style={s.timeCol}>
              <Text style={s.label}>퇴근 시간</Text>
              <TimeDropdown value={endTime} onSelect={setEnd} placeholder="12:00 PM" />
            </View>
          </View>
        </View>

        {/* 전송 버튼 */}
        <TouchableOpacity
          style={[s.sendBtn, !!allFilled && s.sendBtnActive]}
          activeOpacity={0.85}
          onPress={handleSend}
        >
          <Text style={[s.sendBtnText, !!allFilled && s.sendBtnTextActive]}>전송</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomTabBarStatic activeIndex={3} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: 36 },
  backArrow: { fontSize: 22, color: '#1A1A1A' },
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontSize: 17, fontWeight: '700', color: '#1A1A1A',
  },
  placeholder: { width: 36 },

  scroll: { padding: 20, gap: 22, paddingBottom: 48 },

  section: { gap: 10 },
  label: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },

  /* 메시지 */
  messageInput: {
    borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12,
    padding: 14, minHeight: 110, fontSize: 14, color: '#1A1A1A',
    backgroundColor: '#FAFAFA', lineHeight: 21,
  },

  /* 근무자 */
  workersRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  workerBubble: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#DDDDDD',
    alignItems: 'center', justifyContent: 'center',
  },
  workerBubbleSelected: { backgroundColor: '#4A90D9' },
  workerInitial: { fontSize: 16, fontWeight: '700', color: '#888888' },
  workerInitialSelected: { color: '#FFFFFF' },
  workerNamesRow: { flexDirection: 'row', gap: 10 },
  workerName: { width: 46, textAlign: 'center', fontSize: 10, color: '#888888', fontWeight: '500' },

  /* 근무일자 */
  dateBox: {
    borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 13, backgroundColor: '#FAFAFA',
  },
  dateText: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },

  /* 시간 */
  timeRow: { flexDirection: 'row', gap: 12 },
  timeCol: { flex: 1, gap: 6 },

  /* 전송 버튼 */
  sendBtn: {
    borderRadius: 12, paddingVertical: 15, alignItems: 'center',
    backgroundColor: '#E0E0E0', marginTop: 4,
  },
  sendBtnActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  sendBtnText: { fontSize: 15, fontWeight: '700', color: '#AAAAAA' },
  sendBtnTextActive: { color: '#FFFFFF' },
});
