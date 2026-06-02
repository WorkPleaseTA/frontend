import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CalendarStackParamList } from '../navigation/AppNavigator';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

type Nav = NativeStackNavigationProp<CalendarStackParamList>;

// ── Constants ──────────────────────────────────────────────────────────────

const TODAY = new Date();
const THIS_YEAR = TODAY.getFullYear();
const THIS_MONTH = TODAY.getMonth();
const TODAY_DATE = TODAY.getDate();

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTH_NAMES = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
];

function key(year: number, month: number, day: number) {
  return `${year}-${month + 1}-${day}`;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

// ── Mock data ──────────────────────────────────────────────────────────────

type Shift = { start: string; end: string };
type Employee = { id: string; name: string; shifts: Record<string, Shift | null> };

const EMPLOYEES: Employee[] = [
  {
    id: '1', name: '홍길동',
    shifts: {
      [key(THIS_YEAR, THIS_MONTH, TODAY_DATE)]: { start: '09:00', end: '18:00' },
      [key(THIS_YEAR, THIS_MONTH, TODAY_DATE + 1)]: { start: '10:00', end: '19:00' },
      [key(THIS_YEAR, THIS_MONTH, TODAY_DATE + 3)]: { start: '09:00', end: '15:00' },
    },
  },
  {
    id: '2', name: '김매니저',
    shifts: {
      [key(THIS_YEAR, THIS_MONTH, TODAY_DATE)]: { start: '08:00', end: '17:00' },
      [key(THIS_YEAR, THIS_MONTH, TODAY_DATE + 2)]: { start: '12:00', end: '21:00' },
      [key(THIS_YEAR, THIS_MONTH, TODAY_DATE + 4)]: { start: '09:00', end: '18:00' },
    },
  },
  {
    id: '3', name: '이바리스타',
    shifts: {
      [key(THIS_YEAR, THIS_MONTH, TODAY_DATE + 1)]: { start: '07:00', end: '14:00' },
      [key(THIS_YEAR, THIS_MONTH, TODAY_DATE + 2)]: { start: '14:00', end: '22:00' },
      [key(THIS_YEAR, THIS_MONTH, TODAY_DATE + 5)]: { start: '09:00', end: '18:00' },
    },
  },
  {
    id: '4', name: '박알바',
    shifts: {
      [key(THIS_YEAR, THIS_MONTH, TODAY_DATE)]: { start: '13:00', end: '22:00' },
      [key(THIS_YEAR, THIS_MONTH, TODAY_DATE + 3)]: { start: '09:00', end: '18:00' },
      [key(THIS_YEAR, THIS_MONTH, TODAY_DATE + 6)]: { start: '10:00', end: '17:00' },
    },
  },
  {
    id: '5', name: '최직원',
    shifts: {
      [key(THIS_YEAR, THIS_MONTH, TODAY_DATE + 1)]: { start: '09:00', end: '18:00' },
      [key(THIS_YEAR, THIS_MONTH, TODAY_DATE + 4)]: { start: '11:00', end: '20:00' },
    },
  },
];

// ── Calendar card ──────────────────────────────────────────────────────────

function CalendarCard({
  year,
  month,
  selectedDay,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
}: {
  year: number;
  month: number;
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}) {
  const totalDays = daysInMonth(year, month);
  const startOffset = firstDayOfWeek(year, month);

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  const isCurrentMonth = year === THIS_YEAR && month === THIS_MONTH;

  return (
    <View style={calStyles.card}>
      {/* Month navigation */}
      <View style={calStyles.navRow}>
        <TouchableOpacity onPress={onPrevMonth} hitSlop={10} style={calStyles.navBtn}>
          <Text style={calStyles.navArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={calStyles.monthLabel}>
          {year}년 {MONTH_NAMES[month]}
        </Text>
        <TouchableOpacity onPress={onNextMonth} hitSlop={10} style={calStyles.navBtn}>
          <Text style={calStyles.navArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Weekday headers */}
      <View style={calStyles.weekRow}>
        {WEEKDAYS.map((d, i) => (
          <Text
            key={d}
            style={[
              calStyles.weekDay,
              i === 0 && calStyles.sunday,
              i === 6 && calStyles.saturday,
            ]}
          >
            {d}
          </Text>
        ))}
      </View>

      {/* Date grid */}
      {rows.map((row, ri) => (
        <View key={ri} style={calStyles.row}>
          {row.map((day, ci) => {
            if (!day) return <View key={ci} style={calStyles.cell} />;
            const isToday = isCurrentMonth && day === TODAY_DATE;
            const isSelected = day === selectedDay;
            return (
              <TouchableOpacity
                key={ci}
                style={calStyles.cell}
                onPress={() => onSelectDay(day)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    calStyles.dayCircle,
                    isToday && calStyles.todayCircle,
                    isSelected && !isToday && calStyles.selectedCircle,
                  ]}
                >
                  <Text
                    style={[
                      calStyles.dayText,
                      ci === 0 && calStyles.sundayText,
                      ci === 6 && calStyles.saturdayText,
                      (isToday || isSelected) && calStyles.highlightText,
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const calStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  navBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  navArrow: { fontSize: 26, color: Colors.primary, lineHeight: 30 },
  monthLabel: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#AAAAAA',
    paddingVertical: 4,
  },
  sunday: { color: '#E05555' },
  saturday: { color: '#4A90D9' },
  row: { flexDirection: 'row' },
  cell: { flex: 1, alignItems: 'center', paddingVertical: 3 },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCircle: { backgroundColor: Colors.primary },
  selectedCircle: { backgroundColor: '#FFE5D0' },
  dayText: { fontSize: 14, color: '#1A1A1A' },
  sundayText: { color: '#E05555' },
  saturdayText: { color: '#4A90D9' },
  highlightText: { color: '#FFFFFF', fontWeight: '700' },
});

// ── Employee cards (horizontal scroll) ─────────────────────────────────────

function EmployeeCards({
  year,
  month,
  selectedDay,
  selectedId,
  onSelect,
}: {
  year: number;
  month: number;
  selectedDay: number | null;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <View style={empStyles.section}>
      <Text style={empStyles.sectionTitle}>직원 근무 현황</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={empStyles.scrollContent}
      >
        {EMPLOYEES.map((emp) => {
          const shift = selectedDay
            ? emp.shifts[key(year, month, selectedDay)]
            : null;
          const selected = emp.id === selectedId;

          return (
            <TouchableOpacity
              key={emp.id}
              style={[empStyles.card, selected && empStyles.cardSelected]}
              onPress={() => onSelect(emp.id)}
              activeOpacity={0.8}
            >
              {/* Avatar circle */}
              <View style={[empStyles.avatar, selected && empStyles.avatarSelected]}>
                <Text style={[empStyles.avatarText, selected && empStyles.avatarTextSelected]}>
                  {emp.name[0]}
                </Text>
              </View>

              {/* Name */}
              <Text style={[empStyles.name, selected && empStyles.nameSelected]}>
                {emp.name}
              </Text>

              {/* Shift time or 휴무 */}
              {shift ? (
                <View style={empStyles.timeWrap}>
                  <Text style={[empStyles.time, selected && empStyles.timeSelected]}>
                    {shift.start}
                  </Text>
                  <Text style={[empStyles.timeDivider, selected && empStyles.timeSelected]}>
                    /
                  </Text>
                  <Text style={[empStyles.time, selected && empStyles.timeSelected]}>
                    {shift.end}
                  </Text>
                </View>
              ) : (
                <Text style={[empStyles.offText, selected && empStyles.offTextSelected]}>
                  휴무
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const empStyles = StyleSheet.create({
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 10,
    paddingBottom: 4,
  },
  card: {
    width: 90,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardSelected: {
    backgroundColor: Colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFE5D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSelected: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  avatarTextSelected: {
    color: '#FFFFFF',
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  nameSelected: {
    color: '#FFFFFF',
  },
  timeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  time: {
    fontSize: 11,
    fontWeight: '500',
    color: '#888888',
  },
  timeSelected: {
    color: 'rgba(255,255,255,0.85)',
  },
  timeDivider: {
    fontSize: 10,
    color: '#BBBBBB',
  },
  offText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#BBBBBB',
  },
  offTextSelected: {
    color: 'rgba(255,255,255,0.7)',
  },
});

// ── Main screen ────────────────────────────────────────────────────────────

export default function CalendarScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute();
  const isManager = (route.params as any)?.isManager === true;
  const [year, setYear] = useState(THIS_YEAR);
  const [month, setMonth] = useState(THIS_MONTH);
  const [selectedDay, setSelectedDay] = useState<number | null>(TODAY_DATE);
  const [selectedEmployee, setSelectedEmployee] = useState(EMPLOYEES[0].id);

  const prevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>캘린더</Text>
        {isManager && (
          <TouchableOpacity
            onPress={() => navigation.navigate('FixedSchedule')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="edit" size={20} color="#FF8D28" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Calendar card */}
        <CalendarCard
          year={year}
          month={month}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
        />

        {/* Employee cards */}
        <EmployeeCards
          year={year}
          month={month}
          selectedDay={selectedDay}
          selectedId={selectedEmployee}
          onSelect={setSelectedEmployee}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F4F8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F4F4F8',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
});
