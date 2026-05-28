import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Header from '../../components/Header';
import { BottomTabBarStatic } from '../../components/BottomTabBar';

interface Employee {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  highlight: boolean;
}

interface CalendarDay {
  date: number;
  type: 'prev' | 'current' | 'next';
}

const EMPLOYEE_DATA: Employee[] = [
  { id: '1', name: '이주하', startTime: '08:00', endTime: '09:00', highlight: false },
  { id: '2', name: '김주영', startTime: '08:30', endTime: '17:30', highlight: true },
  { id: '3', name: '이하은', startTime: '13:00', endTime: '20:00', highlight: false },
  { id: '4', name: '정규람', startTime: '13:00', endTime: '18:00', highlight: false },
  { id: '5', name: '노민혁', startTime: '18:00', endTime: '23:00', highlight: false },
  { id: '6', name: '최민호', startTime: '09:00', endTime: '15:00', highlight: false },
];

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function buildCalendarDays(year: number, month: number): CalendarDay[] {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: CalendarDay[] = [];

  for (let i = firstDow - 1; i >= 0; i--) {
    days.push({ date: daysInPrevMonth - i, type: 'prev' });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ date: i, type: 'current' });
  }
  const trailing = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= trailing; i++) {
    days.push({ date: i, type: 'next' });
  }

  return days;
}

export default function FullScheduleScreen() {
  const todayDate = new Date();
  const [year, setYear] = useState(todayDate.getFullYear());
  const [month, setMonth] = useState(todayDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(todayDate.getDate());

  const calendarDays = buildCalendarDays(year, month);
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  const changeMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setMonth(m);
    setYear(y);
    setSelectedDay(1);
  };

  const checkToday = (day: CalendarDay) =>
    day.type === 'current' &&
    day.date === todayDate.getDate() &&
    month === todayDate.getMonth() &&
    year === todayDate.getFullYear();

  const checkSelected = (day: CalendarDay) =>
    day.type === 'current' && day.date === selectedDay;

  const renderEmployee = ({ item }: { item: Employee }) => (
    <View style={[styles.empCard, item.highlight && styles.empCardActive]}>
      <Text style={[styles.empName, item.highlight && styles.empWhite]}>
        {item.name}
      </Text>
      <Text style={[styles.empTime, item.highlight && styles.empWhite]}>
        {item.startTime}
      </Text>
      <Text style={[styles.empTime, item.highlight && styles.empWhite]}>
        ~{item.endTime}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="전체 스케줄"
        titleStyle={styles.headerTitle}
        rightElement={<MaterialIcons name="edit" size={20} color="#FF8D28" />}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 월간 캘린더 */}
        <View style={styles.calendarCard}>
          {/* 월 네비게이션 */}
          <View style={styles.monthRow}>
            <TouchableOpacity
              onPress={() => changeMonth(-1)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.monthArrow}>{'<'}</Text>
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{year}년 {month + 1}월</Text>
            <TouchableOpacity
              onPress={() => changeMonth(1)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.monthArrow}>{'>'}</Text>
            </TouchableOpacity>
          </View>

          {/* 요일 헤더 */}
          <View style={styles.calRow}>
            {DAY_LABELS.map(d => (
              <View key={d} style={styles.calCell}>
                <Text style={styles.dayLabel}>{d}</Text>
              </View>
            ))}
          </View>

          {/* 날짜 그리드 */}
          {weeks.map((week, wi) => (
            <View key={wi} style={styles.calRow}>
              {week.map((day, di) => {
                const isToday = checkToday(day);
                const isSelected = checkSelected(day);
                return (
                  <TouchableOpacity
                    key={di}
                    style={styles.calCell}
                    onPress={() => day.type === 'current' && setSelectedDay(day.date)}
                    activeOpacity={day.type === 'current' ? 0.7 : 1}
                  >
                    <View style={[styles.dateBg, isSelected && styles.dateBgSelected]}>
                      <Text
                        style={[
                          styles.dateText,
                          day.type !== 'current' && styles.dateInactive,
                          isToday && styles.dateToday,
                        ]}
                      >
                        {day.date}
                      </Text>
                    </View>
                    {isSelected && <View style={styles.selectedDot} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* 직원 카드 가로 스크롤 */}
        <FlatList
          data={EMPLOYEE_DATA}
          keyExtractor={item => item.id}
          renderItem={renderEmployee}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.empList}
          ItemSeparatorComponent={() => <View style={styles.empSeparator} />}
        />
      </ScrollView>

      <BottomTabBarStatic activeIndex={1} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },

  // 캘린더 카드
  calendarCard: {
    borderWidth: 1,
    borderColor: '#E9F1FF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  monthArrow: {
    fontSize: 18,
    color: '#61656C',
    paddingHorizontal: 20,
  },
  monthLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF8D28',
  },

  // 캘린더 그리드
  calRow: {
    flexDirection: 'row',
  },
  calCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  dayLabel: {
    fontSize: 12,
    color: '#848A94',
    marginBottom: 4,
  },

  // 날짜 셀
  dateBg: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  dateBgSelected: {
    backgroundColor: 'rgba(255,141,40,0.5)',
  },
  dateText: {
    fontSize: 13,
    color: '#002055',
  },
  dateInactive: {
    color: '#D1D1D6',
  },
  dateToday: {
    color: '#FF8D28',
  },
  selectedDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#FF8D28',
    marginTop: 2,
  },

  // 직원 카드 리스트
  empList: {
    paddingTop: 20,
    paddingBottom: 4,
  },
  empSeparator: {
    width: 10,
  },
  empCard: {
    width: 64,
    height: 118,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9F1FF',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  empCardActive: {
    backgroundColor: '#FF8D28',
    borderColor: '#FF8D28',
  },
  empName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#AAAAAA',
  },
  empTime: {
    fontSize: 10,
    color: '#AAAAAA',
  },
  empWhite: {
    color: '#FFFFFF',
  },
});
