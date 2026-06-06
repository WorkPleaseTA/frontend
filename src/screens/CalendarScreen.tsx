import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CalendarStackParamList } from '../navigation/AppNavigator';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

type Nav = NativeStackNavigationProp<CalendarStackParamList>;

// ── 날짜 헬퍼 ─────────────────────────────────────────────────────────────────

const TODAY = new Date();
const THIS_YEAR = TODAY.getFullYear();
const THIS_MONTH = TODAY.getMonth();
const TODAY_DATE = TODAY.getDate();

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTH_NAMES = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function firstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function toDateParam(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
const fmtTime = (t?: string | null) => t?.substring(0, 5) ?? '--:--';

// ── 타입 ──────────────────────────────────────────────────────────────────────

interface StaffSchedule {
  storeMemberId: number;
  name: string;
  startTime: string;
  endTime: string;
  isSubstitute: boolean;
}

// ── 달력 컴포넌트 ─────────────────────────────────────────────────────────────

function CalendarCard({
  year, month, selectedDay, onSelectDay, onPrevMonth, onNextMonth,
}: {
  year: number; month: number; selectedDay: number | null;
  onSelectDay: (day: number) => void;
  onPrevMonth: () => void; onNextMonth: () => void;
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
      <View style={calStyles.navRow}>
        <TouchableOpacity onPress={onPrevMonth} hitSlop={10} style={calStyles.navBtn}>
          <Text style={calStyles.navArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={calStyles.monthLabel}>{year}년 {MONTH_NAMES[month]}</Text>
        <TouchableOpacity onPress={onNextMonth} hitSlop={10} style={calStyles.navBtn}>
          <Text style={calStyles.navArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={calStyles.weekRow}>
        {WEEKDAYS.map((d, i) => (
          <Text key={d} style={[calStyles.weekDay, i === 0 && calStyles.sunday, i === 6 && calStyles.saturday]}>
            {d}
          </Text>
        ))}
      </View>

      {rows.map((row, ri) => (
        <View key={ri} style={calStyles.row}>
          {row.map((day, ci) => {
            if (!day) return <View key={ci} style={calStyles.cell} />;
            const isToday = isCurrentMonth && day === TODAY_DATE;
            const isSelected = day === selectedDay;
            return (
              <TouchableOpacity key={ci} style={calStyles.cell} onPress={() => onSelectDay(day)} activeOpacity={0.7}>
                <View style={[calStyles.dayCircle, isToday && calStyles.todayCircle, isSelected && !isToday && calStyles.selectedCircle]}>
                  <Text style={[calStyles.dayText, ci === 0 && calStyles.sundayText, ci === 6 && calStyles.saturdayText, (isToday || isSelected) && calStyles.highlightText]}>
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
    backgroundColor: '#FFFFFF', borderRadius: 16,
    marginHorizontal: 16, marginTop: 16,
    paddingHorizontal: 16, paddingBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  navBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  navArrow: { fontSize: 26, color: Colors.primary, lineHeight: 30 },
  monthLabel: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekDay: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600', color: '#AAAAAA', paddingVertical: 4 },
  sunday: { color: '#E05555' },
  saturday: { color: '#4A90D9' },
  row: { flexDirection: 'row' },
  cell: { flex: 1, alignItems: 'center', paddingVertical: 3 },
  dayCircle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  todayCircle: { backgroundColor: Colors.primary },
  selectedCircle: { backgroundColor: '#FFE5D0' },
  dayText: { fontSize: 14, color: '#1A1A1A' },
  sundayText: { color: '#E05555' },
  saturdayText: { color: '#4A90D9' },
  highlightText: { color: '#FFFFFF', fontWeight: '700' },
});

// ── 직원 카드 (가로 스크롤) ────────────────────────────────────────────────────

function EmployeeCards({
  schedules, selectedId, onSelect, loading,
}: {
  schedules: StaffSchedule[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  loading: boolean;
}) {
  return (
    <View style={empStyles.section}>
      <Text style={empStyles.sectionTitle}>직원 근무 현황</Text>
      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 16 }} />
      ) : schedules.length === 0 ? (
        <Text style={empStyles.empty}>이날 근무 스케줄이 없습니다</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={empStyles.scrollContent}>
          {schedules.map((emp) => {
            const selected = emp.storeMemberId === selectedId;
            return (
              <TouchableOpacity
                key={emp.storeMemberId}
                style={[empStyles.card, selected && empStyles.cardSelected]}
                onPress={() => onSelect(emp.storeMemberId)}
                activeOpacity={0.8}
              >
                <View style={[empStyles.avatar, selected && empStyles.avatarSelected]}>
                  <Text style={[empStyles.avatarText, selected && empStyles.avatarTextSelected]}>
                    {(emp.name ?? '?').charAt(0)}
                  </Text>
                </View>
                <Text style={[empStyles.name, selected && empStyles.nameSelected]}>{emp.name ?? ''}</Text>
                <View style={empStyles.timeWrap}>
                  <Text style={[empStyles.time, selected && empStyles.timeSelected]}>{fmtTime(emp.startTime)}</Text>
                  <Text style={[empStyles.timeDivider, selected && empStyles.timeSelected]}>/</Text>
                  <Text style={[empStyles.time, selected && empStyles.timeSelected]}>{fmtTime(emp.endTime)}</Text>
                </View>
                {emp.isSubstitute && (
                  <Text style={[empStyles.subBadge, selected && empStyles.subBadgeSelected]}>대타</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const empStyles = StyleSheet.create({
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 12, paddingHorizontal: 16 },
  empty: { fontSize: 13, color: '#AAAAAA', paddingHorizontal: 16, paddingBottom: 8 },
  scrollContent: { paddingHorizontal: 16, gap: 10, paddingBottom: 4 },
  card: {
    width: 90, backgroundColor: '#FFFFFF', borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 8, alignItems: 'center', gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardSelected: { backgroundColor: Colors.primary, shadowOpacity: 0.15, shadowRadius: 10, elevation: 5 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFE5D0', alignItems: 'center', justifyContent: 'center' },
  avatarSelected: { backgroundColor: 'rgba(255,255,255,0.3)' },
  avatarText: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  avatarTextSelected: { color: '#FFFFFF' },
  name: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', textAlign: 'center' },
  nameSelected: { color: '#FFFFFF' },
  timeWrap: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  time: { fontSize: 11, fontWeight: '500', color: '#888888' },
  timeSelected: { color: 'rgba(255,255,255,0.85)' },
  timeDivider: { fontSize: 10, color: '#BBBBBB' },
  subBadge: { fontSize: 10, color: Colors.primary, fontWeight: '700' },
  subBadgeSelected: { color: 'rgba(255,255,255,0.85)' },
});

// ── 메인 화면 ─────────────────────────────────────────────────────────────────

export default function CalendarScreen() {
  const navigation = useNavigation<Nav>();
  const { storeInfo } = useAuth();
  const isManager = storeInfo?.role === 'OWNER';

  const [year, setYear] = useState(THIS_YEAR);
  const [month, setMonth] = useState(THIS_MONTH);
  const [selectedDay, setSelectedDay] = useState<number | null>(TODAY_DATE);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [schedules, setSchedules] = useState<StaffSchedule[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const fetchSchedules = useCallback(async (y: number, m: number, d: number | null) => {
    if (!storeInfo || !d) return;
    setLoadingSchedule(true);
    try {
      const res = await api.get(`/stores/${storeInfo.storeId}/schedules?date=${toDateParam(y, m, d)}`);
      const data: StaffSchedule[] = res.data.data ?? [];
      setSchedules(data);
      if (data.length > 0 && !data.find(s => s.storeMemberId === selectedId)) {
        setSelectedId(data[0].storeMemberId);
      }
    } catch {
      setSchedules([]);
    } finally {
      setLoadingSchedule(false);
    }
  }, [storeInfo?.storeId]);

  useEffect(() => { fetchSchedules(year, month, selectedDay); }, [year, month, selectedDay, fetchSchedules]);

  // FixedScheduleScreen에서 돌아올 때 최신 데이터 반영
  useFocusEffect(
    useCallback(() => {
      fetchSchedules(year, month, selectedDay);
    }, [year, month, selectedDay, fetchSchedules])
  );

  const prevMonth = () => {
    const [ny, nm] = month === 0 ? [year - 1, 11] : [year, month - 1];
    const maxDay = daysInMonth(ny, nm);
    setYear(ny); setMonth(nm);
    if (selectedDay && selectedDay > maxDay) setSelectedDay(maxDay);
  };

  const nextMonth = () => {
    const [ny, nm] = month === 11 ? [year + 1, 0] : [year, month + 1];
    const maxDay = daysInMonth(ny, nm);
    setYear(ny); setMonth(nm);
    if (selectedDay && selectedDay > maxDay) setSelectedDay(maxDay);
  };

  return (
    <SafeAreaView style={styles.safe}>
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

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <CalendarCard
          year={year} month={month} selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          onPrevMonth={prevMonth} onNextMonth={nextMonth}
        />
        <EmployeeCards
          schedules={schedules}
          selectedId={selectedId}
          onSelect={setSelectedId}
          loading={loadingSchedule}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F4F8' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#F4F4F8',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
});
