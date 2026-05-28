import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from 'react-native';
import Header from '../../components/Header';
import { BottomTabBarStatic } from '../../components/BottomTabBar';

interface ChatItem {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  isRead: boolean;
}

const CHAT_DATA: ChatItem[] = [
  { id: '1', name: '강다은', lastMessage: '넵 알했습니다!', time: '어제', isRead: true },
  { id: '2', name: 'Kaitlyn', lastMessage: 'Have a good one!', time: '3:02 PM', isRead: true },
  { id: '3', name: 'Phoebe', lastMessage: 'Good bye!', time: '7h-15min', isRead: false },
  { id: '4', name: 'Jack', lastMessage: 'See you again!', time: '7h-00min', isRead: false },
  { id: '5', name: 'Gibson', lastMessage: '', time: '', isRead: false },
  { id: '6', name: 'John Doe', lastMessage: 'Okay, Thank you!', time: '', isRead: false },
];

function Avatar() {
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarIcon}>👤</Text>
    </View>
  );
}

function ChatRow({ item }: { item: ChatItem }) {
  return (
    <View style={styles.row}>
      <Avatar />
      <View style={styles.rowCenter}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.messageRow}>
          {item.isRead && <Text style={styles.readIcon}>✓✓ </Text>}
          {item.lastMessage ? (
            <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
          ) : null}
        </View>
      </View>
      {item.time ? <Text style={styles.time}>{item.time}</Text> : null}
    </View>
  );
}

export default function MessengerScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="메신저" titleStyle={styles.headerTitle} />

      <FlatList
        data={CHAT_DATA}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ChatRow item={item} />}
        style={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />

      <BottomTabBarStatic activeIndex={2} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '500',
  },

  list: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#F2F2F2',
    marginHorizontal: 0,
  },
  separator: {
    height: 1,
    backgroundColor: '#F2F2F2',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 500,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: {
    fontSize: 22,
  },

  rowCenter: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 14,
    color: '#000000',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readIcon: {
    fontSize: 12,
    color: '#34C759',
  },
  lastMessage: {
    fontSize: 12,
    color: '#5F6C7B',
    flex: 1,
  },

  time: {
    fontSize: 12,
    color: '#5F6C7B',
    alignSelf: 'flex-start',
    marginTop: 2,
  },
});
