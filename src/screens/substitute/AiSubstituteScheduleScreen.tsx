import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../constants/colors';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ── Constants ──────────────────────────────────────────────────────────────

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
const START_HOUR = 8;
const END_HOUR   = 24;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

// 셀 크기 (촘촘하게)
const COL_W      = 36;
const TIME_COL_W = 38;
const ROW_H      = 22;
const HEADER_H   = 36;

const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
const WEEKS  = ['1주차','2주차','3주차','4주차','5주차'];

// 대타 가능/불가 시간 (day 0=월)
const AVAILABLE: Record<number, [number, number]> = {
  0: [9, 18],
  2: [9, 18],
  4: [13, 22],
};
const UNAVAILABLE: Record<number, [number, number]> = {
  1: [10, 14],
  3: [9, 13],
  6: [10, 16],
};

// ── Week date helpers ──────────────────────────────────────────────────────

function getWeekDates(monthIdx: number, weekIdx: number): Date[] {
  // 해당 월의 weekIdx번째 주 월~일 계산
  const first = new Date(new Date().getFullYear(), monthIdx, 1);
  const firstMon = new Date(first);
  const dow = first.getDay();
  firstMon.setDate(1 - ((dow + 6) % 7)); // 첫 번째 월요일
  firstMon.setDate(firstMon.getDate() + weekIdx * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(firstMon);
    d.setDate(firstMon.getDate() + i);
    return d;
  });
}

function isToday(d: Date) {
  const t = new Date();
  return d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate();
}

// ── Dropdown ───────────────────────────────────────────────────────────────

