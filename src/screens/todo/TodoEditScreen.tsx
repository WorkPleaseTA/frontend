import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../constants/colors';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type ToDoItem = {
  id: string;
  text: string;
};

const INITIAL_TODOS: ToDoItem[] = [
  { id: '1', text: '오전 재고 확인하기' },
  { id: '2', text: '청소 구역 점검' },
  { id: '3', text: '음료 레시피 숙지' },
  { id: '4', text: '팀장님께 보고서 제출' },
  { id: '5', text: '마감 정산 처리' },
];

export default function ToDoEditScreen() {
  const navigation = useNavigation<Nav>();
  const [todos, setTodos] = useState<ToDoItem[]>(INITIAL_TODOS);

  const remove = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>할 일 목록 편집</Text>
        <View style={styles.placeholder} />
      </View>

      {/* List */}
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.dragHandle}>
              <Text style={styles.dragIcon}>☰</Text>
            </View>
            <Text style={styles.itemText} numberOfLines={1}>{item.text}</Text>
            <TouchableOpacity
              onPress={() => remove(item.id)}
              hitSlop={8}
              style={styles.deleteBtn}
            >
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Add button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('ToDoAdd')}
          activeOpacity={0.85}
        >
          <Text style={styles.addBtnText}>+ 직접 추가하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: 36 },
  backArrow: { fontSize: 22, color: '#1A1A1A' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  placeholder: { width: 36 },

  list: {
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  dragHandle: {
    width: 28,
    alignItems: 'center',
  },
  dragIcon: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 22,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: { fontSize: 20 },
  separator: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginLeft: 60,
  },

  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  addBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  addBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
