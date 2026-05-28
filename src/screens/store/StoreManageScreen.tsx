import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Header from '../../components/Header';
import { BottomTabBarStatic } from '../../components/BottomTabBar';

interface Employee {
  id: string;
  name: string;
  days: string;
}

const EMPLOYEE_DATA: Employee[] = [
  { id: '1', name: '이주하', days: '월, 화' },
  { id: '2', name: '김주영', days: '화, 일' },
  { id: '3', name: '이하은', days: '수, 토' },
  { id: '4', name: '정규람', days: '금, 토' },
  { id: '5', name: '노민혁', days: '화, 일' },
  { id: '6', name: '최민호', days: '' },
];

const INVITE_CODE = '3FDFJ39DS';

export default function StoreManageScreen() {
  const renderEmployee = ({ item }: { item: Employee }) => (
    <View style={styles.empCard}>
      <TouchableOpacity style={styles.empRemoveBtn} hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
        <Text style={styles.empRemoveIcon}>×</Text>
      </TouchableOpacity>
      <Text style={styles.empName}>{item.name}</Text>
      {item.days ? <Text style={styles.empDays}>{item.days}</Text> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="매장 관리" titleStyle={styles.headerTitle} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 매장명 */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>매장명</Text>
          <Text style={styles.infoValue}>일해조</Text>
        </View>

        {/* 매장 업종 */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>매장 업종</Text>
          <Text style={styles.infoValue}>소매</Text>
        </View>

        {/* 매장명 (두 번째) */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>매장명</Text>
          <Text style={styles.infoValue}>일해조</Text>
        </View>

        {/* 직원 정보 */}
        <Text style={styles.sectionLabel}>직원 정보</Text>
        <FlatList
          data={EMPLOYEE_DATA}
          keyExtractor={item => item.id}
          renderItem={renderEmployee}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.empList}
          ItemSeparatorComponent={() => <View style={styles.empSeparator} />}
          scrollEnabled={true}
        />

        {/* 직원 초대 코드 */}
        <Text style={styles.inviteLabel}>직원 초대 코드</Text>
        <View style={styles.inviteBox}>
          <Text style={styles.inviteCode}>{INVITE_CODE}</Text>
        </View>
      </ScrollView>

      <BottomTabBarStatic activeIndex={0} />
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },

  // 정보 카드
  infoCard: {
    borderWidth: 1,
    borderColor: '#E9F1FF',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#848A94',
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
  },

  // 직원 정보 섹션
  sectionLabel: {
    fontSize: 14,
    color: '#848A94',
    marginTop: 8,
    marginBottom: 12,
  },
  empList: {
    paddingBottom: 4,
  },
  empSeparator: {
    width: 10,
  },
  empCard: {
    width: 64,
    height: 118,
    borderWidth: 1,
    borderColor: '#E9F1FF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    position: 'relative',
  },
  empRemoveBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empRemoveIcon: {
    fontSize: 12,
    lineHeight: 14,
    color: 'rgba(0,0,0,0.4)',
  },
  empName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#AAAAAA',
    textAlign: 'center',
  },
  empDays: {
    fontSize: 12,
    color: '#AAAAAA',
    textAlign: 'center',
  },

  // 직원 초대 코드
  inviteLabel: {
    fontSize: 14,
    color: '#848A94',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  inviteBox: {
    borderWidth: 1,
    borderColor: '#FF8D28',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  inviteCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: 2,
  },
});
