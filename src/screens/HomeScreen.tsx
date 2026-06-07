import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface TodaySchedule {
  storeMemberId: number;
  startTime: string | null;
  endTime: string | null;
  isSubstitute: boolean;
}

interface Todo {
  todoId: number;
  content: string;
  isDone: boolean;
}

const fmt = (t?: string | null) => t?.substring(0, 5) ?? '--:--';

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 6  && h < 12) return '좋은 아침이에요';
  if (h >= 12 && h < 18) return '좋은 오후예요';
  if (h >= 18 && h < 22) return '좋은 저녁이에요';
  return '편안한 밤이에요';
}

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { storeInfo, logout } = useAuth();
  const [schedule, setSchedule] = useState<TodaySchedule | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!storeInfo) {
      setLoading(false);
      return;
    }
    try {
      const today = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const dateStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

      const [schedRes, todoRes] = await Promise.allSettled([
        api.get(`/stores/${storeInfo.storeId}/schedules?date=${dateStr}`),
        api.get(`/todos?storeId=${storeInfo.storeId}`),
      ]);
      if (schedRes.status === 'fulfilled') {
        const all: any[] = schedRes.value.data.data ?? [];
        const mine = all.find((s) => s.storeMemberId === storeInfo.storeMemberId) ?? null;
        setSchedule(mine);
      }
      if (todoRes.status === 'fulfilled') {
        const raw = todoRes.value.data.data ?? [];
        setTodos(raw.map((item: any) => ({
          ...item,
          todoId: item.todoId ?? item.id,
          isDone: item.isDone ?? item.done ?? false,
        })));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [storeInfo?.storeId]);

  useEffect(() => { loadData(); }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleToggle = async (todoId: number) => {
    try {
      await api.patch(`/todos/${todoId}/done`);
      setTodos(prev => prev.map(t => t.todoId === todoId ? { ...t, isDone: !t.isDone } : t));
    } catch {}
  };

  const handleLogout = async () => {
    await logout();
    navigation.navigate('Start');
  };

  const displayName = storeInfo?.name;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View style={{ width: 32 }} />
        <Text style={s.headerTitle}>홈</Text>
        <TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
          <Text style={s.logoutBtn}>로그아웃</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator color={Colors.primary} size="large" /></View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadData(); }}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        >
          {/* 인사말 */}
          <View style={s.greetingRow}>
            <View>
              <Text style={s.greetingName}>{displayName ? `${displayName}님,` : '안녕하세요,'}</Text>
              <Text style={s.greetingMsg}>{getGreeting()}</Text>
            </View>
            <View style={s.dotsCol}>
              <View style={s.dotLg} />
              <View style={s.dotSm} />
            </View>
          </View>

          {/* 내 스케줄 관리 */}
          <View style={s.section}>
            <TouchableOpacity
              style={s.sectionHeader}
              onPress={() => (navigation as any).navigate('Calendar')}
              activeOpacity={0.7}
            >
              <Text style={s.sectionTitle}>내 스케줄 관리</Text>
              <Text style={s.sectionArrow}>›</Text>
            </TouchableOpacity>

            {schedule?.startTime ? (
              <View style={s.scheduleCard}>
                <View style={s.logoCircle}>
                  <Text style={s.logoText}>☕</Text>
                </View>
                <View style={s.scheduleTextCol}>
                  <Text style={s.scheduleTime}>
                    {fmt(schedule.startTime)} ~ {fmt(schedule.endTime)}
                  </Text>
                  <Text style={s.scheduleCafe}>{storeInfo?.name ?? ''}</Text>
                </View>
              </View>
            ) : (
              <View style={s.emptyCard}>
                <Text style={s.emptyText}>오늘 스케줄이 없습니다</Text>
              </View>
            )}
          </View>

          {/* 오늘의 업무 */}
          <View style={s.section}>
            <TouchableOpacity
              style={s.sectionHeader}
              onPress={() => (navigation as any).navigate('Todo')}
              activeOpacity={0.7}
            >
              <Text style={s.sectionTitle}>오늘의 업무</Text>
              <Text style={s.sectionArrow}>›</Text>
            </TouchableOpacity>

            {todos.length === 0 ? (
              <View style={s.emptyCard}>
                <Text style={s.emptyText}>등록된 할 일이 없습니다</Text>
              </View>
            ) : (
              <View style={s.todoCard}>
                {todos.slice(0, 4).map((item, idx) => (
                  <React.Fragment key={item.todoId}>
                    {idx > 0 && <View style={s.divider} />}
                    <TouchableOpacity
                      style={s.todoRow}
                      onPress={() => handleToggle(item.todoId)}
                      activeOpacity={0.7}
                    >
                      <View style={[s.checkbox, item.isDone && s.checkboxDone]}>
                        {item.isDone && <Text style={s.checkmark}>✓</Text>}
                      </View>
                      <Text style={s.todoText}>{item.content}</Text>
                    </TouchableOpacity>
                  </React.Fragment>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const BLUE = '#4A90D9';

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#FAFAFA',
  },
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontSize: 20, fontWeight: '500', color: '#000000',
  },

  scroll: { padding: 20, gap: 28, paddingBottom: 40 },

  greetingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  greetingName: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', lineHeight: 36 },
  greetingMsg:  { fontSize: 28, fontWeight: '800', color: '#1A1A1A', lineHeight: 36 },
  dotsCol: { gap: 6, marginTop: 6, alignItems: 'flex-end' },
  dotLg:   { width: 14, height: 14, borderRadius: 7, backgroundColor: BLUE },
  dotSm:   { width: 9, height: 9, borderRadius: 4.5, backgroundColor: BLUE, opacity: 0.45 },

  section:       { gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle:  { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  sectionArrow:  { fontSize: 22, color: '#BBBBBB', lineHeight: 24 },

  scheduleCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16, padding: 18,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  logoCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  logoText:       { fontSize: 24 },
  scheduleTextCol: { flex: 1 },
  scheduleTime:   { fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
  scheduleCafe:   { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontWeight: '500' },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14, padding: 20,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  emptyText: { fontSize: 14, color: '#AAAAAA' },

  todoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  divider:  { height: 1, backgroundColor: '#F2F2F2', marginHorizontal: 16 },
  todoRow:  {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, paddingHorizontal: 16, paddingVertical: 14,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: '#DDDDDD',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  checkboxDone: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkmark:    { fontSize: 12, color: '#FFFFFF', fontWeight: '800' },
  todoText:     { flex: 1, fontSize: 14, color: '#1A1A1A', lineHeight: 20 },
  logoutBtn:    { fontSize: 12, fontWeight: '600', color: '#FF8D28' },
});
