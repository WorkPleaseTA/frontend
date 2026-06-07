import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../constants/colors';

type Nav   = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'AiSubstituteList'>;

type Candidate = {
  storeMemberId: number;
  staffName: string;
  availableTimes: string[];
};

const AVATAR_COLORS = ['#5B9BD5', '#7B68EE', '#52B788', '#E07070', '#F4A261'];
const avatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const fmtDate = (d: string) => {
  try { const [, m, dd] = d.split('-'); return `${Number(m)}월 ${Number(dd)}일`; }
  catch { return d; }
};
const fmtTime = (t: string) => t.slice(0, 5);

// ── 후보 카드 ──────────────────────────────────────────────────────────────────

function CandidateCard({
  item,
  selected,
  onToggle,
  rank,
}: {
  item: Candidate;
  selected: boolean;
  onToggle: () => void;
  rank: number;
}) {
  const color = avatarColor(item.staffName);
  return (
    <TouchableOpacity
      style={[card.wrap, selected && card.wrapSelected]}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      {/* 순위 뱃지 */}
      {rank <= 3 && (
        <View style={[card.rankBadge, rank === 1 && card.rank1, rank === 2 && card.rank2, rank === 3 && card.rank3]}>
          <Text style={card.rankText}>{rank}위</Text>
        </View>
      )}

      {/* 아바타 */}
      <View style={[card.avatar, { backgroundColor: color }]}>
        <Text style={card.avatarText}>{item.staffName.charAt(0)}</Text>
      </View>

      {/* 정보 */}
      <View style={card.info}>
        <Text style={card.name}>{item.staffName}</Text>
        {item.availableTimes && item.availableTimes.length > 0 && (
          <Text style={card.times} numberOfLines={1}>
            🕐 {item.availableTimes.join(', ')}
          </Text>
        )}
        <Text style={card.aiLabel}>AI 추천순 정렬</Text>
      </View>

      {/* 체크 */}
      <View style={[card.check, selected && card.checkSelected]}>
        {selected && <Text style={card.checkMark}>✓</Text>}
      </View>
    </TouchableOpacity>
  );
}

const card = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 14,
    padding: 14, marginHorizontal: 16, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    borderWidth: 2, borderColor: 'transparent',
  },
  wrapSelected: { borderColor: Colors.primary, backgroundColor: '#FFF8F5' },

  rankBadge: { position: 'absolute', top: 10, left: 10, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  rank1: { backgroundColor: '#FFD700' },
  rank2: { backgroundColor: '#C0C0C0' },
  rank3: { backgroundColor: '#CD7F32' },
  rankText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },

  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },

  info: { flex: 1, gap: 3 },
  name: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  times: { fontSize: 12, color: '#888888' },
  aiLabel: { fontSize: 11, color: Colors.primary, fontWeight: '500' },

  check: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: '#DDDDDD',
    alignItems: 'center', justifyContent: 'center',
  },
  checkSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkMark: { fontSize: 13, color: '#FFFFFF', fontWeight: '700' },
});

// ── 메인 화면 ─────────────────────────────────────────────────────────────────

export default function AiSubstituteListScreen() {
  const navigation = useNavigation<Nav>();
  const route      = useRoute<Route>();
  const { candidates, requestDate, startTime, endTime } = route.params;

  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggle = (id: number) =>
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleNext = () => {
    if (selected.size === 0) {
      Alert.alert('선택 필요', '대타 요청을 보낼 직원을 선택해주세요.');
      return;
    }
    const selectedCandidates = candidates.filter(c => selected.has(c.storeMemberId));
    (navigation as any).navigate('SubstituteFail', {
      selectedCandidates,
      requestDate,
      startTime,
      endTime,
    });
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* 헤더 */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={s.backBtn}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>AI 대타 추천</Text>
        <View style={s.placeholder} />
      </View>

      {/* 요청 정보 요약 */}
      <View style={s.summaryBar}>
        <Text style={s.summaryText}>
          {fmtDate(requestDate)} · {fmtTime(startTime)}~{fmtTime(endTime)}
        </Text>
      </View>

      {/* AI 안내 */}
      <View style={s.infoCard}>
        <Text style={s.infoIcon}>✨</Text>
        <View style={s.infoText}>
          <Text style={s.infoTitle}>AI가 최적의 대타를 추천해 드려요</Text>
          <Text style={s.infoDesc}>대타 가능 시간 기반으로 정렬했어요. 여러 명 선택 가능합니다.</Text>
        </View>
      </View>

      {/* 후보 목록 */}
      <FlatList
        data={candidates}
        keyExtractor={item => String(item.storeMemberId)}
        renderItem={({ item, index }) => (
          <CandidateCard
            item={item}
            selected={selected.has(item.storeMemberId)}
            onToggle={() => toggle(item.storeMemberId)}
            rank={index + 1}
          />
        )}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />

      {/* 다음 버튼 */}
      <View style={s.bottomBar}>
        <TouchableOpacity
          style={[s.nextBtn, selected.size > 0 && s.nextBtnActive]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={[s.nextBtnText, selected.size > 0 && s.nextBtnTextActive]}>
            {selected.size > 0 ? `${selected.size}명에게 요청 보내기` : '직원을 선택해주세요'}
          </Text>
        </TouchableOpacity>
      </View>
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
  backBtn:     { width: 36 },
  backArrow:   { fontSize: 22, color: '#1A1A1A' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  placeholder: { width: 36 },

  summaryBar: {
    backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 12,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
    alignItems: 'center',
  },
  summaryText: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginBottom: 14,
    backgroundColor: '#FFF4EE', borderRadius: 12,
    borderWidth: 1, borderColor: '#FFD4B8',
    paddingHorizontal: 14, paddingVertical: 12,
  },
  infoIcon: { fontSize: 20 },
  infoText: { flex: 1, gap: 2 },
  infoTitle:{ fontSize: 13, fontWeight: '700', color: Colors.primary },
  infoDesc: { fontSize: 12, color: '#888888' },

  list: { paddingBottom: 100, paddingTop: 4 },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF', padding: 16,
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  nextBtn: {
    borderRadius: 12, paddingVertical: 15, alignItems: 'center',
    backgroundColor: '#E0E0E0',
  },
  nextBtnActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  nextBtnText:      { fontSize: 15, fontWeight: '700', color: '#AAAAAA' },
  nextBtnTextActive:{ color: '#FFFFFF' },
});
