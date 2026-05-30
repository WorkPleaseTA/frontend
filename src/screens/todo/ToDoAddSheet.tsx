import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SHEET_HEIGHT = 393;

export default function ToDoAddSheet() {
  const navigation = useNavigation();
  const [text, setText] = useState('');

  const handleAdd = () => {
    if (!text.trim()) return;
    navigation.goBack();
  };

  return (
    <Pressable style={styles.backdrop} onPress={() => navigation.goBack()}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <Pressable style={styles.sheet} onPress={() => {}}>
          {/* 핸들 */}
          <View style={styles.handleRow}>
            <View style={styles.handle} />
          </View>

          {/* 입력 카드 */}
          <View style={styles.inputCard}>
            <Text style={styles.inputIcon}>✎</Text>
            <TextInput
              style={styles.input}
              placeholder="내용을 입력해주세요"
              placeholderTextColor="#BBBBBB"
              value={text}
              onChangeText={setText}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleAdd}
              maxLength={100}
            />
          </View>

          {/* TO-DO 추가 버튼 */}
          <TouchableOpacity
            style={[styles.addBtn, !text.trim() && styles.addBtnDisabled]}
            onPress={handleAdd}
            activeOpacity={0.85}
            disabled={!text.trim()}
          >
            <Text style={styles.addBtnText}>TO-DO 추가</Text>
          </TouchableOpacity>
        </Pressable>
      </KeyboardAvoidingView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
  },
  kav: {
    justifyContent: 'flex-end',
  },
  sheet: {
    height: SHEET_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  handleRow: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 32,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 15,
    backgroundColor: '#E9F1FF',
  },
  inputCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9F1FF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 32,
    gap: 10,
  },
  inputIcon: {
    fontSize: 18,
    color: '#848A94',
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    padding: 0,
  },
  addBtn: {
    width: 250,
    height: 40,
    backgroundColor: '#FF8C00',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: {
    backgroundColor: '#FFCCAA',
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
