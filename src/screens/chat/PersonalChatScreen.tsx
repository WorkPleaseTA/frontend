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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';

const CONTACT = { name: '김매니저', initial: '김' };

const INIT_MSGS = [
  { id: '1', text: '안녕하세요! 오늘 스케줄 확인해줘요.', isMe: false, time: '오후 2:25' },
  { id: '2', text: '네, 바로 확인하겠습니다!', isMe: true, time: '오후 2:26' },
  { id: '3', text: '저녁 6시까지 마감 처리 부탁드려요.', isMe: false, time: '오후 2:27' },
  { id: '4', text: '알겠습니다. 완료 후 다시 연락드릴게요.', isMe: true, time: '오후 2:28' },
  { id: '5', text: '수고하세요 😊', isMe: false, time: '오후 2:30' },
];

type Msg = (typeof INIT_MSGS)[0];

function OtherAvatar() {
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{CONTACT.initial}</Text>
    </View>
  );
}

function Bubble({ item }: { item: Msg }) {
  return (
    <View style={[styles.row, item.isMe ? styles.rowMe : styles.rowOther]}>
      {!item.isMe && <OtherAvatar />}
      <View style={styles.msgWrap}>
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

export default function PersonalChatScreen() {
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
          <Text style={styles.headerName}>{CONTACT.name}</Text>
          <View style={styles.workingBadge}>
            <View style={styles.workingDot} />
            <Text style={styles.workingText}>근무중</Text>
          </View>
        </View>

        <TouchableOpacity hitSlop={8} style={styles.moreBtn}>
          <Text style={styles.moreText}>•••</Text>
        </TouchableOpacity>
      </View>

      {/* ── Messages + Input ── */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={listRef}
          data={msgs}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <Bubble item={item} />}
          contentContainerStyle={styles.msgList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />

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

          {/* Right icons — mic+image when empty, send when typing */}
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
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D0D0D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },

  /* Messages */
  msgList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 2,
  },
  rowMe: { flexDirection: 'row-reverse' },
  rowOther: { flexDirection: 'row' },
  msgWrap: { maxWidth: '72%', gap: 4 },
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
