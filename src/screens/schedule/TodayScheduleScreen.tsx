import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';

// ── Types ──────────────────────────────────────────────────────────────────

type Employee = {
  id: string;
  name: string;
  shifts: Record<string, { start: string; end: string } | null>;
};

// ── Mock data ──────────────────────────────────────────────────────────────

const TODAY = new Date();
const THIS_YEAR = TODAY.getFullYear();
const THIS_MONTH = TODAY.getMonth(); // 0-based
const TODAY_DATE = TODAY.getDate();

// Employees and their shifts per day (keyed as "YYYY-M-D")
function key(year: number, month: number, day: number) {
  return `${year}-${month + 1}-${day}`;
}

const EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: '홍길동',
    shifts: {
      [key(THIS_YEAR, THIS_MONTH, TODAY_DATE)]: { start: '09:00', end: '18:00' },
      [key(THIS_YEAR, THIS_MONTH, TODAY_DATE + 1)]: { start: '10:00', end: '19:00' },
      [key(THIS_YEAR, THIS_MONTH, TODAY_DATE + 3)]: { start: '09:00', end: '15:00' },
    },
  },
  {
    id: '2',
    name: '김매니저',
    shifts: {
      [key(THIS_YEAR, THIS_MONTH, TODAY_DATE)]: { start: '08:00', end: '17:00' },
      [key(THIS_YEAR, THIS_MONTH, TODAY_DATE + 2)]: { start: '12:00', end: '21:00' },
      [key(THIS_YEAR, THIS_MONTH, TODAY_DATE + 4)]: { start: '09:00', end: '18:00' },
    },
  },
  {
    id: '3',
    name: '이바리스타',
    shifts: {
      [key(THIS_YEAR, THIS_MONTH, TODAY_DATE + 1)]: { start: '07:00', end: '14:00' },
      [key(THIS_YEAR, THIS_MONTH, TODAY_DATE + 2)]: { start: '14:00', end: '22:00' },
      [key(THIS_YEAR, THIS_MONTH, TODAY_DATE + 5)]: { start: '09:00', end: '18:00' },
    },
  },
  {
    id: '4',
    name: '박알바',
    shifts: {
      [key(THIS_YEAR, THIS_MONTH, TODAY_DATE)]: { start: '13:00', end: '22:00' },
      [key(THIS_YEAR, THIS_MONTH, TODAY_DATE + 3)]: { start: '09:00', end: '18:00' },
      [key(THIS_YEAR, THIS_MONTH, TODAY_DATE + 6)]: { start: '10:00', end: '17:00' },
    },
  },
  {
    id: '5',
    name: '최직원',
    shifts: {
      [key(THIS_YEAR, THIS_MONTH, TODAY_DATE + 1)]: { start: '09:00', end: '18:00' },
      [key(THIS_YEAR, THIS_MONTH, TODAY_DATE + 4)]: { start: '11:00', end: '20:00' },
    },
  },
];

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const MONTH_NAMES = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

// ── Calendar ───────────────────────────────────────────────────────────────

