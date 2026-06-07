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
  ScrollView,
  Alert,
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

type Route = RouteProp<RootStackParamList, 'GroupChat'>;

interface Message {
  id: number;
  content: string;
  senderName: string;
  storeMemberId: number;
  createdAt: string;
  mine: boolean;
}

const fmtTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
};

const AVATAR_COLORS = ['#5B9BD5', '#7B68EE', '#52B788', '#E07070', '#F4A261'];
const avatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

function Bubble({ item, showSender }: { item: Message; showSender: boolean }) {
  return (
    <View style={[styles.row, item.mine ? styles.rowMe : styles.rowOther]}>
      {!item.mine && (
        <View style={styles.avatarSlot}>
          {showSender && (
            <View style={[styles.avatar, { backgroundColor: avatarColor(item.senderName ?? '?') }]}>
              <Text style={styles.avatarText}>{(item.senderName ?? '?').charAt(0)}</Text>
            </View>
          )}
        </View>
      )}
      <View style={styles.msgWrap}>
        {showSender && !item.mine && (
          <Text style={styles.senderName}>{item.senderName}</Text>
        )}
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

// ── AI TODO 섹션 ──────────────────────────────────────────────────────────────

function AiTodoSection({ roomId, storeId }: { roomId: number; storeId: number }) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);

  const extract = async () => {
    setExtracting(true);
    try {
      const res = await api.post('/ai/todos/extract', { roomId });
      // 서버가 data.data.suggestions 또는 data.suggestions 두 구조 모두 처리
      const sug: string[] = res.data.data?.todos ?? [];
      setSuggestions(sug);
      setSelected([]);
      if (sug.length === 0) {
        Alert.alert('알림', 'TODO로 추출할 항목이 없습니다.\n채팅 내용이 부족하거나 이미 추출된 내용일 수 있습니다.');
      }
    } catch (e: any) {
      Alert.alert('오류', `AI TODO 추출 실패: ${e?.response?.data?.message ?? e?.message ?? '알 수 없는 오류'}`);
    } finally {
      setExtracting(false);
    }
  };

  const toggle = (i: number) =>
    setSelected(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const save = async () => {
    if (selected.length === 0) return;
    setSaving(true);
    try {
      await Promise.all(
        selected.map(i => api.post('/todos', { storeId, content: suggestions[i] }))
      );
      setSuggestions([]);
      setSelected([]);
    } catch {
      Alert.alert('오류', 'TODO 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.aiSection}>
      <View style={styles.aiHeader}>
        <Text style={styles.aiTitle}>AI TO-DO 자동 변환</Text>
        <TouchableOpacity
          style={[styles.aiExtractBtn, extracting && { opacity: 0.6 }]}
          onPress={extract}
          disabled={extracting}
          activeOpacity={0.8}
        >
          {extracting
            ? <ActivityIndicator size="small" color="#FFFFFF" />
            : <Text style={styles.aiExtractText}>✨ 추출</Text>
          }
        </TouchableOpacity>
      </View>

      {suggestions.length > 0 && (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.aiChips}
          >
            {suggestions.map((s, i) => {
              const sel = selected.includes(i);
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.chip, sel && styles.chipSelected]}
                  onPress={() => toggle(i)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, sel && styles.chipTextSelected]}>{s}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {selected.length > 0 && (
            <TouchableOpacity
              style={[styles.aiSaveBtn, saving && { opacity: 0.6 }]}
              onPress={save}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving
                ? <ActivityIndicator size="small" color="#FFFFFF" />
                : <Text style={styles.aiSaveText}>선택 항목 TODO 추가 ({selected.length})</Text>
              }
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

// ── 메인 화면 ─────────────────────────────────────────────────────────────────

export default function GroupChatScreen() {
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

  // 메시지 초기 로드 + 읽음 처리
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/chat/rooms/${roomId}/messages?size=30`);
        const data: Message[] = res.data.data ?? [];
        // GET 응답은 서버가 mine을 정확히 계산해서 내려주므로 그대로 사용
        setMessages(data);
        if (data.length > 0) {
          const lastId = data[data.length - 1].id;
          api.post(`/chat/rooms/${roomId}/read`, { lastMessageId: lastId }).catch(() => {});
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [roomId]);

  // STOMP 연결
  useEffect(() => {
    let client: Client;
    const connect = async () => {
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

  useEffect(() => {
    if (!loading) scrollToBottom(false);
  }, [loading]);

  const send = () => {
    const text = input.trim();
    if (!text) return;

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
        <Text style={styles.headerName} numberOfLines={1}>{roomName}</Text>
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
            renderItem={({ item, index }) => {
              const prev = index > 0 ? messages[index - 1] : null;
              const showSender = !item.mine && item.senderName !== prev?.senderName;
              return <Bubble item={item} showSender={showSender} />;
            }}
            contentContainerStyle={styles.msgList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.empty}>메시지가 없습니다</Text>
              </View>
            }
          />
        )}

        {storeInfo && (
          <AiTodoSection roomId={roomId} storeId={storeInfo.storeId} />
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
  headerName: { flex: 1, fontSize: 16, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' },

  avatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  avatarSlot: { width: 34, alignItems: 'center' },

  msgList: { paddingHorizontal: 14, paddingTop: 16, paddingBottom: 12, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 2 },
  rowMe: { flexDirection: 'row-reverse' },
  rowOther: { flexDirection: 'row' },
  msgWrap: { maxWidth: '68%', gap: 3 },
  senderName: { fontSize: 12, fontWeight: '600', color: '#555555', marginLeft: 2, marginBottom: 3 },
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

  // AI TODO
  aiSection: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1, borderTopColor: '#E9E9E9',
    paddingHorizontal: 14, paddingVertical: 10, gap: 8,
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  aiTitle: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
  aiExtractBtn: {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  aiExtractText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
  aiChips: { flexDirection: 'row', gap: 8, paddingRight: 4 },
  chip: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E9F1FF',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
  },
  chipSelected: { backgroundColor: Colors.primary, borderWidth: 0 },
  chipText: { fontSize: 12, color: '#1A1A1A' },
  chipTextSelected: { color: '#FFFFFF' },
  aiSaveBtn: {
    backgroundColor: Colors.primary, borderRadius: 8,
    paddingVertical: 8, alignItems: 'center',
  },
  aiSaveText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },

  // Input
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F0F0F0', gap: 6,
  },
  input: {
    flex: 1, minHeight: 36, maxHeight: 100,
    backgroundColor: '#F5F5F5', borderRadius: 18,
    paddingHorizontal: 14, paddingVertical: 8, fontSize: 14, color: '#1A1A1A',
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  sendIcon: { fontSize: 14, color: '#FFFFFF', marginLeft: 2 },
});
