import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../constants/colors';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Status = 'new' | 'pending' | 'rejected' | 'accepted';

type Request = {
  id: string;
  date: string;
  time: string;
  name: string;
  message: string;
  status: Status;
};

// ── Mock data ──────────────────────────────────────────────────────────────

const INITIAL_INCOMING: Request[] = [
  { id: 'i1', date: '9월 11일', time: '11:00~12:00', name: '청유나', message: '자격증 시험 때문에 대타 요청드립니다ㅜㅜ', status: 'new'      },
  { id: 'i2', date: '9월 11일', time: '11:00~12:00', name: '밀해오', message: '개인 사정으로 인해 대타 요청합니다.',         status: 'pending'  },
  { id: 'i3', date: '9월 11일', time: '11:00~12:00', name: '김희영', message: '가족 행사가 생겼어요. 대타 가능하신지요.',   status: 'rejected' },
];

const INITIAL_MINE: Request[] = [
  { id: 'm1', date: '9월 11일', time: '11:00~12:00', name: '청유나', message: '자격증 시험 때문에 대타 요청드립니다ㅜㅜ', status: 'accepted' },
  { id: 'm2', date: '9월 11일', time: '11:00~12:00', name: '정혜영', message: '개인 사정으로 인해 대타 요청합니다.',         status: 'pending'  },
  { id: 'm3', date: '9월 11일', time: '11:00~12:00', name: '김희영', message: '가족 행사가 생겼어요. 대타 가능하신지요.',   status: 'rejected' },
];

// ── Status badge ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<Status, { label: string; bg: string; text: string }> = {
  new:      { label: '신규', bg: '#FFF0E6', text: Colors.primary },
  pending:  { label: '대기', bg: '#F2F2F2', text: '#888888'       },
  rejected: { label: '거절', bg: '#F2F2F2', text: '#888888'       },
  accepted: { label: '수락', bg: '#E8F5E9', text: '#4CAF50'       },
};

// 내 요청 현황용 pill 배지 색상
const MINE_PILL: Record<Status, string> = {
  accepted: '#4CAF50',
  pending:  '#AAAAAA',
  rejected: '#FF6B2C',
  new:      Colors.primary,
};

// ── Request card ───────────────────────────────────────────────────────────

