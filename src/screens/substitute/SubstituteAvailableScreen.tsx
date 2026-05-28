import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../constants/colors';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ── Mock data ──────────────────────────────────────────────────────────────

const REQUESTER = '강다은';

const REASON_OPTIONS = ['건강/의료', '가족 행사', '학교 일정', '기타'];

type ModalPhase = 'searching';

const TIMES: string[] = [];
for (let h = 0; h < 24; h++) {
  TIMES.push(`${String(h).padStart(2, '0')}:00`);
  TIMES.push(`${String(h).padStart(2, '0')}:30`);
}

const SCREEN_H = Dimensions.get('window').height;

// ── Time dropdown (unchanged — opens downward, works fine) ─────────────────

function TimeDropdown({
  value,
  options,
  onSelect,
  placeholder,
}: {
  value: string;
  options: string[];
  onSelect: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={dd.wrap}>
      <TouchableOpacity
        style={[dd.btn, open && dd.btnOpen]}
        onPress={() => setOpen((o) => !o)}
        activeOpacity={0.8}
      >
        <Text style={[dd.btnText, !value && dd.placeholder]}>
          {value || placeholder || '선택'}
        </Text>
        <Text style={dd.arrow}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={dd.menu}>
          <ScrollView style={dd.scroll} showsVerticalScrollIndicator={false} nestedScrollEnabled>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[dd.option, opt === value && dd.optionActive]}
                onPress={() => { onSelect(opt); setOpen(false); }}
              >
                <Text style={[dd.optionText, opt === value && dd.optionTextActive]}>
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
  wrap: { flex: 1, position: 'relative', zIndex: 10 },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1,
    borderColor: '#E5E5E5', paddingHorizontal: 12, paddingVertical: 12,
  },
  btnOpen: { borderColor: Colors.primary },
  btnText: { fontSize: 14, color: '#1A1A1A', fontWeight: '500' },
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
  optionText: { fontSize: 14, color: '#444444' },
  optionTextActive: { color: Colors.primary, fontWeight: '700' },
});

// ── Reason dropdown — Modal-based, renders above everything ────────────────

type BtnLayout = { x: number; y: number; width: number; height: number };