function Dropdown({
  options,
  selectedIndex,
  onSelect,
}: {
  options: string[];
  selectedIndex: number;
  onSelect: (i: number) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={dd.wrap}>
      <TouchableOpacity
        style={[dd.btn, open && dd.btnOpen]}
        onPress={() => setOpen((o) => !o)}
        activeOpacity={0.8}
      >
        <Text style={dd.btnText}>{options[selectedIndex]}</Text>
        <Text style={dd.arrow}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={dd.menu}>
          <ScrollView style={dd.scroll} showsVerticalScrollIndicator={false} nestedScrollEnabled>
            {options.map((opt, i) => (
              <TouchableOpacity
                key={opt}
                style={[dd.option, i === selectedIndex && dd.optionActive]}
                onPress={() => { onSelect(i); setOpen(false); }}
              >
                <Text style={[dd.optionText, i === selectedIndex && dd.optionTextActive]}>
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

const dd = StyleSheet.create({
  wrap: { flex: 1, position: 'relative', zIndex: 20 },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1,
    borderColor: '#E8E8E8', paddingHorizontal: 12, paddingVertical: 10,
  },
  btnOpen: { borderColor: Colors.primary },
  btnText: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  arrow: { fontSize: 9, color: '#AAAAAA' },
  menu: {
    position: 'absolute', top: 46, left: 0, right: 0, zIndex: 30,
    backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 6,
  },
  scroll: { maxHeight: 180 },
  option: { paddingHorizontal: 14, paddingVertical: 10 },
  optionActive: { backgroundColor: '#FFF4EE' },
  optionText: { fontSize: 13, color: '#555555' },
  optionTextActive: { color: Colors.primary, fontWeight: '700' },
});

// ── Schedule grid ──────────────────────────────────────────────────────────

function WeekGrid({ dates }: { dates: Date[] }) {
  return (
    <View style={g.card}>
      {/* Legend */}
      <View style={g.legendRow}>
        <View style={g.legendItem}>
          <View style={[g.legendDot, { backgroundColor: '#FFD4A0' }]} />
          <Text style={g.legendText}>대타 가능</Text>
        </View>
        <View style={g.legendItem}>
          <View style={[g.legendDot, { backgroundColor: '#DEDEDE' }]} />
          <Text style={g.legendText}>대타 불가</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Day header */}
          <View style={g.headerRow}>
            <View style={g.cornerCell} />
            {DAY_LABELS.map((day, di) => {
              const date  = dates[di];
              const today = isToday(date);
              const isSat = di === 5;
              const isSun = di === 6;
              return (
                <View
                  key={di}
                  style={[
                    g.dayHeader,
                    isSat && g.satHeader,
                    isSun && g.sunHeader,
                    today && g.todayHeader,
                  ]}
                >
                  <Text style={[
                    g.dayLabel,
                    isSat && g.satText,
                    isSun && g.sunText,
                    today && g.todayText,
                  ]}>
                    {day}
                  </Text>
                  <View style={[g.datePill, today && g.datePillToday]}>
                    <Text style={[g.dateNum, today && g.dateNumToday]}>
                      {date.getDate()}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Hour rows */}
          <ScrollView style={g.rowScroll} showsVerticalScrollIndicator={false} nestedScrollEnabled>
            {HOURS.map((h) => (
              <View key={h} style={g.hourRow}>
                <View style={g.timeCell}>
                  <Text style={g.timeText}>{h}:00</Text>
                </View>
                {DAY_LABELS.map((_, di) => {
                  const avail   = AVAILABLE[di];
                  const unavail = UNAVAILABLE[di];
                  const inAvail   = !!(avail   && h >= avail[0]   && h < avail[1]);
                  const inUnavail = !!(unavail  && h >= unavail[0] && h < unavail[1]);
                  const isAvailStart = !!(avail   && h === avail[0]);
                  const isAvailEnd   = !!(avail   && h === avail[1] - 1);
                  const isUnavStart  = !!(unavail && h === unavail[0]);
                  const isUnavEnd    = !!(unavail && h === unavail[1] - 1);
                  const today = isToday(dates[di]);

                  return (
                    <View
                      key={di}
                      style={[
                        g.cell,
                        today && g.cellToday,
                        inAvail   && g.availCell,
                        inUnavail && g.unavailCell,
                        inAvail   && isAvailStart && g.blockTop,
                        inAvail   && isAvailEnd   && g.blockBottom,
                        inUnavail && isUnavStart  && g.blockTop,
                        inUnavail && isUnavEnd    && g.blockBottom,
                      ]}
                    >
                      {isAvailStart && (
                        <Text style={g.blockLabel}>{avail![0]}시</Text>
                      )}
                      {isUnavStart && (
                        <Text style={[g.blockLabel, g.blockLabelGray]}>
                          {unavail![0]}시
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const g = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  legendRow: {
    flexDirection: 'row', gap: 14,
    paddingHorizontal: 12, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#F2F2F2',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 2 },
  legendText: { fontSize: 11, color: '#888888' },

  headerRow: { flexDirection: 'row' },
  cornerCell: {
    width: TIME_COL_W, height: HEADER_H,
    borderRightWidth: 1, borderRightColor: '#EEEEEE',
    borderBottomWidth: 1, borderBottomColor: '#EEEEEE',
  },
  dayHeader: {
    width: COL_W, height: HEADER_H,
    alignItems: 'center', justifyContent: 'center',
    borderRightWidth: 1, borderRightColor: '#F0F0F0',
    borderBottomWidth: 1, borderBottomColor: '#EEEEEE',
    backgroundColor: '#FAFAFA', gap: 1,
  },
  satHeader: { backgroundColor: '#F0F5FF' },
  sunHeader: { backgroundColor: '#FFF5F5' },
  todayHeader: { backgroundColor: '#FFF4EE' },
  dayLabel: { fontSize: 10, fontWeight: '600', color: '#999999' },
  satText: { color: '#4A90D9' },
  sunText: { color: '#E05555' },
  todayText: { color: Colors.primary },
  datePill: {
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  datePillToday: { backgroundColor: Colors.primary },
  dateNum: { fontSize: 11, fontWeight: '700', color: '#333333' },
  dateNumToday: { color: '#FFFFFF' },

  rowScroll: { maxHeight: 360 },
  hourRow: { flexDirection: 'row' },
  timeCell: {
    width: TIME_COL_W, height: ROW_H,
    alignItems: 'flex-end', justifyContent: 'flex-start',
    paddingRight: 6, paddingTop: 2,
    borderRightWidth: 1, borderRightColor: '#EEEEEE',
  },
  timeText: { fontSize: 9, color: '#CCCCCC' },
  cell: {
    width: COL_W, height: ROW_H,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
    borderRightWidth: 1, borderRightColor: '#F0F0F0',
    alignItems: 'center', justifyContent: 'center',
  },
  cellToday: { backgroundColor: '#FFFBF8' },
  availCell: { backgroundColor: '#FFE0B2' },
  unavailCell: { backgroundColor: '#EBEBEB' },
  blockTop: { borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  blockBottom: { borderBottomLeftRadius: 4, borderBottomRightRadius: 4 },
  blockLabel: { fontSize: 8, fontWeight: '700', color: Colors.primary },
  blockLabelGray: { color: '#999999' },
});

// ── Main screen ────────────────────────────────────────────────────────────

export default function AiSubstituteScheduleScreen() {
  const navigation = useNavigation<Nav>();
  const now = new Date();
  const [monthIdx, setMonthIdx] = useState(now.getMonth());
  const [weekIdx,  setWeekIdx]  = useState(0);

  const dates = getWeekDates(monthIdx, weekIdx);

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={s.backBtn}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>대타 스케줄 관리</Text>
        <View style={s.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Dropdowns */}
        <View style={s.dropRow}>
          <Dropdown
            options={MONTHS}
            selectedIndex={monthIdx}
            onSelect={(i) => { setMonthIdx(i); setWeekIdx(0); }}
          />
          <Dropdown
            options={WEEKS}
            selectedIndex={weekIdx}
            onSelect={setWeekIdx}
          />
        </View>

        {/* Grid */}
        <WeekGrid dates={dates} />

        {/* Buttons */}
        <View style={s.btnCol}>
          <TouchableOpacity
            style={s.outlineBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AiSubstituteTime')}
          >
            <Text style={s.outlineBtnText}>대타 가능 시간대 수정</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.fillBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('SubstituteAvailable')}
          >
            <Text style={s.fillBtnText}>대타 요청하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F4F8' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#F4F4F8',
  },
  backBtn: { width: 36 },
  backArrow: { fontSize: 22, color: '#1A1A1A' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  placeholder: { width: 36 },

  scroll: { padding: 16, gap: 14, paddingBottom: 40 },

  dropRow: { flexDirection: 'row', gap: 10, zIndex: 20 },

  btnCol: { gap: 10 },
  outlineBtn: {
    borderWidth: 1.5, borderColor: Colors.primary,
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  outlineBtnText: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  fillBtn: {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingVertical: 15, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  fillBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
