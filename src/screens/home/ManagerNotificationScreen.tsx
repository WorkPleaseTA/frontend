import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';

type Status = '완료' | '진행중';

interface AbsenceItem {
  id: string;
  date: string;
  from: string;
  to: string;
  time: string;
  reason: string;
  status: Status;
}

const ABSENCE_DATA: AbsenceItem[] = [
  { id: '1', date: '2026.05.10', from: '노민혁', to: '최민호', time: '08:00 ~ 12:30', reason: '집안 행사', status: '완료' },
  { id: '2', date: '2026.06.11', from: '정미희', to: '이주하', time: '12:00 ~ 15:00', reason: '학교 시험', status: '완료' },
  { id: '3', date: '2026.05.12', from: '이주하', to: '최민호', time: '11:00 ~ 20:30', reason: '여행',     status: '진행중' },
  { id: '4', date: '2026.06.22', from: '김주영', to: '정규람', time: '15:00 ~ 17:30', reason: '학교 일정', status: '진행중' },
];

const STATUS_COLOR: Record<Status, string> = {
  '완료':  '#34C759',
  '진행중': '#FFE261',
};

export default function ManagerNotificationScreen() {
  return (
    <SafeAreaView style={s.safe}>
      {/* 헤더 */}
      <View style={s.header}>
        <Text style={s.headerTitle}>스케줄 변동 현황</Text>
      </View>

      <ScrollView
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
      >
        {ABSENCE_DATA.map((item) => (
          <View key={item.id} style={s.card}>
            {/* 왼쪽: 날짜 · 이름 · 시간 · 사유 */}
            <View style={s.cardLeft}>
              <View style={s.topRow}>
                <Text style={s.date}>{item.date}</Text>
                <Text style={s.time}>{item.time}</Text>
              </View>
              <Text style={s.names}>{item.from} → {item.to}</Text>
              <Text style={s.reason}>사유 : {item.reason}</Text>
            </View>

            {/* 오른쪽: 상태 인디케이터 */}
            <View style={s.cardRight}>
              <View style={[s.circle, { borderColor: STATUS_COLOR[item.status] }]} />
              <Text style={s.statusText}>{item.status}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000000',
  },

  list: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E9F1FF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },

  cardLeft: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  date: {
    fontSize: 14,
    color: '#848A94',
  },
  time: {
    fontSize: 10,
    color: '#848A94',
  },
  names: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  reason: {
    fontSize: 10,
    color: '#848A94',
  },

  cardRight: {
    alignItems: 'center',
    gap: 4,
    marginLeft: 12,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#094067',
    textAlign: 'center',
  },
});
