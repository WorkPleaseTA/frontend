import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  creatorName: string;
  createdAt: string;
}

export default function ToDoListScreen() {
  const navigation = useNavigation<Nav>();
  const { storeInfo } = useAuth();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      setRefreshing(false);
    }
  }, [storeInfo?.storeId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadTodos();
    }, [loadTodos])
  );

  const handleToggle = async (todoId: number) => {
    try {
      await api.patch(`/todos/${todoId}/done`);
      setTodos(prev => prev.map(t => t.todoId === todoId ? { ...t, isDone: !t.isDone } : t));
    } catch {}
  };

  const handleDelete = async (todoId: number) => {
    try {
      await api.delete(`/todos/${todoId}`);
      setTodos(prev => prev.filter(t => t.todoId !== todoId));
    } catch {
      Alert.alert('오류', '삭제 중 오류가 발생했습니다.');
    }
  };

  const doneCount = todos.filter(t => t.isDone).length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>할 일 목록</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ToDoAdd')} hitSlop={8}>
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

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

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>할 일 목록</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={todos}
          keyExtractor={(item, index) =>
            item.todoId != null ? String(item.todoId) : `idx-${index}`
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.checkbox, item.isDone && styles.checkboxDone]}
                onPress={() => handleToggle(item.todoId)}
                activeOpacity={0.7}
              >
                {item.isDone && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              <Text
                style={[styles.itemText, item.isDone && styles.itemTextDone]}
                numberOfLines={2}
              >
                {item.content}
              </Text>
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
          contentContainerStyle={todos.length === 0 ? styles.emptyContainer : styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.empty}>등록된 할 일이 없습니다</Text>}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadTodos(); }}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

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
  addIcon: {
    fontSize: 28,
    color: Colors.primary,
    fontWeight: '400',
    lineHeight: 30,
  },

  sectionHeader: {
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

  list: { paddingVertical: 8 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { fontSize: 14, color: '#AAAAAA' },

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
    flexShrink: 0,
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
  deleteBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  deleteIcon: { fontSize: 18 },

  separator: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginLeft: 58,
  },
});
