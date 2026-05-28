import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Clipboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';

// ── Mock data ──────────────────────────────────────────────────────────────

type Employee = {
  id: string;
  name: string;
  role: string;
  days: string;
  initial: string;
  color: string;
};

const EMPLOYEES: Employee[] = [
  { id: '1', name: '김매니저', role: '매니저', days: '월·화·수·목·금', initial: '김', color: '#5B9BD5' },
  { id: '2', name: '홍길동',  role: '바리스타', days: '월·수·금·토',   initial: '홍', color: Colors.primary },
  { id: '3', name: '이바리스타', role: '바리스타', days: '화·목·토',   initial: '이', color: '#7B68EE' },
  { id: '4', name: '박알바',  role: '아르바이트', days: '수·금·일',    initial: '박', color: '#52B788' },
  { id: '5', name: '최직원',  role: '아르바이트', days: '토·일',       initial: '최', color: '#E07070' },
];

const INVITE_CODE = 'ILHAE-7X3K9';

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  '매니저':     { bg: '#E8F0FE', text: '#4A6CF7' },
  '바리스타':   { bg: '#E8F5E9', text: '#27AE60' },
  '아르바이트': { bg: '#FFF4EE', text: Colors.primary },
};

// ── Sub-components ─────────────────────────────────────────────────────────

function LabeledField({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TextInput
        style={fieldStyles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? ''}
        placeholderTextColor="#BBBBBB"
      />
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: '#555555' },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: '#1A1A1A',
  },
});

function EmployeeCard({ emp }: { emp: Employee }) {
  const roleSty = ROLE_COLORS[emp.role] ?? { bg: '#F0F0F0', text: '#888888' };
  return (
    <View style={empStyles.card}>
      <View style={[empStyles.avatar, { backgroundColor: emp.color }]}>
        <Text style={empStyles.avatarText}>{emp.initial}</Text>
      </View>
      <Text style={empStyles.name}>{emp.name}</Text>
      <View style={[empStyles.roleBadge, { backgroundColor: roleSty.bg }]}>
        <Text style={[empStyles.roleText, { color: roleSty.text }]}>{emp.role}</Text>
      </View>
      <Text style={empStyles.days} numberOfLines={2}>{emp.days}</Text>
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
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  name: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' },
  roleBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  roleText: { fontSize: 11, fontWeight: '600' },
  days: { fontSize: 11, color: '#888888', textAlign: 'center', lineHeight: 16 },
});

// ── Main screen ────────────────────────────────────────────────────────────

export default function StoreManagementScreen() {
  const navigation = useNavigation();

  const [storeName, setStoreName] = useState('일해조');
  const [storeType, setStoreType] = useState('소매');
  const [storeSize, setStoreSize] = useState('5-10명');

  const copyCode = () => {
    Clipboard.setString(INVITE_CODE);
    Alert.alert('복사 완료', `초대 코드 ${INVITE_CODE}가 복사되었습니다.`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>매장 관리</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── 매장 정보 섹션 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>매장 정보</Text>
          <View style={styles.fieldsWrap}>
            <LabeledField
              label="매장명"
              value={storeName}
              onChangeText={setStoreName}
              placeholder="매장 이름을 입력하세요"
            />
            <LabeledField
              label="업종"
              value={storeType}
              onChangeText={setStoreType}
              placeholder="업종을 입력하세요"
            />
            <LabeledField
              label="매장 규모"
              value={storeSize}
              onChangeText={setStoreSize}
              placeholder="예: 5-10명"
            />
          </View>
        </View>

        {/* ── 직원 정보 섹션 ── */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>직원 정보</Text>
            <Text style={styles.empCount}>{EMPLOYEES.length}명</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.empScrollContent}
          >
            {EMPLOYEES.map((emp) => (
              <EmployeeCard key={emp.id} emp={emp} />
            ))}
          </ScrollView>
        </View>

        {/* ── 직원 초대 코드 섹션 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>직원 초대 코드</Text>
          <Text style={styles.inviteDesc}>
            아래 코드를 직원에게 공유하면 매장에 합류할 수 있어요.
          </Text>
          <View style={styles.inviteBox}>
            <View style={styles.inviteLeft}>
              <Text style={styles.inviteLabel}>초대 코드</Text>
              <Text style={styles.inviteCode}>{INVITE_CODE}</Text>
            </View>
            <TouchableOpacity style={styles.copyBtn} onPress={copyCode} activeOpacity={0.8}>
              <Text style={styles.copyIcon}>📋</Text>
              <Text style={styles.copyText}>복사</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 저장 버튼 ── */}
        <TouchableOpacity
          style={styles.saveBtn}
          activeOpacity={0.85}
          onPress={() => Alert.alert('저장 완료', '매장 정보가 저장되었습니다.')}
        >
          <Text style={styles.saveBtnText}>저장하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F4F8' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F4F4F8',
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

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40, gap: 16, paddingHorizontal: 0 },

  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  empCount: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    paddingHorizontal: 18,
  },
  fieldsWrap: {
    paddingHorizontal: 18,
    gap: 14,
  },

  empScrollContent: {
    paddingHorizontal: 18,
    gap: 10,
    paddingBottom: 2,
  },

  inviteDesc: {
    fontSize: 13,
    color: '#888888',
    paddingHorizontal: 18,
    marginBottom: 12,
    lineHeight: 18,
  },
  inviteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 18,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFF8F5',
  },
  inviteLeft: { gap: 4 },
  inviteLabel: { fontSize: 11, fontWeight: '600', color: '#AAAAAA' },
  inviteCode: { fontSize: 20, fontWeight: '800', color: Colors.primary, letterSpacing: 2 },
  copyBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  copyIcon: { fontSize: 18 },
  copyText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },

  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    marginHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
