import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

type ApiStatus = 'PENDING' | 'ACCEPTED' | 'CANCELLED';

interface SubRecord {
  requestId: number;
  requestDate: string;
  startTime: string;
  endTime: string;
  absenteeName: string;
  substituteName: string | null;
  message: string;
  status: ApiStatus;
}

const DAY_KR = ['일', '월', '화', '수', '목', '금', '토'];

const fmtDateFull = (d: string) => {
  const dt = new Date(d + 'T00:00:00');
  return `${dt.getMonth() + 1}월 ${dt.getDate()}일 (${DAY_KR[dt.getDay()]})`;
};
const fmtTime = (t: string) => t.slice(0, 5);

const ACCENT:    Record<ApiStatus, string> = { ACCEPTED: '#22C55E', PENDING: '#F59E0B', CANCELLED: '#9CA3AF' };
const PILL_BG:   Record<ApiStatus, string> = { ACCEPTED: '#ECFDF5', PENDING: '#FFFBEB', CANCELLED: '#F3F4F6' };
const PILL_TEXT: Record<ApiStatus, string> = { ACCEPTED: '#16A34A', PENDING: '#D97706', CANCELLED: '#6B7280' };
const LABEL:     Record<ApiStatus, string> = { ACCEPTED: '완료',    PENDING: '진행 중',  CANCELLED: '취소'   };

function SubCard({ item }: { item: SubRecord }) {
  const accentColor = ACCENT[item.status];
  const sub         = item.substituteName ?? (item.status === 'PENDING' ? '미정' : '-');
  const subGray     = !item.substituteName;

  return (
    <View style={s.card}>
      {/* 상태 색 바 */}
      <View style={[s.accentBar, { backgroundColor: accentColor }]} />

      <View style={s.cardBody}>
        {/* 날짜 + 상태 뱃지 */}
        <View style={s.cardTopRow}>
          <Text style={s.cardDate}>{fmtDateFull(item.requestDate)}</Text>
          <View style={[s.pill, { backgroundColor: PILL_BG[item.status] }]}>
            <Text style={[s.pillText, { color: PILL_TEXT[item.status] }]}>
              {LABEL[item.status]}
            </Text>
          </View>
        </View>

        {/* 시간 */}
        <Text style={s.cardTime}>
          {fmtTime(item.startTime)} - {fmtTime(item.endTime)}
        </Text>

        {/* 이름 화살표 */}
        <View style={s.namesRow}>
          <Text style={s.fromName}>{item.absenteeName}</Text>
          <Text style={s.arrowChar}>→</Text>
          <Text style={[s.toName, subGray && s.toNameGray]}>{sub}</Text>
        </View>

        {/* 사유 */}
        <Text style={s.cardMsg}>사유: {item.message}</Text>
      </View>
    </View>
  );
}

export default function ManagerNotificationScreen() {
  const { storeInfo }               = useAuth();
  const [records, setRecords]       = useState<SubRecord[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!storeInfo) { setLoading(false); return; }
    try {
      const res = await api.get(`/substitute/requests/store?storeId=${storeInfo.storeId}`);
      setRecords(res.data.data ?? []);
    } catch {
      // 빈 상태 유지
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [storeInfo?.storeId]);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    loadData();
  }, [loadData]));

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.headerTitle}>스케줄 변동 현황</Text>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color="#FF8D28" />
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={item => String(item.requestId)}
          renderItem={({ item }) => <SubCard item={item} />}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyText}>스케줄 변동 내역이 없습니다</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadData(); }}
              colors={['#FF8D28']}
              tintColor="#FF8D28"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F5F6FA' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A' },

  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 12,
  },
  empty:     { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 14, color: '#AAAAAA' },

  // ── 카드 ──────────────────────────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  accentBar: { width: 4 },
  cardBody:  { flex: 1, paddingHorizontal: 16, paddingVertical: 16, gap: 6 },

  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: { fontSize: 13, fontWeight: '600', color: '#374151' },

  pill:     { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  pillText: { fontSize: 11, fontWeight: '700' },

  cardTime: { fontSize: 13, color: '#6B7280', marginTop: -2 },

  namesRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 },
  fromName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  arrowChar: { fontSize: 14, color: '#D1D5DB' },
  toName:    { fontSize: 16, fontWeight: '700', color: '#111827' },
  toNameGray:{ color: '#9CA3AF' },

  cardMsg: { fontSize: 12, color: '#9CA3AF' },
});