function ReasonDropdown({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [layout, setLayout] = useState<BtnLayout | null>(null);
  const btnRef = useRef<View>(null);

  const openMenu = () => {
    btnRef.current?.measureInWindow((x, y, width, height) => {
      setLayout({ x, y, width, height });
      setOpen(true);
    });
  };

  return (
    <View ref={btnRef}>
      <TouchableOpacity
        style={[rd.btn, open && rd.btnOpen]}
        onPress={openMenu}
        activeOpacity={0.8}
      >
        <Text style={[rd.btnText, !value && rd.placeholder]}>
          {value || '사유를 선택해주세요'}
        </Text>
        <Text style={rd.arrow}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="none"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={rd.backdrop} onPress={() => setOpen(false)}>
          {layout && (
            <View
              style={[
                rd.menu,
                {
                  position: 'absolute',
                  left: layout.x,
                  width: layout.width,
                  top: layout.y + layout.height,
                },
              ]}
            >
              {REASON_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[rd.option, opt === value && rd.optionActive]}
                  onPress={() => { onSelect(opt); setOpen(false); }}
                  activeOpacity={0.8}
                >
                  <Text style={[rd.optionText, opt === value && rd.optionTextActive]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Pressable>
      </Modal>
    </View>
  );
}

const rd = StyleSheet.create({
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1,
    borderColor: '#E5E5E5', paddingHorizontal: 12, paddingVertical: 12,
  },
  btnOpen: { borderColor: Colors.primary },
  btnText: { fontSize: 14, color: '#1A1A1A', fontWeight: '500' },
  placeholder: { color: '#BBBBBB' },
  arrow: { fontSize: 9, color: '#AAAAAA' },
  backdrop: { flex: 1 },
  menu: {
    backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1,
    borderColor: '#EEEEEE', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 10,
  },
  option: { paddingHorizontal: 14, paddingVertical: 13 },
  optionActive: { backgroundColor: '#FFF4EE' },
  optionText: { fontSize: 14, color: '#444444' },
  optionTextActive: { color: Colors.primary, fontWeight: '700' },
});

// ── Calendar modal ─────────────────────────────────────────────────────────

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTH_NAMES = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

function CalendarModal({
  visible,
  selected,
  onClose,
  onSelect,
}: {
  visible: boolean;
  selected: string;
  onClose: () => void;
  onSelect: (dateStr: string) => void;
}) {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const prevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  };

  const firstDow   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = Array(firstDow).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const parts = selected ? selected.split('.').map(Number) : null;
  const isSelected = (d: number) =>
    !!parts && parts[0] === year && parts[1] === month + 1 && parts[2] === d;
  const isToday = (d: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

  const handleSelect = (d: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    onSelect(`${year}.${mm}.${dd}`);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={cal.backdrop} onPress={onClose}>
        <Pressable style={cal.card} onPress={() => {}}>

          {/* 월 헤더 */}
          <View style={cal.header}>
            <TouchableOpacity onPress={prevMonth} hitSlop={12}>
              <Text style={cal.navArrow}>‹</Text>
            </TouchableOpacity>
            <Text style={cal.monthLabel}>{year}년 {MONTH_NAMES[month]}</Text>
            <TouchableOpacity onPress={nextMonth} hitSlop={12}>
              <Text style={cal.navArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* 요일 헤더 */}
          <View style={cal.dayRow}>
            {DAY_LABELS.map((d, i) => (
              <Text
                key={d}
                style={[cal.dayLabel, i === 0 && cal.sunText, i === 6 && cal.satText]}
              >
                {d}
              </Text>
            ))}
          </View>

          {/* 날짜 그리드 */}
          {weeks.map((week, wi) => (
            <View key={wi} style={cal.week}>
              {week.map((day, di) => {
                if (!day) return <View key={di} style={cal.cell} />;
                const sel = isSelected(day);
                const tod = isToday(day) && !sel;
                return (
                  <TouchableOpacity
                    key={di}
                    style={[cal.cell, sel && cal.cellSel, tod && cal.cellToday]}
                    onPress={() => handleSelect(day)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      cal.dayNum,
                      di === 0 && cal.sunText,
                      di === 6 && cal.satText,
                      sel && cal.selNum,
                      tod && cal.todayNum,
                    ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

        </Pressable>
      </Pressable>
    </Modal>
  );
}

const cal = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%', backgroundColor: '#FFFFFF',
    borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18, shadowRadius: 20, elevation: 12,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 14,
  },
  navArrow: { fontSize: 26, color: Colors.primary, fontWeight: '400', paddingHorizontal: 6 },
  monthLabel: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  dayRow: { flexDirection: 'row', marginBottom: 6 },
  dayLabel: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '700', color: '#AAAAAA' },
  sunText: { color: '#E05555' },
  satText: { color: '#4A90D9' },
  week: { flexDirection: 'row', marginBottom: 2 },
  cell: { flex: 1, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  cellSel: { backgroundColor: Colors.primary },
  cellToday: { backgroundColor: '#FFF0E6' },
  dayNum: { fontSize: 14, fontWeight: '500', color: '#1A1A1A' },
  selNum: { color: '#FFFFFF', fontWeight: '700' },
  todayNum: { color: Colors.primary, fontWeight: '700' },
});

// ── Main screen ────────────────────────────────────────────────────────────

export default function SubstituteAvailableScreen() {
  const navigation = useNavigation<Nav>();

  const [date, setDate]           = useState('');
  const [startTime, setStart]     = useState('');
  const [endTime,   setEnd]       = useState('');
  const [reason,   setReason]     = useState('');
  const [modalPhase, setModal]    = useState<ModalPhase | null>(null);
  const [calVisible, setCal]      = useState(false);

  const allFilled = date && startTime && endTime && reason;

  const handleSearch = () => {
    if (!allFilled) {
      Alert.alert('입력 필요', '모든 항목을 기입해주세요.');
      return;
    }
    setModal('searching');
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
        {/* 요청자 카드 */}
        <View style={s.requesterCard}>
          <View style={s.requesterAvatar}>
            <Text style={s.requesterInitial}>{REQUESTER[0]}</Text>
          </View>
          <View style={s.requesterInfo}>
            <Text style={s.requesterLabel}>요청자</Text>
            <Text style={s.requesterName}>{REQUESTER}</Text>
          </View>
          <TouchableOpacity
            style={s.scheduleBtn}
            onPress={() => navigation.navigate('AiSubstituteSchedule')}
            activeOpacity={0.8}
          >
            <Text style={s.scheduleBtnText}>내 근무 스케줄 확인하기</Text>
          </TouchableOpacity>
        </View>

        {/* 폼 카드 */}
        <View style={s.formCard}>
          <Text style={s.formTitle}>대타 요청 정보</Text>

          {/* 날짜 */}
          <View style={s.field}>
            <Text style={s.fieldLabel}>대타 요청 일자</Text>
            <View style={s.dateRow}>
              <TextInput
                style={s.dateInput}
                placeholder="YYYY.MM.DD"
                placeholderTextColor="#BBBBBB"
                value={date}
                onChangeText={setDate}
                keyboardType="numeric"
                maxLength={10}
              />
              <TouchableOpacity style={s.calBtn} hitSlop={6} onPress={() => setCal(true)}>
                <Text style={s.calIcon}>📅</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 시간 */}
          <View style={[s.field, { zIndex: 15 }]}>
            <Text style={s.fieldLabel}>대타 요청 시간</Text>
            <View style={s.timeRow}>
              <TimeDropdown
                value={startTime}
                options={TIMES}
                onSelect={setStart}
                placeholder="00:00"
              />
              <Text style={s.timeTilde}>~</Text>
              <TimeDropdown
                value={endTime}
                options={TIMES}
                onSelect={setEnd}
                placeholder="00:00"
              />
            </View>
          </View>

          {/* 사유 */}
          <View style={s.field}>
            <Text style={s.fieldLabel}>대타 요청 사유</Text>
            <ReasonDropdown value={reason} onSelect={setReason} />
          </View>

          {/* 안내 */}
          {!allFilled && (
            <View style={s.guideRow}>
              <Text style={s.guideIcon}>ℹ️</Text>
              <Text style={s.guideText}>모든 항목을 기입해주세요.</Text>
            </View>
          )}
        </View>

        {/* 대타 찾기 버튼 */}
        <TouchableOpacity
          style={[s.searchBtn, allFilled && s.searchBtnActive]}
          onPress={handleSearch}
          activeOpacity={0.85}
        >
          <Text style={[s.searchBtnText, allFilled && s.searchBtnTextActive]}>
            대타 찾기
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── 캘린더 모달 ── */}
      <CalendarModal
        visible={calVisible}
        selected={date}
        onClose={() => setCal(false)}
        onSelect={(d) => { setDate(d); setCal(false); }}
      />

      {/* ── 대타 찾기 모달 ── */}
      <Modal
        visible={modalPhase !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setModal(null)}
      >
        <Pressable style={m.backdrop} onPress={() => setModal(null)}>
          <Pressable style={m.card} onPress={() => {}}>

            {/* 아이콘 */}
            <View style={m.iconWrap}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>

            {/* 제목 */}
            <Text style={m.title}>대타 찾기 중</Text>

            {/* 설명 */}
            <Text style={m.descOrange}>
              AI가 해당 일자에 가능한 인원을{'\n'}탐색하고 있습니다
            </Text>

            {/* 버튼 */}
            <View style={m.btnRow}>
              <TouchableOpacity
                style={m.cancelBtn}
                onPress={() => setModal(null)}
                activeOpacity={0.8}
              >
                <Text style={m.cancelText}>이전</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={m.confirmBtn}
                onPress={() => {
                  setModal(null);
                  navigation.navigate('SubstituteFail');
                }}
                activeOpacity={0.85}
              >
                <Text style={m.confirmText}>확인</Text>
              </TouchableOpacity>
            </View>

          </Pressable>
        </Pressable>
      </Modal>
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

  /* 요청자 카드 */
  requesterCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  requesterAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  requesterInitial: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  requesterInfo: { flex: 1, gap: 2 },
  requesterLabel: { fontSize: 11, color: '#AAAAAA', fontWeight: '500' },
  requesterName: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  scheduleBtn: {
    borderWidth: 1.5, borderColor: Colors.primary,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
  },
  scheduleBtnText: { fontSize: 11, fontWeight: '700', color: Colors.primary },

  /* 폼 카드 */
  formCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  formTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },

  field: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#000000' },

  dateRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1,
    borderColor: '#E5E5E5', paddingHorizontal: 12, paddingVertical: 12,
  },
  dateInput: { flex: 1, fontSize: 14, color: '#1A1A1A', padding: 0 },
  calBtn: { width: 28, alignItems: 'center' },
  calIcon: { fontSize: 18 },

  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeTilde: { fontSize: 18, color: '#CCCCCC' },

  guideRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFF8F5', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 8,
  },
  guideIcon: { fontSize: 13 },
  guideText: { fontSize: 12, color: Colors.primary, fontWeight: '500' },

  /* 대타 찾기 버튼 */
  searchBtn: {
    borderRadius: 12, paddingVertical: 15, alignItems: 'center',
    backgroundColor: '#E0E0E0',
  },
  searchBtnActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  searchBtnText: { fontSize: 15, fontWeight: '700', color: '#AAAAAA' },
  searchBtnTextActive: { color: '#FFFFFF' },
});

// ── 모달 스타일 ────────────────────────────────────────────────────────────

const m = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%', backgroundColor: '#FFFFFF',
    borderRadius: 20, paddingHorizontal: 20,
    paddingTop: 28, paddingBottom: 20,
    gap: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18, shadowRadius: 20, elevation: 12,
  },
  iconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#FFF4EE',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 17, fontWeight: '800', color: '#1A1A1A', textAlign: 'center' },
  descOrange: {
    fontSize: 13, color: Colors.primary, fontWeight: '600',
    textAlign: 'center', lineHeight: 20, marginBottom: 8,
  },
  btnRow: { flexDirection: 'row', gap: 8, width: '100%', marginTop: 4 },
  cancelBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#E8E8E8',
    borderRadius: 10, paddingVertical: 12, alignItems: 'center',
    backgroundColor: '#F7F7F7',
  },
  cancelText: { fontSize: 14, fontWeight: '700', color: '#888888' },
  confirmBtn: {
    flex: 1, backgroundColor: Colors.primary,
    borderRadius: 10, paddingVertical: 12, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  confirmText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});
