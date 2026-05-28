import React from 'react';
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

type Candidate = {
  id: string;
  name: string;
  initial: string;
  color: string;
  role: string;
  availableDays: string;
  availableTime: string;
  matchScore: number;
};

const CANDIDATES: Candidate[] = [
  {
    id: '1', name: '이바리스타', initial: '이', color: '#7B68EE',
    role: '바리스타', availableDays: '월·화·목', availableTime: '09:00 – 18:00',
    matchScore: 98,
  },
  {
    id: '2', name: '박알바', initial: '박', color: '#52B788',
    role: '아르바이트', availableDays: '수·금·토', availableTime: '13:00 – 22:00',
    matchScore: 87,
  },
  {
    id: '3', name: '최직원', initial: '최', color: '#E07070',
    role: '아르바이트', availableDays: '화·목·일', availableTime: '10:00 – 19:00',
    matchScore: 74,
  },
  {
    id: '4', name: '정아르바이트', initial: '정', color: '#5B9BD5',
    role: '아르바이트', availableDays: '월·수·금', availableTime: '09:00 – 15:00',
    matchScore: 61,
  },
];

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 90 ? '#27AE60' : score >= 70 ? Colors.primary : '#AAAAAA';
  const bg    = score >= 90 ? '#E8F5E9' : score >= 70 ? '#FFF4EE' : '#F5F5F5';
  return (
    <View style={[badge.wrap, { backgroundColor: bg }]}>
      <Text style={[badge.text, { color }]}>{score}%</Text>
    </View>
  );
}

const badge = StyleSheet.create({
  wrap: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  text: { fontSize: 12, fontWeight: '700' },
});

function CandidateCard({
  item,
  onPress,
}: {
  item: Candidate;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={card.wrap} onPress={onPress} activeOpacity={0.8}>
      {/* Avatar */}
      <View style={[card.avatar, { backgroundColor: item.color }]}>
        <Text style={card.avatarText}>{item.initial}</Text>
      </View>

      {/* Info */}
      <View style={card.info}>
        <View style={card.topRow}>
          <Text style={card.name}>{item.name}</Text>
          <View style={card.roleBadge}>
            <Text style={card.roleText}>{item.role}</Text>
          </View>
        </View>
        <Text style={card.days}>{item.availableDays}</Text>
        <View style={card.timeRow}>
          <Text style={card.timeIcon}>🕐</Text>
          <Text style={card.time}>{item.availableTime}</Text>
        </View>
      </View>

      {/* Match score + arrow */}
      <View style={card.right}>
        <ScoreBadge score={item.matchScore} />
        <Text style={card.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const card = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  info: { flex: 1, gap: 4 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  roleBadge: {
    backgroundColor: '#F5F5F5', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  roleText: { fontSize: 11, color: '#888888', fontWeight: '500' },
  days: { fontSize: 12, color: '#888888' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeIcon: { fontSize: 12 },
  time: { fontSize: 12, color: '#555555', fontWeight: '500' },
  right: { alignItems: 'center', gap: 6, flexShrink: 0 },
  arrow: { fontSize: 18, color: '#CCCCCC' },
});

// ── Main screen ────────────────────────────────────────────────────────────

export default function AiSubstituteListScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={s.backBtn}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>AI 대타 신청</Text>
        <View style={s.placeholder} />
      </View>

      {/* AI 추천 안내 */}
      <View style={s.infoCard}>
        <Text style={s.infoIcon}>✨</Text>
        <View style={s.infoText}>
          <Text style={s.infoTitle}>AI가 최적의 대타를 추천해 드려요</Text>
          <Text style={s.infoDesc}>근무 이력과 가능 시간대를 기반으로 매칭했어요.</Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={CANDIDATES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CandidateCard
            item={item}
            onPress={() => navigation.navigate('AiSubstituteSchedule')}
          />
        )}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
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
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontSize: 17, fontWeight: '700', color: '#1A1A1A',
  },
  placeholder: { width: 36 },

  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginBottom: 14,
    backgroundColor: '#FFF4EE', borderRadius: 12,
    borderWidth: 1, borderColor: '#FFD4B8',
    paddingHorizontal: 14, paddingVertical: 12,
  },
  infoIcon: { fontSize: 20 },
  infoText: { flex: 1, gap: 2 },
  infoTitle: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  infoDesc: { fontSize: 12, color: '#888888' },

  list: { paddingBottom: 32, paddingTop: 4 },
});
