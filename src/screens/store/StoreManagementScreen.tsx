import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { setStringAsync } from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/colors';
import api from '../../api/client';

// ── 역방향 매핑 ───────────────────────────────────────────────────────────────

const TYPE_DISPLAY: Record<string, string> = {
  FOOD_BEVERAGE: '식음료',
  RETAIL: '소매',
  LIFESTYLE: '라이프스타일',
  PROFESSIONAL: '전문직',
};

const SIZE_DISPLAY: Record<string, string> = {
  SMALL: '1-5명',
  MEDIUM: '6-10명',
  LARGE: '11-15명',
  EXTRA_LARGE: '16명 이상',
};

const DAY_KO: Record<string, string> = {
  MONDAY: '월', TUESDAY: '화', WEDNESDAY: '수',
  THURSDAY: '목', FRIDAY: '금', SATURDAY: '토', SUNDAY: '일',
};

const AVATAR_COLORS = ['#5B9BD5', '#FF8D28', '#7B68EE', '#52B788', '#E07070', '#F4A261'];

function formatWorkDays(days: string[]): string {
  if (!days || days.length === 0) return '미정';
  return days.map(d => DAY_KO[d] ?? d).join('·');
}

// ── 직원 카드 ─────────────────────────────────────────────────────────────────

interface StaffMember {
  storeMemberId: number;
  name: string;
  workDays: string[];
}

function EmployeeCard({ emp, colorIdx }: { emp: StaffMember; colorIdx: number }) {
  const color = AVATAR_COLORS[colorIdx % AVATAR_COLORS.length];
  return (
    <View style={empStyles.card}>
      <View style={[empStyles.avatar, { backgroundColor: color }]}>
        <Text style={empStyles.avatarText}>{(emp.name ?? '?').charAt(0)}</Text>
      </View>
      <Text style={empStyles.name}>{emp.name ?? '-'}</Text>
      <Text style={empStyles.days} numberOfLines={2}>{formatWorkDays(emp.workDays)}</Text>
    </View>
  );
}

const empStyles = StyleSheet.create({
  card: {
    width: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  name: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' },
  days: { fontSize: 11, color: '#888888', textAlign: 'center', lineHeight: 16 },
});

// ── 정보 행 ───────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={rowStyles.wrap}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.value}>{value || '-'}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: '#F4F4F8',
  },
  label: { fontSize: 13, fontWeight: '600', color: '#888888' },
  value: { fontSize: 14, fontWeight: '500', color: '#1A1A1A', textAlign: 'right', flex: 1, marginLeft: 16 },
});

// ── 메인 화면 ─────────────────────────────────────────────────────────────────

export default function StoreManagementScreen() {
  const navigation = useNavigation();
  const [storeName, setStoreName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [size, setSize] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/stores/me');
        const stores: any[] = res.data.data;
        if (stores && stores.length > 0) {
          const store = stores[0];
          setStoreName(store.name ?? '');
          setBusinessType(TYPE_DISPLAY[store.businessType] ?? store.businessType ?? '');
          setSize(SIZE_DISPLAY[store.size] ?? store.size ?? '');
          setInviteCode(store.inviteCode ?? '');
          setStaffList(store.staffList ?? []);
          if (store.inviteCode) {
            await AsyncStorage.setItem('inviteCode', store.inviteCode);
          }
        }
      } catch {
        const code = await AsyncStorage.getItem('inviteCode');
        if (code) setInviteCode(code);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const copyCode = async () => {
    if (!inviteCode) return;
    await setStringAsync(inviteCode);
    Alert.alert('복사 완료', `초대 코드 ${inviteCode}가 복사되었습니다.`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>매장 관리</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 매장 정보 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>매장 정보</Text>
            <InfoRow label="매장명" value={storeName} />
            <InfoRow label="업종" value={businessType} />
            <InfoRow label="매장 규모" value={size} />
          </View>

          {/* 직원 정보 */}
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>직원 정보</Text>
              <Text style={styles.empCount}>{staffList.length}명</Text>
            </View>
            {staffList.length === 0 ? (
              <Text style={styles.emptyStaff}>등록된 직원이 없습니다</Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.empScrollContent}
              >
                {staffList.map((emp, idx) => (
                  <EmployeeCard key={emp.storeMemberId ?? idx} emp={emp} colorIdx={idx} />
                ))}
              </ScrollView>
            )}
          </View>

          {/* 직원 초대 코드 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>직원 초대 코드</Text>
            <Text style={styles.inviteDesc}>
              아래 코드를 직원에게 공유하면 매장에 합류할 수 있어요.
            </Text>
            <View style={styles.inviteBox}>
              <View style={styles.inviteLeft}>
                <Text style={styles.inviteLabel}>초대 코드</Text>
                <Text style={styles.inviteCode}>{inviteCode || '코드 없음'}</Text>
              </View>
              <TouchableOpacity style={styles.copyBtn} onPress={copyCode} activeOpacity={0.8}>
                <Text style={styles.copyIcon}>📋</Text>
                <Text style={styles.copyText}>복사</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F4F8' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#F4F4F8',
  },
  backBtn: { width: 36 },
  backArrow: { fontSize: 22, color: '#1A1A1A' },
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontSize: 17, fontWeight: '700', color: '#1A1A1A',
  },
  placeholder: { width: 36 },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40, gap: 16 },

  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  sectionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15, fontWeight: '700', color: '#1A1A1A',
    paddingHorizontal: 18, marginBottom: 14,
  },
  empCount: { fontSize: 13, fontWeight: '600', color: Colors.primary, paddingHorizontal: 18 },
  emptyStaff: { fontSize: 13, color: '#AAAAAA', paddingHorizontal: 18, paddingBottom: 14 },
  empScrollContent: { paddingHorizontal: 18, gap: 10, paddingBottom: 14 },

  inviteDesc: {
    fontSize: 13, color: '#888888',
    paddingHorizontal: 18, marginBottom: 12, lineHeight: 18,
  },
  inviteBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 18, marginBottom: 18,
    borderWidth: 1.5, borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 16,
    backgroundColor: '#FFF8F5',
  },
  inviteLeft: { gap: 4 },
  inviteLabel: { fontSize: 11, fontWeight: '600', color: '#AAAAAA' },
  inviteCode: { fontSize: 20, fontWeight: '800', color: Colors.primary, letterSpacing: 2 },
  copyBtn: {
    alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: Colors.primary,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
  },
  copyIcon: { fontSize: 18 },
  copyText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
});
