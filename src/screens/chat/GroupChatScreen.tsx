import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Header from '../../components/Header';

const DATE_LABEL = '2025년 4월 28일 월요일';
const ROOM_NAME = '일해조 매장';

const TODO_ITEMS = ['오후 3시 쿠팡 택배 및 냉장고 정리', '매장 바닥 청소'];

export default function GroupChatScreen() {
  const [input, setInput] = useState('');
  const [todos, setTodos] = useState<string[]>(TODO_ITEMS);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput('');
  };

  const handleAddTodo = () => {
    setTodos(prev => [...prev, '']);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={ROOM_NAME} titleStyle={styles.headerTitle} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.messageList}
          contentContainerStyle={styles.messageContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 날짜 */}
          <Text style={styles.dateLabel}>{DATE_LABEL}</Text>

          {/* 내 메시지 1 */}
          <View style={styles.myRow}>
            <View style={styles.myBubble}>
              <Text style={styles.myText}>
                오늘 오후 3시에 쿠팡 택배가 배송된다고 하네요. 담당 근무자는 택배를 받아 냉장고에 넣어놔 주세요.
              </Text>
            </View>
          </View>

          {/* 내 메시지 2 */}
          <View style={[styles.myRow, styles.myRowSmall]}>
            <View style={styles.myBubble}>
              <Text style={styles.myText}>부탁드립니다!</Text>
            </View>
          </View>

          {/* AI TO-DO 섹션 */}
          <View style={styles.todoSection}>
            <Text style={styles.todoTitle}>AI TO-DO 리스트 자동 변환</Text>

            {/* 버블들 가로 스크롤 */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.todoScrollContent}
            >
              {todos.map((item, index) => (
                <View key={index} style={styles.todoBubble}>
                  <Text style={styles.todoBubbleText}>{item}</Text>
                </View>
              ))}
              <TouchableOpacity style={styles.todoAddBtn} onPress={handleAddTodo} activeOpacity={0.7}>
                <Text style={styles.todoAddText}>+ 직접 추가</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </ScrollView>

        {/* 하단 입력바 */}
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

  messageList: {
    flex: 1,
  },
  messageContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },

  dateLabel: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999999',
    marginBottom: 20,
  },

  // 내 메시지
  myRow: {
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  myRowSmall: {
    marginBottom: 20,
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

  // AI TO-DO 섹션
  todoSection: {
    gap: 12,
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.32,
  },
  todoScrollContent: {
    gap: 8,
    paddingBottom: 4,
  },
  todoBubble: {
    backgroundColor: '#E9E9EB',
    borderRadius: 4,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxWidth: 220,
  },
  todoBubbleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  todoAddBtn: {
    borderWidth: 1,
    borderColor: '#E9E9EB',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  todoAddText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },

  // 하단 입력바
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
