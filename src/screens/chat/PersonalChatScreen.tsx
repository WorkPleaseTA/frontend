import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { Client } from '@stomp/stompjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

type Route = RouteProp<RootStackParamList, 'PersonalChat'>;

interface Message {
  id: number;
  content: string;
  senderName: string;
  storeMemberId: number;
  createdAt: string;
  mine: boolean;
}

const fmtTime = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

function Bubble({ item }: { item: Message }) {
  return (
    <View style={[styles.row, item.mine ? styles.rowMe : styles.rowOther]}>
      {!item.mine && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(item.senderName ?? '?').charAt(0)}</Text>
        </View>
      )}
      <View style={styles.msgWrap}>
        <View style={[styles.bubble, item.mine ? styles.bubbleMe : styles.bubbleOther]}>
          <Text style={[styles.bubbleText, item.mine && styles.bubbleTextMe]}>
            {item.content}
          </Text>
        </View>
        <Text style={[styles.time, item.mine ? styles.timeMe : styles.timeOther]}>
          {fmtTime(item.createdAt)}
        </Text>
      </View>
    </View>
  );
}

export default function PersonalChatScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { roomId, roomName } = route.params;
  const { storeInfo } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  const listRef = useRef<FlatList>(null);
  const stompRef = useRef<Client | null>(null);
  const tempIdRef = useRef(-1);
  const myId = storeInfo?.storeMemberId;

  const scrollToBottom = (animated = true) =>
    setTimeout(() => listRef.current?.scrollToEnd({ animated }), 80);

  // 초기 메시지 로드
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/chat/rooms/${roomId}/messages?size=30`);
        const data: Message[] = res.data.data ?? [];
        setMessages(data);
        if (data.length > 0) {
          api.post(`/chat/rooms/${roomId}/read`, { lastMessageId: data[data.length - 1].id }).catch(() => {});
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [roomId]);

  // 로드 완료 후 맨 아래로
  useEffect(() => {
    if (!loading) scrollToBottom(false);
  }, [loading]);

  // STOMP 연결
  useEffect(() => {
    let client: Client;
    const connect = async () => {
      // 인터셉터가 만료 토큰을 갱신하고 AsyncStorage를 업데이트하도록 먼저 호출
      try { await api.get('/stores/me'); } catch {}
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return;
      client = new Client({
        webSocketFactory: () => new WebSocket('wss://workmanager.store/ws'),
        connectHeaders: { Authorization: `Bearer ${token}` },
        reconnectDelay: 5000,
        forceBinaryWSFrames: true,
        appendMissingNULLonIncoming: true,
        heartbeatIncoming: 0,
        heartbeatOutgoing: 20000,
        onConnect: () => {
          setConnected(true);
          client.subscribe(`/topic/chat/${roomId}`, frame => {
            try {
              const msg = JSON.parse(frame.body);
              const incoming: Message = { ...msg, mine: msg.storeMemberId === myId };
              setMessages(prev => {
                const tempIdx = prev.findIndex(
                  m => m.id < 0 && m.storeMemberId === myId && m.content === incoming.content
                );
                if (tempIdx >= 0) {
                  const next = [...prev];
                  next[tempIdx] = incoming;
                  return next;
                }
                return [...prev, incoming];
              });
              api.post(`/chat/rooms/${roomId}/read`, { lastMessageId: msg.id }).catch(() => {});
              scrollToBottom(true);
            } catch {}
          });
        },
        onDisconnect: () => setConnected(false),
        onStompError: () => setConnected(false),
        onWebSocketError: () => setConnected(false),
        onWebSocketClose: () => setConnected(false),
      });
      client.activate();
      stompRef.current = client;
    };
    connect();
    return () => {
      setConnected(false);
      client?.deactivate();
    };
  }, [roomId]);

  const send = () => {
    const text = input.trim();
    if (!text) return;

    // 낙관적 메시지: STOMP 연결 여부와 무관하게 즉시 표시
    const tempId = tempIdRef.current--;
    const optimistic: Message = {
      id: tempId,
      content: text,
      senderName: storeInfo?.name ?? '',
      storeMemberId: myId ?? 0,
      createdAt: new Date().toISOString(),
      mine: true,
    };
    setMessages(prev => [...prev, optimistic]);
    setInput('');
    scrollToBottom(true);

    if (connected) {
      stompRef.current?.publish({
        destination: `/app/chat/${roomId}`,
        body: JSON.stringify({ content: text }),
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerName} numberOfLines={1}>{roomName}</Text>
          <View style={[styles.dot, connected ? styles.dotOn : styles.dotOff]} />
        </View>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={m => String(m.id)}
            renderItem={({ item }) => <Bubble item={item} />}
            contentContainerStyle={styles.msgList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.empty}>메시지가 없습니다</Text>
              </View>
            }
          />
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="메시지를 입력하세요"
            placeholderTextColor="#BBBBBB"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            onSubmitEditing={send}
          />
          {input.trim().length > 0 && (
            <TouchableOpacity style={styles.sendBtn} onPress={send} activeOpacity={0.8}>
              <Ionicons name="send" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1, backgroundColor: '#F6F6F6' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { fontSize: 14, color: '#AAAAAA' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: 36 },
  backArrow: { fontSize: 22, color: '#1A1A1A' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  headerName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  dot: { width: 7, height: 7, borderRadius: 4 },
  dotOn: { backgroundColor: '#4CAF50' },
  dotOff: { backgroundColor: '#CCCCCC' },

  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#D0D0D0', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },

  msgList: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 2 },
  rowMe: { flexDirection: 'row-reverse' },
  rowOther: { flexDirection: 'row' },
  msgWrap: { maxWidth: '72%', gap: 4 },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
  bubbleMe: {
    backgroundColor: Colors.primary, borderBottomRightRadius: 4, alignSelf: 'flex-end',
  },
  bubbleOther: {
    backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4, alignSelf: 'flex-start',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
  },
  bubbleText: { fontSize: 14, color: '#1A1A1A', lineHeight: 20 },
  bubbleTextMe: { color: '#FFFFFF' },
  time: { fontSize: 11, color: '#BBBBBB' },
  timeMe: { textAlign: 'right' },
  timeOther: { textAlign: 'left' },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F0F0F0', gap: 6,
  },
  input: {
    flex: 1, minHeight: 36, maxHeight: 100,
    backgroundColor: '#F5F5F5', borderRadius: 18,
    paddingHorizontal: 14, paddingVertical: 8,
    fontSize: 14, color: '#1A1A1A',
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  sendIcon: { fontSize: 14, color: '#FFFFFF', marginLeft: 2 },
});
