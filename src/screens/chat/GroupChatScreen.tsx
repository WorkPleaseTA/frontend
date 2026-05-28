import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';

const GROUP = { name: '스타벅스 강남점 전체', memberCount: 12 };
const ME = '홍길동';

const INIT_MSGS = [
  { id: '1', sender: '김매니저', initial: '김', text: '안녕하세요 여러분! 오늘도 파이팅!', isMe: false, time: '오후 2:50' },
  { id: '2', sender: ME, initial: '홍', text: '안녕하세요!', isMe: true, time: '오후 2:51' },
  { id: '3', sender: '이바리스타', initial: '이', text: '내일 미팅 몇 시예요?', isMe: false, time: '오후 2:52' },
  { id: '4', sender: '김매니저', initial: '김', text: '오전 10시입니다. 모두 참석 부탁드려요!', isMe: false, time: '오후 2:53' },
  { id: '5', sender: ME, initial: '홍', text: '네, 참석하겠습니다!', isMe: true, time: '오후 2:55' },
  { id: '6', sender: '박알바', initial: '박', text: '저도 참석합니다 😊', isMe: false, time: '오후 2:56' },
];

type Msg = (typeof INIT_MSGS)[0];

const AVATAR_BG: Record<string, string> = {
  '김': '#5B9BD5',
  '이': '#7B68EE',
  '박': '#52B788',
  '최': '#E07070',
  '홍': Colors.primary,
};

function SenderAvatar({ initial }: { initial: string }) {
  const bg = AVATAR_BG[initial] ?? '#AAAAAA';
  return (
    <View style={[styles.avatar, { backgroundColor: bg }]}>
      <Text style={styles.avatarText}>{initial}</Text>
    </View>
  );
}

function Bubble({ item, showSender }: { item: Msg; showSender: boolean }) {
  return (
    <View style={[styles.row, item.isMe ? styles.rowMe : styles.rowOther]}>
      {/* Left avatar slot for others */}
      {!item.isMe && (
        <View style={styles.avatarSlot}>
          {showSender && <SenderAvatar initial={item.initial} />}
        </View>
      )}

      <View style={styles.msgWrap}>
        {showSender && !item.isMe && (
          <Text style={styles.senderName}>{item.sender}</Text>
        )}
        <View style={[styles.bubble, item.isMe ? styles.bubbleMe : styles.bubbleOther]}>
          <Text style={[styles.bubbleText, item.isMe && styles.bubbleTextMe]}>
            {item.text}
          </Text>
        </View>
        <Text style={[styles.time, item.isMe ? styles.timeMe : styles.timeOther]}>
          {item.time}
        </Text>
      </View>
    </View>
  );
}

function AiTodoChip() {
  return (
    <TouchableOpacity
      style={styles.aiChip}
      activeOpacity={0.8}
      onPress={() => Alert.alert('AI TO-DO', '채팅 내용을 TO-DO 리스트로 변환합니다.')}
    >
      <Text style={styles.aiChipIcon}>✨</Text>
      <Text style={styles.aiChipText}>AI TO-DO 리스트 자동 변환</Text>
      <Text style={styles.aiChipArrow}>→</Text>
    </TouchableOpacity>
  );
}

export default function GroupChatScreen() {
  const navigation = useNavigation();
  const [msgs, setMsgs] = useState<Msg[]>(INIT_MSGS);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);
  const hasText = input.trim().length > 0;

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const now = new Date();
    setMsgs((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sender: ME,
        initial: '홍',
        text,
        isMe: true,
        time: now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInput('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerNameRow}>
            <Text style={styles.headerName} numberOfLines={1}>{GROUP.name}</Text>
            <Text style={styles.memberCount}>{GROUP.memberCount}</Text>
          </View>
          <View style={styles.workingBadge}>
            <View style={styles.workingDot} />
            <Text style={styles.workingText}>근무중</Text>
          </View>
        </View>

        <TouchableOpacity hitSlop={8} style={styles.moreBtn}>
          <Text style={styles.moreText}>•••</Text>
        </TouchableOpacity>
      </View>

      {/* ── Messages + Bottom ── */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={listRef}
          data={msgs}
          keyExtractor={(m) => m.id}
          renderItem={({ item, index }) => {
            const prev = index > 0 ? msgs[index - 1] : null;
            const showSender = !item.isMe && item.sender !== prev?.sender;
            return <Bubble item={item} showSender={showSender} />;
          }}
          contentContainerStyle={styles.msgList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />

        {/* ── AI TO-DO Chip ── */}
        <AiTodoChip />

        {/* ── Input bar ── */}
        <View style={styles.inputBar}>
          {/* Camera */}
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={styles.iconText}>📷</Text>
          </TouchableOpacity>

          {/* Text field */}
          <TextInput
            style={styles.input}
            placeholder="메시지를 입력하세요"
            placeholderTextColor="#BBBBBB"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />

          {/* Right — mic+image or send */}
          {hasText ? (
            <TouchableOpacity style={styles.sendBtn} onPress={send} activeOpacity={0.8}>
              <Text style={styles.sendIcon}>▶</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.rightIcons}>
              <TouchableOpacity style={styles.iconBtn}>
                <Text style={styles.iconText}>🖼️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <Text style={styles.iconText}>🎤</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1, backgroundColor: '#F6F6F6' },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: 36 },
  backArrow: { fontSize: 22, color: '#1A1A1A' },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  headerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    flexShrink: 1,
  },
  memberCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  workingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    gap: 4,
  },
  workingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2ECC71',
  },
  workingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#27AE60',
  },
  moreBtn: { width: 36, alignItems: 'flex-end' },
  moreText: { fontSize: 14, color: '#888888', letterSpacing: 1 },

  /* Avatar */
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  avatarSlot: { width: 34, alignItems: 'center' },

  /* Messages */
  msgList: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 2,
  },
  rowMe: { flexDirection: 'row-reverse' },
  rowOther: { flexDirection: 'row' },
  msgWrap: { maxWidth: '68%', gap: 3 },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555555',
    marginLeft: 2,
    marginBottom: 3,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bubbleMe: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  bubbleOther: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  bubbleText: { fontSize: 14, color: '#1A1A1A', lineHeight: 20 },
  bubbleTextMe: { color: '#FFFFFF' },
  time: { fontSize: 11, color: '#BBBBBB' },
  timeMe: { textAlign: 'right' },
  timeOther: { textAlign: 'left' },

  /* AI TO-DO Chip */
  aiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 11,
    backgroundColor: '#FFF4EE',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD4B8',
    gap: 8,
  },
  aiChipIcon: { fontSize: 16 },
  aiChipText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  aiChipArrow: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
  },

  /* Input bar */
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 6,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 20 },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 100,
    backgroundColor: '#F5F5F5',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1A1A1A',
  },
  rightIcons: { flexDirection: 'row', alignItems: 'center' },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: { fontSize: 14, color: '#FFFFFF', marginLeft: 2 },
});