function Calendar({
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

  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  const isCurrentMonth = year === THIS_YEAR && month === THIS_MONTH;

  return (
    <View style={calStyles.container}>
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
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrow: {
    fontSize: 26,
    color: '#444444',
    lineHeight: 30,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#888888',
    paddingVertical: 4,
  },
  sunday: { color: '#E05555' },
  saturday: { color: '#4A90D9' },
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 3,
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCircle: {
    backgroundColor: Colors.primary,
  },
  selectedCircle: {
    backgroundColor: '#FFE5D0',
  },
  dayText: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  sundayText: { color: '#E05555' },
  saturdayText: { color: '#4A90D9' },
  highlightText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

// ── Schedule grid (horizontal scroll) ─────────────────────────────────────

const CELL_WIDTH = 80;
const TIME_COL_W = 52;
const ROW_HEIGHT = 56;

function ScheduleGrid({
  year,
  month,
  selectedEmployee,
  onSelectEmployee,
}: {
  year: number;
  month: number;
  selectedEmployee: string;
  onSelectEmployee: (id: string) => void;
}) {
  const totalDays = daysInMonth(year, month);
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <View style={gridStyles.wrapper}>
      {/* Employee list (fixed left column) */}
      <View style={gridStyles.leftCol}>
        <View style={gridStyles.cornerCell} />
        {EMPLOYEES.map((emp) => {
          const selected = emp.id === selectedEmployee;
          return (
            <TouchableOpacity
              key={emp.id}
              style={[gridStyles.empCell, selected && gridStyles.empCellSelected]}
              onPress={() => onSelectEmployee(emp.id)}
              activeOpacity={0.8}
            >
              <Text
                style={[gridStyles.empName, selected && gridStyles.empNameSelected]}
                numberOfLines={1}
              >
                {emp.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Scrollable date columns */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Date header row */}
          <View style={gridStyles.dateHeaderRow}>
            {days.map((d) => {
              const dow = new Date(year, month, d).getDay();
              const isToday =
                year === THIS_YEAR && month === THIS_MONTH && d === TODAY_DATE;
              return (
                <View key={d} style={gridStyles.dateCell}>
                  <View style={[gridStyles.dateDot, isToday && gridStyles.dateDotToday]}>
                    <Text
                      style={[
                        gridStyles.dateNum,
                        dow === 0 && gridStyles.sundayText,
                        dow === 6 && gridStyles.saturdayText,
                        isToday && gridStyles.dateTodayText,
                      ]}
                    >
                      {d}
                    </Text>
                  </View>
                  <Text
                    style={[
                      gridStyles.dateDow,
                      dow === 0 && gridStyles.sundayText,
                      dow === 6 && gridStyles.saturdayText,
                    ]}
                  >
                    {WEEKDAYS[dow]}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Shift rows per employee */}
          {EMPLOYEES.map((emp) => {
            const selected = emp.id === selectedEmployee;
            return (
              <View key={emp.id} style={gridStyles.shiftRow}>
                {days.map((d) => {
                  const shift = emp.shifts[key(year, month, d)];
                  const isToday =
                    year === THIS_YEAR && month === THIS_MONTH && d === TODAY_DATE;
                  return (
                    <View
                      key={d}
                      style={[
                        gridStyles.shiftCell,
                        isToday && gridStyles.shiftCellToday,
                      ]}
                    >
                      {shift ? (
                        <View
                          style={[
                            gridStyles.shiftBlock,
                            selected && gridStyles.shiftBlockSelected,
                          ]}
                        >
                          <Text
                            style={[
                              gridStyles.shiftTime,
                              selected && gridStyles.shiftTimeSelected,
                            ]}
                            numberOfLines={1}
                          >
                            {shift.start}
                          </Text>
                          <Text
                            style={[
                              gridStyles.shiftTime,
                              selected && gridStyles.shiftTimeSelected,
                            ]}
                            numberOfLines={1}
                          >
                            {shift.end}
                          </Text>
                        </View>
                      ) : (
                        <View style={gridStyles.emptyCell} />
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const gridStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
  },
  leftCol: {
    width: TIME_COL_W,
    borderRightWidth: 1,
    borderRightColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
    zIndex: 1,
  },
  cornerCell: {
    height: ROW_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  empCell: {
    height: ROW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  empCellSelected: {
    backgroundColor: Colors.primary,
  },
  empName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444444',
    textAlign: 'center',
  },
  empNameSelected: {
    color: '#FFFFFF',
  },

  dateHeaderRow: {
    flexDirection: 'row',
    height: ROW_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  dateCell: {
    width: CELL_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRightWidth: 1,
    borderRightColor: '#F2F2F2',
  },
  dateDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDotToday: {
    backgroundColor: Colors.primary,
  },
  dateNum: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
  },
  dateTodayText: {
    color: '#FFFFFF',
  },
  dateDow: {
    fontSize: 10,
    color: '#AAAAAA',
  },
  sundayText: { color: '#E05555' },
  saturdayText: { color: '#4A90D9' },

  shiftRow: {
    flexDirection: 'row',
    height: ROW_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  shiftCell: {
    width: CELL_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#F2F2F2',
    paddingHorizontal: 4,
  },
  shiftCellToday: {
    backgroundColor: '#FFF8F5',
  },
  shiftBlock: {
    backgroundColor: '#FFE5D0',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 4,
    alignItems: 'center',
    width: CELL_WIDTH - 12,
  },
  shiftBlockSelected: {
    backgroundColor: Colors.primary,
  },
  shiftTime: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary,
    lineHeight: 14,
  },
  shiftTimeSelected: {
    color: '#FFFFFF',
  },
  emptyCell: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EEEEEE',
  },
});

// ── Main screen ────────────────────────────────────────────────────────────

export default function TodayScheduleScreen() {
  const navigation = useNavigation();

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

  // Shifts for selected employee on selected day
  const selEmp = EMPLOYEES.find((e) => e.id === selectedEmployee);
  const selShift = selectedDay
    ? selEmp?.shifts[key(year, month, selectedDay)]
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>스케줄</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Calendar */}
      <Calendar
        year={year}
        month={month}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        onPrevMonth={prevMonth}
        onNextMonth={nextMonth}
      />

      {/* Selected day summary */}
      {selectedDay && (
        <View style={styles.summaryBar}>
          <Text style={styles.summaryDate}>
            {month + 1}월 {selectedDay}일 ({WEEKDAYS[new Date(year, month, selectedDay).getDay()]})
          </Text>
          {selShift ? (
            <Text style={styles.summaryShift}>
              {selEmp?.name}  {selShift.start} – {selShift.end}
            </Text>
          ) : (
            <Text style={styles.summaryOff}>근무 없음</Text>
          )}
        </View>
      )}

      {/* Schedule grid */}
      <ScheduleGrid
        year={year}
        month={month}
        selectedEmployee={selectedEmployee}
        onSelectEmployee={setSelectedEmployee}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: 36 },
  backArrow: { fontSize: 22, color: '#1A1A1A' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  placeholder: { width: 36 },

  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFF8F5',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE5D0',
  },
  summaryDate: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  summaryShift: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  summaryOff: {
    fontSize: 13,
    color: '#AAAAAA',
  },
});
