import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SectionList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface ChatRoom {
  roomId: number;
  roomType: 'GROUP' | 'DIRECT';
  name: string;
  lastMessage: string;
  unreadCount: number;
}

const AVATAR_COLORS = ['#5B9BD5', '#52B788', '#E07070', '#F4A261', '#7B68EE', '#4ECDC4'];

function RoomAvatar({ name, isGroup }: { name: string; isGroup: boolean }) {
  if (isGroup) {
    return (
      <View style={[styles.avatar, { backgroundColor: '#FFF0E6' }]}>
        <Text style={[styles.avatarLetter, { color: Colors.primary }]}>단</Text>
      </View>
    );
  }
  const color = AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
  return (
    <View style={[styles.avatar, { backgroundColor: color + '22' }]}>
      <Text style={[styles.avatarLetter, { color }]}>{name?.charAt(0) ?? '?'}</Text>
    </View>
  );
}

function ChatRow({ item, onPress }: { item: ChatRoom; onPress: () => void }) {
  const isGroup = item.roomType === 'GROUP';
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <RoomAvatar name={item.name} isGroup={isGroup} />
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          {item.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
        <Text style={styles.lastMsg} numberOfLines={1}>
          {item.lastMessage ?? ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ChatScreen() {
  const navigation = useNavigation<Nav>();
  const { storeInfo } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState(false);

  const loadRooms = useCallback(async () => {
    if (!storeInfo) {
      setLoading(false);
      return;
    }
    setError(false);
    try {
      const res = await api.get(`/chat/rooms?storeId=${storeInfo.storeId}`);
      const raw: any[] = res.data.data ?? [];
      // roomType 대소문자 정규화
      const normalized: ChatRoom[] = raw.map(r => ({
        ...r,
        roomType: String(r.roomType ?? r.type ?? '').toUpperCase() as 'GROUP' | 'DIRECT',
      }));
      setRooms(normalized);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [storeInfo?.storeId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadRooms();
    }, [loadRooms])
  );

  const groupRooms = rooms.filter(r => r.roomType === 'GROUP');
  const directRooms = rooms.filter(r => r.roomType === 'DIRECT');

  // rooms는 있는데 타입 분류가 안 되면 전체를 하나의 섹션으로 표시
  const sections =
    groupRooms.length === 0 && directRooms.length === 0 && rooms.length > 0
      ? [{ title: '채팅방', data: rooms }]
      : [
          ...(groupRooms.length > 0 ? [{ title: '단체채팅', data: groupRooms }] : []),
          ...(directRooms.length > 0 ? [{ title: '개인채팅', data: directRooms }] : []),
        ];

  const handlePress = (room: ChatRoom) => {
    if (room.roomType === 'GROUP') {
      (navigation as any).navigate('GroupChat', { roomId: room.roomId, roomName: room.name });
    } else {
      (navigation as any).navigate('PersonalChat', { roomId: room.roomId, roomName: room.name });
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.center}>
          <Text style={styles.empty}>채팅방을 불러오지 못했습니다</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => { setLoading(true); loadRooms(); }}
            activeOpacity={0.7}
          >
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (rooms.length === 0) {
      return (
        <View style={styles.center}>
          <Text style={styles.empty}>채팅방이 없습니다</Text>
        </View>
      );
    }
    return (
      <SectionList
        sections={sections}
        keyExtractor={item => String(item.roomId)}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <ChatRow item={item} onPress={() => handlePress(item)} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        SectionSeparatorComponent={() => <View style={styles.sectionDivider} />}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadRooms(); }}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>메신저</Text>
      </View>
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

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
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A' },

  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: { fontSize: 12, fontWeight: '600', color: '#AAAAAA', letterSpacing: 0.5 },
  sectionDivider: { height: 8, backgroundColor: '#F7F7F7' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 13,
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#E5E5E5',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarGroup: { backgroundColor: '#DDEEFF' },
  avatarIcon: { fontSize: 22 },
  avatarLetter: { fontSize: 18, fontWeight: '700' },

  info: { flex: 1, marginLeft: 14 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1A1A1A', marginRight: 8 },
  lastMsg: { fontSize: 13, color: '#888888' },

  badge: {
    minWidth: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },

  separator: { height: 1, backgroundColor: '#F5F5F5', marginLeft: 82 },
  empty: { fontSize: 14, color: '#AAAAAA' },
  retryBtn: {
    marginTop: 12, paddingHorizontal: 20, paddingVertical: 9,
    backgroundColor: Colors.primary, borderRadius: 20,
  },
  retryText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
});
