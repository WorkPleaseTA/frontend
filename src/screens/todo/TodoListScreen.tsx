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
import { MaterialIcons } from '@expo/vector-icons';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type ToDoItem = {
  id: string;
  text: string;
  done: boolean;
};

const INITIAL_TODOS: ToDoItem[] = [
  { id: '1', text: '오전 재고 확인하기', done: true },
  { id: '2', text: '청소 구역 점검', done: true },
  { id: '3', text: '음료 레시피 숙지', done: false },
  { id: '4', text: '팀장님께 보고서 제출', done: false },
  { id: '5', text: '마감 정산 처리', done: false },
];

export default function ToDoListScreen() {
  const navigation = useNavigation<Nav>();
  const [todos, setTodos] = useState<ToDoItem[]>(INITIAL_TODOS);

  const toggle = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const doneCount = todos.filter((t) => t.done).length;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TO-DO LIST</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Progress summary */}
      <View style={styles.progressBar}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${todos.length ? (doneCount / todos.length) * 100 : 0}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{doneCount}/{todos.length} 완료</Text>
      </View>

      {/* 섹션 타이틀 */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>할 일 목록</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ToDoEdit')} hitSlop={8}>
          <MaterialIcons name="edit" size={20} color="#F5A623" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => toggle(item.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, item.done && styles.checkboxDone]}>
              {item.done && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.itemText, item.done && styles.itemTextDone]}>
              {item.text}
            </Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  editIcon: { fontSize: 20 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },

  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#EEEEEE',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    minWidth: 48,
    textAlign: 'right',
  },

  list: {
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    gap: 14,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#DDDDDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 22,
  },
  itemTextDone: {
    color: '#AAAAAA',
    textDecorationLine: 'line-through',
  },
  separator: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginLeft: 58,
  },
});
