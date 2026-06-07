import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface StaffSchedule {
  storeMemberId: number;
  name: string;
  startTime: string;
  endTime: string;
  isSubstitute: boolean;
}

interface SubstituteChange {
  startTime: string;
  endTime: string;
  absenteeName: string;
  substituteName: string;
}

interface Todo {
  todoId: number;
  content: string;
  isDone: boolean;
}

const fmt = (t?: string | null) => t?.substring(0, 5) ?? '--:--';

const DAY_KR = ['일', '월', '화', '수', '목', '금', '토'];
const AVATAR_COLORS = ['#5B9BD5', '#7B68EE', '#52B788', '#E07070', '#F4A261', '#4ECDC4'];
const avatarColor = (name: string) => AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

function toDateParam(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toDateDisplay(d: Date) {
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')}`;
}

function isNowBetween(start: string, end: string) {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return nowMin >= sh * 60 + sm && nowMin < eh * 60 + em;
}

function isToday(d: Date) {
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
}

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { storeInfo, logout } = useAuth();
  const [date, setDate] = useState(() => new Date());
  const [schedules, setSchedules] = useState<StaffSchedule[]>([]);
  const [substitutes, setSubstitutes] = useState<SubstituteChange[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (d: Date) => {
    if (!storeInfo) {
      setLoading(false);
      return;
    }
    const dateStr = toDateParam(d);
    try {
      const [schedRes, subRes, todoRes] = await Promise.allSettled([
        api.get(`/stores/${storeInfo.storeId}/schedules?date=${dateStr}`),
        api.get(`/substitute/requests/daily?storeId=${storeInfo.storeId}&date=${dateStr}`),
        api.get(`/todos?storeId=${storeInfo.storeId}`),
      ]);
      if (schedRes.status === 'fulfilled') setSchedules(schedRes.value.data.data ?? []);
      if (subRes.status === 'fulfilled') setSubstitutes(subRes.value.data.data ?? []);
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

  useEffect(() => {
    setLoading(true);
    loadData(date);
  }, [date, loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData(date);
    }, [loadData, date])
  );

  const changeDate = (delta: number) => {
    setDate(prev => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta);
      return next;
    });
  };

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

  const today = isToday(date);

  return (
    <SafeAreaView style={s.safe}>
      {/* 상단 헤더 */}
      <View style={s.topHeader}>
        <TouchableOpacity
          style={s.infoBtn}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('StoreManagement')}
        >
          <Text style={s.infoBtnText}>i</Text>
        </TouchableOpacity>
        <Text style={s.topTitle}>홈</Text>
        <TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
          <Text style={s.logoutBtn}>로그아웃</Text>
        </TouchableOpacity>
      </View>

      {/* 날짜 네비게이터 */}
      <View style={s.dateRow}>
        <TouchableOpacity onPress={() => changeDate(-1)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={s.arrow}>←</Text>
        </TouchableOpacity>
        <View style={s.dateCenter}>
          <Text style={s.dateText}>{toDateDisplay(date)}</Text>
          <Text style={s.dateDayLabel}>
            {DAY_KR[date.getDay()]}요일{today ? '  ·  오늘' : ''}
          </Text>
        </View>
        <TouchableOpacity onPress={() => changeDate(1)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={s.arrow}>→</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator color="#FF8D28" size="large" /></View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadData(date); }}
              colors={['#FF8D28']}
              tintColor="#FF8D28"
            />
          }
        >
          {/* 오늘의 스케줄 */}
          <View style={s.section}>
            <TouchableOpacity
              style={s.sectionHeader}
              onPress={() => navigation.getParent()?.navigate('Calendar' as never)}
              activeOpacity={0.7}
            >
              <Text style={s.sectionTitle}>오늘의 스케줄</Text>
              <Text style={s.sectionArrow}>›</Text>
            </TouchableOpacity>

            {schedules.length === 0 ? (
              <View style={s.emptyCard}>
                <MaterialIcons name="event-note" size={20} color="#CCCCCC" />
                <Text style={s.emptyText}>등록된 스케줄이 없습니다</Text>
              </View>
            ) : (
              <View style={s.cardList}>
                {schedules.map((item) => {
                  const active = today && isNowBetween(item.startTime, item.endTime);
                  const aColor = avatarColor(item.name ?? '');
                  return (
                    <View key={item.storeMemberId} style={[s.scheduleCard, active && s.scheduleCardActive]}>
                      <View style={[s.scheduleAvatar, {
                        backgroundColor: active ? 'rgba(255,255,255,0.25)' : aColor + '22',
                      }]}>
                        <Text style={[s.scheduleAvatarText, { color: active ? '#FFFFFF' : aColor }]}>
                          {(item.name ?? '?').charAt(0)}
                        </Text>
                      </View>
                      <View style={s.scheduleInfo}>
                        <Text style={[s.scheduleName, active && s.scheduleTextActive]}>
                          {item.name ?? '-'}
                        </Text>
                        {active && <Text style={s.activeTag}>근무 중</Text>}
                      </View>
                      <Text style={[s.scheduleTime, active && s.scheduleTextActive]}>
                        {fmt(item.startTime)} - {fmt(item.endTime)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* 오늘의 스케줄 변동 */}
          <View style={s.section}>
            <TouchableOpacity
              style={s.sectionHeader}
              activeOpacity={0.7}
              onPress={() => navigation.getParent()?.navigate('Notification' as never)}
            >
              <Text style={s.sectionTitle}>오늘의 스케줄 변동</Text>
              <Text style={s.sectionArrow}>›</Text>
            </TouchableOpacity>

            {substitutes.length === 0 ? (
              <View style={s.emptyCard}>
                <MaterialIcons name="swap-horiz" size={20} color="#CCCCCC" />
                <Text style={s.emptyText}>스케줄 변동이 없습니다</Text>
              </View>
            ) : (
              <View style={s.cardList}>
                {substitutes.map((item, idx) => (
                  <View key={idx} style={s.substituteCard}>
                    <Text style={s.subTime}>{fmt(item.startTime)} ~ {fmt(item.endTime)}</Text>
                    <View style={s.subPerson}>
                      <Text style={s.subLabel}>결근자</Text>
                      <Text style={s.subName}>{item.absenteeName}</Text>
                    </View>
                    <View style={s.subDivider} />
                    <View style={s.subPerson}>
                      <Text style={s.subLabel}>대체자</Text>
                      <Text style={s.subName}>{item.substituteName}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* 오늘의 할 일 */}
          <View style={s.section}>
            <TouchableOpacity style={s.sectionHeader} activeOpacity={0.7} onPress={() => (navigation as any).navigate('Todo')}>
              <Text style={s.sectionTitle}>오늘의 할 일</Text>
              <Text style={s.sectionArrow}>›</Text>
            </TouchableOpacity>

            {todos.length === 0 ? (
              <View style={s.emptyCard}>
                <MaterialIcons name="check-circle-outline" size={20} color="#CCCCCC" />
                <Text style={s.emptyText}>등록된 할 일이 없습니다</Text>
              </View>
            ) : (
              <View style={s.cardList}>
                {todos.slice(0, 4).map(item => (
                  <TouchableOpacity
                    key={item.todoId}
                    style={s.todoCard}
                    onPress={() => handleToggle(item.todoId)}
                    activeOpacity={0.7}
                  >
                    <Text style={s.todoText}>{item.content}</Text>
                    <View style={[s.checkbox, item.isDone && s.checkboxDone]}>
                      {item.isDone && <MaterialIcons name="check" size={14} color="#FFFFFF" />}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  topHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4,
  },
  infoBtn: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 2, borderColor: '#1A1A1A',
    alignItems: 'center', justifyContent: 'center',
  },
  infoBtnText: { fontSize: 13, fontWeight: '800', color: '#1A1A1A' },
  logoutBtn: { fontSize: 12, fontWeight: '600', color: '#FF8D28' },
  topTitle: {
    flex: 1, textAlign: 'center',
    fontSize: 20, fontWeight: '500', color: '#000000',
  },

  dateRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, paddingHorizontal: 20, gap: 20,
  },
  dateCenter: { alignItems: 'center', gap: 3 },
  arrow: { fontSize: 18, color: '#61656C' },
  dateText: { fontSize: 22, fontWeight: '700', color: '#1A1A1A' },
  dateDayLabel: { fontSize: 12, color: '#AAAAAA', fontWeight: '500' },

  scroll: { paddingHorizontal: 20, paddingBottom: 32, gap: 20 },

  section: { gap: 10 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#000000' },
  sectionArrow: { fontSize: 18, color: '#AAAAAA' },
  cardList: { gap: 8 },

  scheduleCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12, gap: 12,
    borderRadius: 16, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  scheduleCardActive: { backgroundColor: '#FF8D28', borderColor: '#FF8D28' },
  scheduleAvatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  scheduleAvatarText: { fontSize: 16, fontWeight: '700' },
  scheduleInfo: { flex: 1, gap: 2 },
  scheduleName: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  scheduleTextActive: { color: '#FFFFFF' },
  activeTag: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  scheduleTime: { fontSize: 13, fontWeight: '500', color: '#6B7280' },

  substituteCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: '#E9F1FF',
    borderRadius: 16, backgroundColor: '#FFFFFF', gap: 12,
  },
  subTime: { fontSize: 12, color: '#757575', flex: 1 },
  subPerson: { alignItems: 'center', gap: 2 },
  subLabel: { fontSize: 10, color: '#FF8D28' },
  subName: { fontSize: 14, fontWeight: '500', color: '#1A1A1A' },
  subDivider: { width: 1, height: 32, backgroundColor: '#E9F1FF' },

  todoCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1, borderColor: '#E9F1FF',
    borderRadius: 16, backgroundColor: '#FFFFFF',
  },
  todoText: { flex: 1, fontSize: 14, color: '#61656C', marginRight: 12 },
  checkbox: {
    width: 22, height: 22, borderRadius: 4,
    borderWidth: 2, borderColor: '#E6E6E6', backgroundColor: '#E6E6E6',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: '#FF8D28', borderColor: '#FF8D28' },

  emptyCard: {
    paddingVertical: 18, paddingHorizontal: 16,
    borderWidth: 1, borderColor: '#E9F1FF',
    borderRadius: 16, backgroundColor: '#FFFFFF',
    alignItems: 'center', gap: 6, flexDirection: 'row',
    justifyContent: 'center',
  },
  emptyText: { fontSize: 13, color: '#AAAAAA' },
});
