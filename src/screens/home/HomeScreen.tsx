import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../navigation/AppNavigator';
import { MaterialIcons } from '@expo/vector-icons';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

// ── Mock data ──────────────────────────────────────────────────────────────

interface ScheduleItem {
  id: string;
  name: string;
  time: string;
  active: boolean;
}

const SCHEDULE_DATA: ScheduleItem[] = [
  { id: '1', name: '이주하', time: '08:00 - 09:00', active: false },
  { id: '2', name: '김주영', time: '08:30 - 17:30', active: false },
  { id: '3', name: '이하은', time: '13:00 - 20:00', active: true },
  { id: '4', name: '정규람', time: '13:00 - 18:00', active: true },
  { id: '5', name: '노민혁', time: '18:00 - 23:00', active: false },
];

const TODO_DATA = [
  { id: '1', text: '오전 9시 물류 정리' },
  { id: '2', text: '오후 3시 쿠팡 택배 및 냉장고 정리' },
];

// ── Component ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [date, setDate] = useState(new Date(2026, 4, 9));
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  const formatDate = () => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}. ${m}. ${d}`;
  };

  const changeDate = (delta: number) => {
    setDate(prev => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta);
      return next;
    });
  };

  const toggleCheck = (id: string) =>
    setCheckedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  return (
    <SafeAreaView style={s.safe}>
      {/* ── 상단 헤더 ── */}
      <View style={s.topHeader}>
        <TouchableOpacity
          style={s.infoBtn}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('StoreManagement')}
        >
          <Text style={s.infoBtnText}>i</Text>
        </TouchableOpacity>
        <Text style={s.topTitle}>Home</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* ── 날짜 네비게이터 ── */}
      <View style={s.dateRow}>
        <TouchableOpacity
          onPress={() => changeDate(-1)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={s.arrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.dateText}>{formatDate()}</Text>
        <TouchableOpacity
          onPress={() => changeDate(1)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={s.arrow}>→</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* ── 오늘의 스케줄 ── */}
        <View style={s.section}>
          <TouchableOpacity
            style={s.sectionHeader}
            onPress={() => navigation.navigate('Calendar')}
            activeOpacity={0.7}
          >
            <Text style={s.sectionTitle}>오늘의 스케줄</Text>
            <Text style={s.sectionArrow}>›</Text>
          </TouchableOpacity>

          <View style={s.cardList}>
            {SCHEDULE_DATA.map((item, idx) => (
              <View
                key={item.id}
                style={[s.scheduleCard, item.active && s.scheduleCardActive]}
              >
                <Text style={[s.scheduleText, item.active && s.scheduleTextActive]}>
                  {item.name}
                </Text>
                <Text style={[s.scheduleText, item.active && s.scheduleTextActive]}>
                  {item.time}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── 오늘의 스케줄 변동 ── */}
        <View style={s.section}>
          <TouchableOpacity style={s.sectionHeader} activeOpacity={0.7}>
            <Text style={s.sectionTitle}>오늘의 스케줄 변동</Text>
            <Text style={s.sectionArrow}>›</Text>
          </TouchableOpacity>

          <View style={s.substituteCard}>
            <Text style={s.subTime}>08:00 ~ 09:00</Text>

            <View style={s.subPerson}>
              <Text style={s.subLabel}>결근자</Text>
              <Text style={s.subName}>정미희</Text>
            </View>

            <View style={s.subDivider} />

            <View style={s.subPerson}>
              <Text style={s.subLabel}>대체자</Text>
              <Text style={s.subName}>이주하</Text>
            </View>
          </View>
        </View>

        {/* ── 오늘의 할 일 ── */}
        <View style={s.section}>
          <TouchableOpacity style={s.sectionHeader} activeOpacity={0.7}>
            <Text style={s.sectionTitle}>오늘의 할 일</Text>
            <Text style={s.sectionArrow}>›</Text>
          </TouchableOpacity>

          <View style={s.cardList}>
            {TODO_DATA.map(item => {
              const done = checkedIds.includes(item.id);
              return (
                <View key={item.id} style={s.todoCard}>
                  <Text style={s.todoText}>{item.text}</Text>
                  <TouchableOpacity
                    style={[s.checkbox, done && s.checkboxDone]}
                    onPress={() => toggleCheck(item.id)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    {done && <MaterialIcons name="check" size={14} color="#FFFFFF" />}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },

  /* 상단 헤더 */
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  infoBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBtnText: { fontSize: 13, fontWeight: '800', color: '#1A1A1A' },
  topTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '500',
    color: '#000000',
  },

  /* 날짜 네비게이터 */
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 20,
  },
  arrow: { fontSize: 18, color: '#61656C' },
  dateText: { fontSize: 25, fontWeight: '600', color: '#000000' },

  /* ScrollView */
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 20,
  },

  /* 섹션 공통 */
  section: { gap: 10 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#000000' },
  sectionArrow: { fontSize: 18, color: '#AAAAAA' },
  cardList: { gap: 8 },

  /* 스케줄 카드 */
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E9F1FF',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  scheduleCardActive: {
    backgroundColor: '#FF8D28',
    borderColor: '#FF8D28',
  },
  scheduleText: { fontSize: 13, color: '#61656C' },
  scheduleTextActive: { color: '#FFFFFF' },

  /* 스케줄 변동 카드 */
  substituteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E9F1FF',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  subTime: { fontSize: 12, color: '#757575', flex: 1 },
  subPerson: { alignItems: 'center', gap: 2 },
  subLabel: { fontSize: 10, color: '#FF8D28' },
  subName: { fontSize: 14, fontWeight: '500', color: '#1A1A1A' },
  subDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E9F1FF',
  },

  /* 할 일 카드 */
  todoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E9F1FF',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  todoText: { flex: 1, fontSize: 14, color: '#61656C', marginRight: 12 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E6E6E6',
    backgroundColor: '#E6E6E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: '#FF8D28',
    borderColor: '#FF8D28',
  },
});
