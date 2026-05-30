import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface NotificationItem {
  id: string;
  date: string;
  time: string;
  from: string;
  to: string;
  reason: string;
  status: '완료' | '진행중';
}

const NOTIFICATION_DATA: NotificationItem[] = [
  {
    id: '1',
    date: '2026.05.10',
    time: '08:00 ~ 12:30',
    from: '노민혁',
    to: '최민호',
    reason: '집안 행사',
    status: '완료',
  },
  {
    id: '2',
    date: '2026.06.11',
    time: '12:00 ~ 15:00',
    from: '정미회',
    to: '이주하',
    reason: '학교 시험',
    status: '완료',
  },
  {
    id: '3',
    date: '2026.05.12',
    time: '11:00 ~ 20:30',
    from: '이주하',
    to: '최민호',
    reason: '여행',
    status: '진행중',
  },
  {
    id: '4',
    date: '2026.06.22',
    time: '15:00 ~ 17:30',
    from: '김주영',
    to: '정규람',
    reason: '학교 일정',
    status: '진행중',
  },
];

const BADGE_STYLE = {
  완료:   { borderColor: '#4CAF50', color: '#4CAF50' },
  진행중: { borderColor: '#FFC107', color: '#FFC107' },
};

export default function NotificationScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (navigation as any).navigate('Home')}
          style={styles.headerSide}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>스케줄 변동 현황</Text>
        <View style={styles.headerSide} />
      </View>

      {/* 우측 상단 장식 도트 */}
      <View style={[styles.dot, styles.dotOrange]} />
      <View style={[styles.dot, styles.dotBlue]} />

      {/* 카드 리스트 */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {NOTIFICATION_DATA.map((item) => {
          const badge = BADGE_STYLE[item.status];
          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardLeft}>
                <Text style={styles.cardDateTime}>
                  {item.date}{'  '}{item.time}
                </Text>
                <Text style={styles.cardNames}>
                  {item.from} → {item.to}
                </Text>
                <Text style={styles.cardReason}>사유 : {item.reason}</Text>
              </View>
              <View style={[styles.badge, { borderColor: badge.borderColor }]}>
                <Text style={[styles.badgeText, { color: badge.color }]}>
                  {item.status}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
      {/* 하단 탭바는 Tab Navigator가 자동으로 렌더링 */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  headerSide: {
    width: 40,
  },
  backArrow: {
    fontSize: 22,
    color: '#1A1A1A',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  // 장식 도트
  dot: {
    position: 'absolute',
    borderRadius: 999,
  },
  dotOrange: {
    top: 60,
    right: 20,
    width: 10,
    height: 10,
    backgroundColor: '#FF8D28',
    opacity: 0.55,
  },
  dotBlue: {
    top: 76,
    right: 36,
    width: 7,
    height: 7,
    backgroundColor: '#4A90D9',
    opacity: 0.45,
  },

  // 스크롤
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 12,
  },

  // 카드
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical: 16,
  },
  cardLeft: {
    flex: 1,
    gap: 6,
  },
  cardDateTime: {
    fontSize: 12,
    color: '#AAAAAA',
  },
  cardNames: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  cardReason: {
    fontSize: 13,
    color: '#AAAAAA',
  },

  // 원형 배지
  badge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
