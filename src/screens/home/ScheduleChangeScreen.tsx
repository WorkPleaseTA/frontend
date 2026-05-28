import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface ChangeItem {
  id: string;
  date: string;
  from: string;
  to: string;
  time: string;
  reason: string;
  status: '완료' | '진행중';
}

const CHANGE_DATA: ChangeItem[] = [
  {
    id: '1',
    date: '2026.05.10',
    from: '노민혁',
    to: '최민호',
    time: '08:00~12:30',
    reason: '집안 행사',
    status: '완료',
  },
  {
    id: '2',
    date: '2026.06.11',
    from: '정미희',
    to: '이주하',
    time: '12:00~15:00',
    reason: '학교 시험',
    status: '완료',
  },
  {
    id: '3',
    date: '2026.05.12',
    from: '이주하',
    to: '최민호',
    time: '11:00~20:30',
    reason: '여행',
    status: '진행중',
  },
  {
    id: '4',
    date: '2026.06.20',
    from: '김주영',
    to: '이하은',
    time: '13:00~18:00',
    reason: '병가',
    status: '진행중',
  },
];

const TABS = [
  { name: '홈', icon: '🏠' },
  { name: '캘린더', icon: '📅' },
  { name: '채팅', icon: '💬' },
  { name: '알림', icon: '🔔' },
  { name: '메모', icon: '📝' },
];
const ACTIVE_TAB = 3;

export default function ScheduleChangeScreen() {
  const navigation = useNavigation();

  const renderItem = ({ item }: { item: ChangeItem }) => {
    const isDone = item.status === '완료';
    return (
      <View style={styles.card}>
        <View style={styles.cardBody}>
          <Text style={styles.cardDate}>{item.date}</Text>
          <Text style={styles.cardName}>
            {item.from} → {item.to}
          </Text>
          <Text style={styles.cardMeta}>{item.time}</Text>
          <Text style={styles.cardMeta}>사유: {item.reason}</Text>
        </View>
        <View style={[styles.statusBadge, isDone ? styles.statusDone : styles.statusPending]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>스케줄 변동 현황</Text>
        <View style={styles.headerRight} />
      </View>

      {/* 카드 리스트 */}
      <FlatList
        data={CHANGE_DATA}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />

      {/* 하단 탭바 (알림 탭 활성) */}
      <View style={styles.tabBar}>
        {TABS.map((tab, index) => {
          const isActive = index === ACTIVE_TAB;
          return (
            <TouchableOpacity key={tab.name} style={styles.tab} activeOpacity={0.7}>
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
  },
  backIcon: {
    fontSize: 22,
    color: '#1A1A1A',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  headerRight: {
    width: 40,
  },

  // 리스트
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  separator: {
    height: 12,
  },

  // 카드
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9F1FF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardBody: {
    flex: 1,
    gap: 3,
  },
  cardDate: {
    fontSize: 14,
    color: '#848A94',
    marginBottom: 2,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  cardMeta: {
    fontSize: 10,
    color: '#848A94',
  },

  // 상태 배지 (원형 테두리)
  statusBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  statusDone: {
    borderColor: '#34C759',
  },
  statusPending: {
    borderColor: '#FFE261',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#094067',
  },

  // 하단 탭바
  tabBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabIcon: {
    fontSize: 20,
  },
  tabLabel: {
    fontSize: 11,
    color: '#666666',
  },
  tabLabelActive: {
    color: '#FF8C00',
    fontWeight: '600',
  },
});
