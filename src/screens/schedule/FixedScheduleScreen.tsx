import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Header from '../../components/Header';
import { BottomTabBarStatic } from '../../components/BottomTabBar';

interface ScheduleItem {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

const DAY_TABS = ['일', '월', '화', '수', '목', '금', '토'];

const SCHEDULE_DATA: ScheduleItem[] = [
  { id: '1', name: '이주하', startTime: '08:00', endTime: '09:00' },
  { id: '2', name: '김주영', startTime: '10:30', endTime: '17:30' },
  { id: '3', name: '이하은', startTime: '13:00', endTime: '20:00' },
  { id: '4', name: '정규람', startTime: '13:00', endTime: '18:00' },
  { id: '5', name: '노민혁', startTime: '18:00', endTime: '23:00' },
];

export default function FixedScheduleScreen() {
  const [activeDay, setActiveDay] = useState('수');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

  const openModal = (item: ScheduleItem) => {
    setEditingItem(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingItem(null);
  };

  const renderScheduleItem = ({ item }: { item: ScheduleItem }) => (
    <View style={styles.card}>
      <Text style={styles.cardName}>{item.name}</Text>
      <Text style={styles.cardTime}>{item.startTime} - {item.endTime}</Text>
      <TouchableOpacity
        onPress={() => openModal(item)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <MaterialIcons name="edit" size={18} color="#B3B3B3" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="매장 관리"
        titleStyle={styles.headerTitle}
        rightElement={<MaterialIcons name="edit" size={20} color="#FF8D28" />}
      />

      {/* 요일 탭 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabList}
        style={styles.tabScroll}
      >
        {DAY_TABS.map(day => {
          const isActive = day === activeDay;
          return (
            <TouchableOpacity
              key={day}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveDay(day)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 직원 스케줄 리스트 */}
      <FlatList
        data={SCHEDULE_DATA}
        keyExtractor={item => item.id}
        renderItem={renderScheduleItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />

      <BottomTabBarStatic activeIndex={1} />

      {/* 고정 스케줄 수정 모달 */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            {/* 타이틀 */}
            <View style={styles.modalHeader}>
              <MaterialIcons name="edit" size={18} color="#000000" style={styles.modalEditIcon} />
              <Text style={styles.modalTitle}>고정 스케줄 수정</Text>
            </View>

            {/* 직원명 */}
            <Text style={styles.fieldLabel}>직원명</Text>
            <Text style={styles.fieldValue}>{editingItem?.name ?? ''}</Text>

            {/* 시간대 입력 */}
            <Text style={[styles.fieldLabel, styles.timeLabel]}>시간대 입력</Text>
            <View style={styles.timeRow}>
              <View style={styles.timeDropdown}>
                <Text style={styles.timeText}>{editingItem?.startTime ?? '00:00'}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={18} color="#9C9C9C" />
              </View>
              <Text style={styles.timeSeparator}>~</Text>
              <View style={styles.timeDropdown}>
                <Text style={styles.timeText}>{editingItem?.endTime ?? '00:00'}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={18} color="#9C9C9C" />
              </View>
            </View>

            {/* 하단 버튼 */}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.btnPrev} onPress={closeModal} activeOpacity={0.7}>
                <Text style={styles.btnPrevText}>이전</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnConfirm} onPress={closeModal} activeOpacity={0.8}>
                <Text style={styles.btnConfirmText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
  },

  // 요일 탭
  tabScroll: {
    flexGrow: 0,
  },
  tabList: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8,
  },
  tab: {
    width: 44,
    height: 27,
    borderRadius: 5,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#FF8D28',
  },
  tabText: {
    fontSize: 11,
    color: '#757575',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // 스케줄 리스트
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  separator: {
    height: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9F1FF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#848A94',
    width: 56,
  },
  cardTime: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#848A94',
    textAlign: 'center',
  },

  // 모달 오버레이
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },

  // 모달 카드
  modalCard: {
    width: 328,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalEditIcon: {
    marginRight: 8,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#000000',
  },

  // 직원명 필드
  fieldLabel: {
    fontSize: 14,
    color: '#848A94',
    marginBottom: 6,
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 18,
  },

  // 시간대 입력
  timeLabel: {
    marginBottom: 10,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  timeDropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E9F1FF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  timeText: {
    fontSize: 14,
    color: '#000000',
  },
  timeSeparator: {
    fontSize: 30,
    color: '#000000',
    textAlign: 'center',
  },

  // 하단 버튼
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  btnPrev: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
  },
  btnPrevText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(21,25,32,0.5)',
  },
  btnConfirm: {
    flex: 2,
    height: 42,
    backgroundColor: '#FF8C00',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
