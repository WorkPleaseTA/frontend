import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Header from '../../components/Header';

interface Message {
  id: string;
  text: string;
  isMine: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  { id: '1', text: '안녕하세요 오늘 근무 잘 부탁드립니다!', isMine: true },
  { id: '2', text: '넵 알겠습니다', isMine: false },
];

const DATE_LABEL = '2025년 4월 28일 월요일';

function MyBubble({ text }: { text: string }) {
  return (
    <View style={styles.myRow}>
      <View style={styles.myBubble}>
        <Text style={styles.myText}>{text}</Text>
      </View>
    </View>
  );
}

function OtherBubble({ text }: { text: string }) {
  return (
    <View style={styles.otherRow}>
      <View style={styles.otherBubble}>
        <Text style={styles.otherText}>{text}</Text>
      </View>
    </View>
  );
}

export default function PersonalChatScreen() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), text: trimmed, isMine: true }]);
    setInput('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Kaitlyn"
        titleStyle={styles.headerTitle}
        rightElement={<Text style={styles.workingBadge}>근무중</Text>}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.dateLabel}>{DATE_LABEL}</Text>
          }
          renderItem={({ item }) =>
            item.isMine
              ? <MyBubble text={item.text} />
              : <OtherBubble text={item.text} />
          }
        />

        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <Text style={styles.iconText}>📷</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message"
            placeholderTextColor="#999999"
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline
          />

          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <Text style={styles.iconText}>🎤</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={handleSend}>
            <Text style={styles.iconText}>🖼️</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  workingBadge: {
    fontSize: 14,
    color: '#FF8C00',
  },

  messageList: {
    flex: 1,
  },
  messageContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 10,
  },

  dateLabel: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999999',
    letterSpacing: 0.72,
    marginBottom: 16,
  },

  myRow: {
    alignItems: 'flex-end',
  },
  myBubble: {
    backgroundColor: '#FF8D28',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxWidth: '75%',
  },
  myText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },

  otherRow: {
    alignItems: 'flex-start',
  },
  otherBubble: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxWidth: '75%',
  },
  otherText: {
    fontSize: 14,
    color: '#000000',
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFE',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  iconBtn: {
    padding: 4,
  },
  iconText: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(95, 108, 123, 0.6)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 12,
    color: '#000000',
    maxHeight: 100,
  },
});
