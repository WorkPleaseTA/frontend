import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type SubStatus = 'WAITING' | 'ACCEPTED' | 'DECLINED';

interface IncomingItem {
  candidateId: number;
  requesterName: string;
  requestDate: string;
  startTime: string;
  endTime: string;
  message: string;
  myStatus: SubStatus;
  requestStatus: SubStatus;
}

interface MyCandidate {
  candidateId: number;
  staffName: string;
  status: SubStatus;
}
interface MyItem {
  requestId: number;
  requestDate: string;
  startTime: string;
  endTime: string;
  message: string;
  candidates: MyCandidate[];
  createdAt: string;
}

const fmtDate = (d: string) => {
  try {
    const [, m, dd] = d.split('-');
    return `${Number(m)}월 ${Number(dd)}일`;
  } catch { return d; }
};
const fmtTime = (t: string) => t.slice(0, 5);

// ── 들어온 요청 카드 ──────────────────────────────────────────────────────────

function IncomingCard({
  item, onAccept, onDecline,
}: {
  item: IncomingItem;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const closed   = item.requestStatus === 'ACCEPTED' && item.myStatus === 'WAITING';
  const showBtns = item.myStatus === 'WAITING' && !closed;

  const badge =
    closed                         ? { label: '마감', bg: '#F0F0F0', color: '#AAAAAA' }
    : item.myStatus === 'ACCEPTED' ? { label: '수락', bg: '#E8F5E9', color: '#4CAF50' }
    : item.myStatus === 'DECLINED' ? { label: '거절', bg: '#F2F2F2', color: '#888888' }
    :                                { label: '신규', bg: '#FFF0E6', color: Colors.primary };

  return (
    <View style={crd.wrap}>
      <View style={crd.topRow}>
        <Text style={crd.dateTime}>
          {fmtDate(item.requestDate)} · {fmtTime(item.startTime)}~{fmtTime(item.endTime)}
        </Text>
        <View style={[crd.badge, { backgroundColor: badge.bg }]}>
          <Text style={[crd.badgeText, { color: badge.color }]}>{badge.label}</Text>
        </View>
      </View>
      <Text style={crd.name}>{item.requesterName}님의 요청</Text>
      <View style={crd.msgRow}>
        <View style={crd.avatar}><Text style={crd.avatarIcon}>👤</Text></View>
        <Text style={crd.msg} numberOfLines={2}>{item.message}</Text>
      </View>
      {showBtns && (
        <View style={crd.btnRow}>
          <TouchableOpacity style={crd.rejectBtn} onPress={onDecline} activeOpacity={0.8}>
            <Text style={crd.rejectText}>거절</Text>
          </TouchableOpacity>
          <TouchableOpacity style={crd.acceptBtn} onPress={onAccept} activeOpacity={0.85}>
            <Text style={crd.acceptText}>수락</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const crd = StyleSheet.create({
  wrap:      { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  topRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateTime:  { fontSize: 12, color: '#999999', fontWeight: '500' },
  badge:     { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  name:      { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  msgRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar:    { width: 28, height: 28, borderRadius: 14, backgroundColor: '#EEEEEE', alignItems: 'center', justifyContent: 'center' },
  avatarIcon: { fontSize: 14 },
  msg:       { flex: 1, fontSize: 13, color: '#AAAAAA' },
  btnRow:    { flexDirection: 'row', gap: 8, marginTop: 4 },
  rejectBtn: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center', backgroundColor: '#F2F2F2' },
  rejectText:{ fontSize: 13, fontWeight: '600', color: '#888888' },
  acceptBtn: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center', backgroundColor: Colors.primary },
  acceptText:{ fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
});

// ── 내 요청 현황 카드 ─────────────────────────────────────────────────────────

function MineCard({ item }: { item: MyItem }) {
  const candidates = item.candidates ?? [];
  const hasAcc  = candidates.some(c => c.status === 'ACCEPTED');
  const allDec  = candidates.length > 0 && candidates.every(c => c.status === 'DECLINED');
  const color   = hasAcc ? '#4CAF50' : allDec ? '#888888' : '#AAAAAA';
  const label   = hasAcc ? '수락' : allDec ? '거절' : '대기';
  const waiting = candidates.filter(c => c.status === 'WAITING').length;

  return (
    <View style={mc.wrap}>
      <View style={mc.row}>
        <View style={mc.content}>
          <Text style={mc.dateTime}>
            {fmtDate(item.requestDate)} · {fmtTime(item.startTime)}~{fmtTime(item.endTime)}
          </Text>
          <Text style={mc.name}>대타 요청 ({candidates.length}명)</Text>
          <View style={mc.msgRow}>
            <View style={mc.ava}><Text style={mc.avaIcon}>👤</Text></View>
            <Text style={mc.msg} numberOfLines={1}>{item.message}</Text>
          </View>
          {waiting > 0 && (
            <Text style={mc.sub}>{waiting}명 응답 대기 중</Text>
          )}
        </View>
        <View style={[mc.circle, { borderColor: color }]}>
          <Text style={[mc.circleText, { color }]}>{label}</Text>
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
  row:     { flexDirection: 'row', alignItems: 'center' },
  content: { flex: 1, gap: 6 },
  dateTime:{ fontSize: 11, color: '#999999', fontWeight: '500' },
  name:    { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  msgRow:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ava:     { width: 24, height: 24, borderRadius: 12, backgroundColor: '#EEEEEE', alignItems: 'center', justifyContent: 'center' },
  avaIcon: { fontSize: 12 },
  msg:     { flex: 1, fontSize: 12, color: '#AAAAAA' },
  sub:     { fontSize: 11, color: Colors.primary, fontWeight: '500' },
  circle:  {
    width: 52, height: 52, borderRadius: 26,
    borderWidth: 2, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginLeft: 12,
  },
  circleText: { fontSize: 12, fontWeight: '700' },
});

// ── 메인 화면 ─────────────────────────────────────────────────────────────────

export default function SubstituteRequestScreen() {
  const navigation = useNavigation<Nav>();
  const { storeInfo } = useAuth();

  const [tab,     setTab]     = useState<'incoming' | 'mine'>('incoming');
  const [incoming, setIncoming] = useState<IncomingItem[]>([]);
  const [mine,    setMine]    = useState<MyItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!storeInfo) return;
    setLoading(true);
    try {
      const [inRes, myRes] = await Promise.all([
        api.get(`/substitute/requests/incoming?storeId=${storeInfo.storeId}`),
        api.get(`/substitute/requests/my?storeId=${storeInfo.storeId}`),
      ]);
      setIncoming(inRes.data.data ?? []);
      // API 응답: flat 구조 (requestId마다 candidateId 행이 별도 존재)
      // → requestId 기준으로 그룹핑해서 MyItem 배열로 변환
      const flat: any[] = myRes.data.data ?? [];
      const grouped = new Map<number, MyItem>();
      for (const row of flat) {
        if (!grouped.has(row.requestId)) {
          grouped.set(row.requestId, {
            requestId:   row.requestId,
            requestDate: row.requestDate,
            startTime:   row.startTime,
            endTime:     row.endTime,
            message:     row.message,
            createdAt:   row.createdAt,
            candidates:  [],
          });
        }
        grouped.get(row.requestId)!.candidates.push({
          candidateId: row.candidateId,
          staffName:   row.candidateName ?? '',
          status:      (row.candidateStatus ?? 'WAITING') as SubStatus,
        });
      }
      setMine(Array.from(grouped.values()));
    } catch {
      // 빈 상태로 표시
    } finally {
      setLoading(false);
    }
  }, [storeInfo?.storeId]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleAccept = (candidateId: number) => {
    Alert.alert('대타 수락', '이 대타 요청을 수락하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '수락',
        onPress: async () => {
          try {
            await api.post(`/substitute/candidates/${candidateId}/accept`);
            loadData();
          } catch {
            Alert.alert('오류', '수락에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const handleDecline = (candidateId: number) => {
    Alert.alert('대타 거절', '이 대타 요청을 거절하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '거절',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.post(`/substitute/candidates/${candidateId}/decline`);
            loadData();
          } catch {
            Alert.alert('오류', '거절에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const isIncoming = tab === 'incoming';

  return (
    <SafeAreaView style={s.safe}>
      {/* 헤더 */}
      <View style={s.header}>
        <View style={s.headerSide} />
        <Text style={s.headerTitle}>대타 신청</Text>
        <View style={s.headerSide} />
      </View>

      {/* 탭 */}
      <View style={s.tabWrap}>
        {(['incoming', 'mine'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[s.pill, tab === t && s.pillActive]}
            onPress={() => setTab(t)}
            activeOpacity={0.8}
          >
            <Text style={[s.pillText, tab === t && s.pillTextActive]}>
              {t === 'incoming' ? '대타 요청 알림' : '내 요청 현황'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* AI 대타 배너 */}
      {isIncoming && (
        <TouchableOpacity
          style={s.aiBanner}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('AiSubstituteSchedule')}
        >
          <View style={s.aiBannerOverlay} />
          <View style={s.aiBannerLeft}>
            <View style={s.aiBadge}>
              <Text style={s.aiBadgeText}>AI</Text>
            </View>
            <View>
              <Text style={s.aiBannerTitle}>일해조 AI 대타 요청하기</Text>
              <Text style={s.aiBannerSub}>AI가 최적의 대타 후보를 찾아드려요</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
      )}

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : isIncoming ? (
        <FlatList
          data={incoming}
          keyExtractor={item => String(item.candidateId)}
          renderItem={({ item }) => (
            <IncomingCard
              item={item}
              onAccept={() => handleAccept(item.candidateId)}
              onDecline={() => handleDecline(item.candidateId)}
            />
          )}
          ItemSeparatorComponent={() => <View style={s.sep} />}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyText}>들어온 대타 요청이 없습니다.</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={mine}
          keyExtractor={item => String(item.requestId)}
          renderItem={({ item }) => <MineCard item={item} />}
          contentContainerStyle={[s.listContent, { paddingTop: 12 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyText}>요청 내역이 없습니다.</Text>
            </View>
          }
        />
      )}

      {/* FAB — 대타 요청 시작 */}
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

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  headerSide:  { width: 36 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#1A1A1A' },

  tabWrap: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  pill:          { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: '#DDDDDD' },
  pillActive:    { borderColor: Colors.primary },
  pillText:      { fontSize: 12, fontWeight: '600', color: '#AAAAAA' },
  pillTextActive:{ color: Colors.primary },

  aiBanner: {
    marginHorizontal: 16, marginTop: 12, marginBottom: 4,
    backgroundColor: '#FF8D28',
    borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#FF8D28', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
  },
  aiBannerOverlay: {
    position: 'absolute', right: -20, top: -20,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  aiBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  aiBadge: {
    backgroundColor: '#FFFFFF', borderRadius: 8,
    paddingHorizontal: 9, paddingVertical: 4,
  },
  aiBadgeText: { fontSize: 12, fontWeight: '800', color: '#FF8D28' },
  aiBannerTitle: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  aiBannerSub: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  listContent: { paddingBottom: 100 },
  sep:         { height: 1, backgroundColor: '#F0F0F0' },
  empty:       { alignItems: 'center', paddingTop: 60 },
  emptyText:   { fontSize: 14, color: '#AAAAAA' },

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
