import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ScheduleItem {
  id: string;
  name: string;
  time: string;
  highlight: boolean;
}

const SCHEDULE_DATA: ScheduleItem[] = [
  { id: '1', name: '이주하', time: '08:00-09:00', highlight: false },
  { id: '2', name: '김주영', time: '08:30-17:30', highlight: false },
  { id: '3', name: '이하은', time: '13:00-20:00', highlight: true },
  { id: '4', name: '정규람', time: '13:00-18:00', highlight: true },
  { id: '5', name: '노민혁', time: '18:00-23:00', highlight: false },
];

export default function HomeScreen() {
  const [date, setDate] = useState(new Date(2026, 4, 9));
  const [checked, setChecked] = useState(false);

  const formatDate = () => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}. ${m}. ${d}`;
  };

  const changeDate = (delta: number) => {
    setDate(prev => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta);
      return next;
    });
  };

  const renderScheduleItem = ({ item }: { item: ScheduleItem }) => (
    <View style={[styles.scheduleCard, item.highlight && styles.scheduleCardActive]}>
      <Text style={[styles.scheduleCardText, item.highlight && styles.scheduleCardTextWhite]}>
        {item.name}
      </Text>
      <Text style={[styles.scheduleCardText, item.highlight && styles.scheduleCardTextWhite]}>
        {item.time}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 날짜 헤더 */}
        <View style={styles.dateRow}>
          <TouchableOpacity
            onPress={() => changeDate(-1)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.arrowText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.dateText}>{formatDate()}</Text>
          <TouchableOpacity
            onPress={() => changeDate(1)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.arrowText}>{'>'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="edit" size={20} color="#FF8D28" />
          </TouchableOpacity>
        </View>

        {/* 오늘의 스케줄 */}
        <Text style={styles.sectionLabel}>오늘의 스케줄</Text>
        <FlatList
          data={SCHEDULE_DATA}
          keyExtractor={item => item.id}
          renderItem={renderScheduleItem}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />

        {/* 대타 정보 카드 */}
        <View style={styles.substituteCard}>
          <Text style={styles.subTime}>08:00 ~ 09:00</Text>
          <View style={styles.subLabels}>
            <Text style={styles.subLabel}>결근자 정미희</Text>
            <Text style={styles.subLabel}>대체자 이주하</Text>
          </View>
        </View>

        {/* 오늘의 할 일 */}
        <Text style={styles.sectionLabel}>오늘의 할 일</Text>
        <View style={styles.todoCard}>
          <Text style={styles.todoText}>오전 9시 물류 정리</Text>
          <TouchableOpacity style={styles.checkbox} onPress={() => setChecked(p => !p)}>
            {checked && <MaterialIcons name="check" size={16} color="#FFFFFF" />}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  // 날짜 헤더
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  arrowText: {
    fontSize: 18,
    color: '#61656C',
    paddingHorizontal: 16,
  },
  dateText: {
    fontSize: 25,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  editButton: {
    position: 'absolute',
    right: 0,
  },

  // 섹션 라벨
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#AAAAAA',
    marginTop: 24,
    marginBottom: 12,
  },

  // 스케줄 카드
  scheduleCard: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E9F1FF',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  scheduleCardActive: {
    backgroundColor: '#FF8D28',
    borderColor: '#FF8D28',
  },
  scheduleCardText: {
    fontSize: 13,
    color: '#61656C',
  },
  scheduleCardTextWhite: {
    color: '#FFFFFF',
  },
  separator: {
    height: 8,
  },

  // 대타 정보 카드
  substituteCard: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E9F1FF',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subTime: {
    fontSize: 12,
    color: '#757575',
  },
  subLabels: {
    alignItems: 'flex-end',
    gap: 2,
  },
  subLabel: {
    fontSize: 10,
    color: '#FF8D28',
  },

  // TO-DO 카드
  todoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E9F1FF',
    borderRadius: 16,
  },
  todoText: {
    fontSize: 14,
    color: '#61656C',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: '#FF8D28',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
