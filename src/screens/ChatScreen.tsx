import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  SectionList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../constants/colors';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type ChatItem = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  isGroup: boolean;
  count?: number;
};

const GROUP_CHATS: ChatItem[] = [
  { id: 'g1', name: '스타벅스 강남점 전체', lastMessage: '김매니저: 내일 전체 미팅 있습니다', time: '오후 3:00', unread: 5, isGroup: true, count: 12 },
  { id: 'g2', name: '주말 근무팀', lastMessage: '이바리스타: 주말 스케줄 올렸어요', time: '오후 12:30', unread: 0, isGroup: true, count: 4 },
  { id: 'g3', name: '신입 환영방', lastMessage: '환영합니다 🎉', time: '어제', unread: 0, isGroup: true, count: 8 },
];

const PERSONAL_CHATS: ChatItem[] = [
  { id: 'p1', name: '김매니저', lastMessage: '오늘 스케줄 확인해줘요', time: '오후 2:30', unread: 2, isGroup: false },
  { id: 'p2', name: '이바리스타', lastMessage: '네, 알겠습니다!', time: '오후 1:15', unread: 0, isGroup: false },
  { id: 'p3', name: '박알바', lastMessage: '내일 교대 가능하신가요?', time: '오전 11:00', unread: 1, isGroup: false },
  { id: 'p4', name: '최직원', lastMessage: '감사합니다 😊', time: '어제', unread: 0, isGroup: false },
  { id: 'p5', name: '정아르바이트', lastMessage: '출근했습니다', time: '어제', unread: 0, isGroup: false },
];

const SECTIONS = [
  { title: '단체채팅', data: GROUP_CHATS },
  { title: '개인채팅', data: PERSONAL_CHATS },
];

function GrayAvatar({ isGroup }: { isGroup: boolean }) {
  return (
    <View style={[styles.avatar, isGroup && styles.avatarGroup]}>
      <Text style={styles.avatarIcon}>{isGroup ? '👥' : '👤'}</Text>
    </View>
  );
}

function ChatRow({ item, onPress }: { item: ChatItem; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <GrayAvatar isGroup={item.isGroup} />
      <View style={styles.info}>
        <View style={styles.topRow}>
          <View style={styles.nameWrap}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            {item.isGroup && item.count != null && (
              <Text style={styles.count}>{item.count}</Text>
            )}
          </View>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.lastMsg} numberOfLines={1}>{item.lastMessage}</Text>
          {item.unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ChatScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>메신저</Text>
        <TouchableOpacity hitSlop={8}>
          <Text style={styles.headerIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Unified list: group chats first, then personal */}
      <SectionList
        sections={SECTIONS}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <ChatRow
            item={item}
            onPress={() =>
              navigation.navigate(item.isGroup ? 'GroupChat' : 'PersonalChat')
            }
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        SectionSeparatorComponent={() => <View style={styles.sectionDivider} />}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerIcon: {
    fontSize: 20,
  },
  // Section
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#AAAAAA',
    letterSpacing: 0.5,
  },
  sectionDivider: {
    height: 8,
    backgroundColor: '#F7F7F7',
  },
  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 13,
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGroup: {
    backgroundColor: '#DDEEFF',
  },
  avatarIcon: {
    fontSize: 22,
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    flexShrink: 1,
  },
  count: {
    fontSize: 13,
    color: '#AAAAAA',
    fontWeight: '500',
  },
  time: {
    fontSize: 12,
    color: '#AAAAAA',
    flexShrink: 0,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMsg: {
    flex: 1,
    fontSize: 13,
    color: '#888888',
    marginRight: 8,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  separator: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginLeft: 82,
  },
});