function RequestCard({
  item,
  onAccept,
  onReject,
}: {
  item: Request;
  onAccept?: () => void;
  onReject?: () => void;
}) {
  const cfg = STATUS_CONFIG[item.status];
  const showButtons = item.status === 'new';

  return (
    <View style={card.wrap}>
      {/* Top row: date/time + status badge */}
      <View style={card.topRow}>
        <Text style={card.dateTime}>{item.date} · {item.time}</Text>
        <View style={[card.badge, { backgroundColor: cfg.bg }]}>
          <Text style={[card.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
        </View>
      </View>

      {/* Name row */}
      <Text style={card.name}>{item.name}님의 요청</Text>

      {/* Message row */}
      <View style={card.msgRow}>
        <View style={card.avatar}>
          <Text style={card.avatarIcon}>👤</Text>
        </View>
        <Text style={card.msg} numberOfLines={1}>{item.message}</Text>
      </View>

      {/* Action buttons (신규만) */}
      {showButtons && (
        <View style={card.btnRow}>
          <TouchableOpacity style={card.rejectBtn} onPress={onReject} activeOpacity={0.8}>
            <Text style={card.rejectText}>거절</Text>
          </TouchableOpacity>
          <TouchableOpacity style={card.acceptBtn} onPress={onAccept} activeOpacity={0.85}>
            <Text style={card.acceptText}>수락</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const card = StyleSheet.create({
  wrap:     { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  topRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateTime: { fontSize: 12, color: '#999999', fontWeight: '500' },
  badge:    { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText:{ fontSize: 11, fontWeight: '700' },
  name:     { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  msgRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar:   { width: 28, height: 28, borderRadius: 14, backgroundColor: '#EEEEEE', alignItems: 'center', justifyContent: 'center' },
  avatarIcon: { fontSize: 14 },
  msg:      { flex: 1, fontSize: 13, color: '#AAAAAA' },
  btnRow:   { flexDirection: 'row', gap: 8, marginTop: 4 },
  rejectBtn:{ flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center', backgroundColor: '#F2F2F2' },
  rejectText:{ fontSize: 13, fontWeight: '600', color: '#888888' },
  acceptBtn:{ flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center', backgroundColor: Colors.primary },
  acceptText:{ fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
});

// ── Mine card (내 요청 현황 — 원형 배지, 버튼 없음) ──────────────────────────

function MineCard({ item }: { item: Request }) {
  const pillColor = MINE_PILL[item.status] ?? '#AAAAAA';
  const label     = STATUS_CONFIG[item.status]?.label ?? '';

  return (
    <View style={mc.wrap}>
      {/* Content (left) + Circle badge (right) */}
      <View style={mc.row}>
        <View style={mc.content}>
          <Text style={mc.dateTime}>{item.date} · {item.time}</Text>
          <Text style={mc.name}>{item.name}님의 요청</Text>
          <View style={mc.msgRow}>
            <View style={mc.avatar}>
              <Text style={mc.avatarIcon}>👤</Text>
            </View>
            <Text style={mc.msg} numberOfLines={1}>{item.message}</Text>
          </View>
        </View>
        <View style={[mc.circle, { borderColor: pillColor }]}>
          <Text style={[mc.circleText, { color: pillColor }]}>{label}</Text>
        </View>
      </View>
    </View>
  );
}

const mc = StyleSheet.create({
  wrap: {
    backgroundColor: '#FFFFFF', borderRadius: 12,
    padding: 14, marginHorizontal: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  row:        { flexDirection: 'row', alignItems: 'center' },
  content:    { flex: 1, gap: 8 },
  dateTime:   { fontSize: 11, color: '#999999', fontWeight: '500' },
  circle: {
    width: 52, height: 52, borderRadius: 26,
    borderWidth: 2, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginLeft: 12,
  },
  circleText: { fontSize: 12, fontWeight: '700' },
  name:       { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  msgRow:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  avatar:     { width: 24, height: 24, borderRadius: 12, backgroundColor: '#EEEEEE', alignItems: 'center', justifyContent: 'center' },
  avatarIcon: { fontSize: 12 },
  msg:        { flex: 1, fontSize: 12, color: '#AAAAAA' },
});

<<<<<<< HEAD
=======

>>>>>>> 272a8d5 (feat: 모바일 레이아웃 최적화 및 에러 수정)
// ── Main screen ────────────────────────────────────────────────────────────

export default function SubstituteRequestScreen() {
  const navigation = useNavigation<Nav>();

  const [tab,      setTab]      = useState<'incoming' | 'mine'>('incoming');
  const [incoming, setIncoming] = useState<Request[]>(INITIAL_INCOMING);
  const mine = INITIAL_MINE;

  const accept = (id: string) =>
    setIncoming((prev) => prev.map((r) => r.id === id ? { ...r, status: 'pending' as Status } : r));
  const reject = (id: string) =>
    setIncoming((prev) => prev.map((r) => r.id === id ? { ...r, status: 'rejected' as Status } : r));

  const isIncoming = tab === 'incoming';

  return (
    <SafeAreaView style={s.safe}>

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={s.headerSide}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>대타 신청</Text>
        <TouchableOpacity style={s.headerSide} hitSlop={8}>
          <View style={s.hamburger}>
            <View style={s.bar} />
            <View style={s.bar} />
            <View style={s.bar} />
          </View>
        </TouchableOpacity>
      </View>

      {/* ── Pill tabs (좌측 정렬, 소형) ── */}
      <View style={s.tabWrap}>
        <TouchableOpacity
          style={[s.pill, isIncoming && s.pillActive]}
          onPress={() => setTab('incoming')}
          activeOpacity={0.8}
        >
          <Text style={[s.pillText, isIncoming && s.pillTextActive]}>대타 요청 알림</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.pill, !isIncoming && s.pillActive]}
          onPress={() => setTab('mine')}
          activeOpacity={0.8}
        >
          <Text style={[s.pillText, !isIncoming && s.pillTextActive]}>내 요청 현황</Text>
        </TouchableOpacity>
      </View>

      {/* ── Card list ── */}
      <FlatList
        data={isIncoming ? incoming : mine}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
          isIncoming ? (
            <RequestCard
              item={item}
              onAccept={() => accept(item.id)}
              onReject={() => reject(item.id)}
            />
          ) : (
            <MineCard item={item} />
          )
        }
        ItemSeparatorComponent={() => <View style={s.sep} />}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyText}>요청이 없습니다.</Text>
          </View>
        }
        style={s.list}
      />

      {/* ── FAB ── */}
      <TouchableOpacity
        style={s.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('AiSubstituteSchedule')}
      >
        <Text style={s.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },

  /* Header */
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  headerSide:  { width: 36 },
  backArrow:   { fontSize: 22, color: '#1A1A1A' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  hamburger:   { gap: 4, alignItems: 'flex-end' },
  bar:         { width: 20, height: 2, borderRadius: 1, backgroundColor: '#1A1A1A' },

  /* Pill tabs */
  tabWrap: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  pill: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#DDDDDD',
  },
  pillActive:     { borderColor: Colors.primary },
  pillText:       { fontSize: 12, fontWeight: '600', color: '#AAAAAA' },
  pillTextActive: { color: Colors.primary },

  /* List */
  list:        { flex: 1 },
  listContent: { paddingBottom: 100 },
  sep:         { height: 1, backgroundColor: '#F0F0F0' },
  empty:       { alignItems: 'center', paddingTop: 60 },
  emptyText:   { fontSize: 14, color: '#AAAAAA' },

  /* FAB */
  fab: {
    position: 'absolute', bottom: 20, right: 20,
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  fabIcon: { fontSize: 28, color: '#FFFFFF', lineHeight: 32 },
});
