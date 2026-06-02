import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../constants/colors';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ── Mock data ──────────────────────────────────────────────────────────────

const TODOS = [
  { id: '1', text: '오전 9시 물류 정리',                done: true  },
  { id: '2', text: '오후 3시 쿠팡 택배 및 냉장고 정리',  done: true  },
  { id: '3', text: '딸기베이스 채우기',                 done: true  },
  { id: '4', text: '오후 5시 10명 단체 손님',            done: false },
];

// ── Screen ─────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [todos, setTodos] = useState(TODOS);

  const toggle = (id: string) =>
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );

  return (
    <SafeAreaView style={s.safe}>

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.infoBtn} activeOpacity={0.7}>
          <Text style={s.infoBtnText}>i</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Home</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* ── 인사말 ── */}
        <View style={s.greetingRow}>
          <View>
            <Text style={s.greetingName}>강다은님,</Text>
            <Text style={s.greetingMsg}>좋은 아침입니다 🙌</Text>
          </View>
          <View style={s.dotsCol}>
            <View style={s.dotLg} />
            <View style={s.dotSm} />
          </View>
        </View>

        {/* ── 내 스케줄 관리 ── */}
        <View style={s.section}>
          <TouchableOpacity
            style={s.sectionHeader}
            onPress={() => navigation.navigate('TodaySchedule')}
            activeOpacity={0.7}
          >
            <Text style={s.sectionTitle}>내 스케줄 관리</Text>
            <Text style={s.sectionArrow}>›</Text>
          </TouchableOpacity>

          <View style={s.scheduleCard}>
            <View style={s.logoCircle}>
              <Text style={s.logoText}>☕</Text>
            </View>
            <View style={s.scheduleTextCol}>
              <Text style={s.scheduleTime}>8:00 ~ 12:00</Text>
              <Text style={s.scheduleCafe}>일해조 카페</Text>
            </View>
          </View>
        </View>

        {/* ── 오늘의 업무 ── */}
        <View style={s.section}>
          <TouchableOpacity
            style={s.sectionHeader}
            onPress={() => navigation.navigate('ToDoList')}
            activeOpacity={0.7}
          >
            <Text style={s.sectionTitle}>오늘의 업무</Text>
            <Text style={s.sectionArrow}>›</Text>
          </TouchableOpacity>

          <View style={s.todoCard}>
            {todos.map((item, idx) => (
              <React.Fragment key={item.id}>
                {idx > 0 && <View style={s.divider} />}
                <TouchableOpacity
                  style={s.todoRow}
                  onPress={() => toggle(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={[s.checkbox, item.done && s.checkboxDone]}>
                    {item.done && <Text style={s.checkmark}>✓</Text>}
                  </View>
                  <Text style={s.todoText}>{item.text}</Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const BLUE = '#4A90D9';

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },

  /* Header */
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  infoBtn: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 2, borderColor: '#1A1A1A',
    alignItems: 'center', justifyContent: 'center',
  },
  infoBtnText: { fontSize: 13, fontWeight: '800', color: '#1A1A1A' },
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontSize: 20, fontWeight: '500', color: '#000000',
  },

  /* ScrollView */
  scroll: { padding: 20, gap: 28, paddingBottom: 40 },

  /* 인사말 */
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  greetingName: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', lineHeight: 36 },
  greetingMsg:  { fontSize: 28, fontWeight: '800', color: '#1A1A1A', lineHeight: 36 },
  dotsCol:  { gap: 6, marginTop: 6, alignItems: 'flex-end' },
  dotLg:    { width: 14, height: 14, borderRadius: 7,  backgroundColor: BLUE },
  dotSm:    { width: 9,  height: 9,  borderRadius: 4.5, backgroundColor: BLUE, opacity: 0.45 },

  /* 섹션 공통 */
  section:       { gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle:  { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  sectionArrow:  { fontSize: 22, color: '#BBBBBB', lineHeight: 24 },

  /* 스케줄 카드 */
  scheduleCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16, padding: 18,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  logoCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  logoText:      { fontSize: 24 },
  scheduleTextCol: { flex: 1 },
  scheduleTime:  { fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
  scheduleCafe:  { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontWeight: '500' },

  /* 업무 카드 */
  todoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  divider:  { height: 1, backgroundColor: '#F2F2F2', marginHorizontal: 16 },
  todoRow:  {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, paddingHorizontal: 16, paddingVertical: 14,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: '#DDDDDD',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  checkboxDone: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkmark:    { fontSize: 12, color: '#FFFFFF', fontWeight: '800' },
  todoText:     { flex: 1, fontSize: 14, color: '#1A1A1A', lineHeight: 20 },
});
