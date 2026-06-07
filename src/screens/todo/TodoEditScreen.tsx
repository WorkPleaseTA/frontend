import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface TodoItem {
  todoId: number;
  content: string;
  isDone: boolean;
}

export default function ToDoEditScreen() {
  const navigation = useNavigation<Nav>();
  const { storeInfo } = useAuth();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTodos = useCallback(async () => {
    if (!storeInfo) return;
    try {
      const res = await api.get(`/todos?storeId=${storeInfo.storeId}`);
      const raw = res.data.data ?? [];
      setTodos(raw.map((item: any) => ({
        ...item,
        todoId: item.todoId ?? item.id,
        isDone: item.isDone ?? item.done ?? false,
      })));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [storeInfo?.storeId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadTodos();
    }, [loadTodos])
  );

  const handleDelete = async (todoId: number) => {
    try {
      await api.delete(`/todos/${todoId}`);
      setTodos(prev => prev.filter(t => t.todoId !== todoId));
    } catch {
      Alert.alert('오류', '삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TO-DO LIST</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={todos}
          keyExtractor={item => String(item.todoId)}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.dragHandle}>
                <Text style={styles.dragIcon}>☰</Text>
              </View>
              <Text style={styles.itemText} numberOfLines={1}>{item.content}</Text>
              <TouchableOpacity
                onPress={() => handleDelete(item.todoId)}
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
          ListEmptyComponent={<Text style={styles.empty}>등록된 할 일이 없습니다</Text>}
        />
      )}

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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

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

  list: { paddingVertical: 8 },
  empty: { fontSize: 14, color: '#AAAAAA', textAlign: 'center', padding: 40 },
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
