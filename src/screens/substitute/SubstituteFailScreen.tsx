import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../constants/colors';
import { BottomTabBarStatic } from '../../components/BottomTabBar';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

type Nav   = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'SubstituteFail'>;

const AVATAR_COLORS = ['#5B9BD5', '#7B68EE', '#52B788', '#E07070', '#F4A261'];
const avatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const fmtDate = (d: string) => {
  try { const [y, m, dd] = d.split('-'); return `${y}년 ${Number(m)}월 ${Number(dd)}일`; }
  catch { return d; }
};
const fmtTime = (t: string) => t.slice(0, 5);

export default function SubstituteFailScreen() {
  const navigation = useNavigation<Nav>();
  const route      = useRoute<Route>();
  const { selectedCandidates, requestDate, startTime, endTime } = route.params;
  const { storeInfo } = useAuth();

  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      Alert.alert('메시지 필요', '대타 요청 메시지를 입력해주세요.');
      return;
    }
    if (!storeInfo) return;

    setSending(true);
    try {
      await api.post('/substitute/requests', {
        storeId: storeInfo.storeId,
        requestDate,
        startTime,
        endTime,
        message: message.trim(),
        selectedStoreMemberIds: selectedCandidates.map(c => c.storeMemberId),
      });
      Alert.alert('전송 완료', `${selectedCandidates.length}명에게 대타 요청을 보냈습니다.`, [
        {
          text: '확인',
          onPress: () => {
            // SubstituteRequest 탭으로 돌아가기
            navigation.popToTop();
          },
        },
      ]);
    } catch (e: any) {
      Alert.alert('오류', e?.response?.data?.message ?? '대타 요청 전송에 실패했습니다.');
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* 헤더 */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={s.backBtn}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>대타 요청</Text>
        <View style={s.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* 요청 정보 (읽기 전용) */}
        <View style={s.infoCard}>
          <Text style={s.infoTitle}>요청 정보</Text>
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>날짜</Text>
            <Text style={s.infoValue}>{fmtDate(requestDate)}</Text>
          </View>
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>시간</Text>
            <Text style={s.infoValue}>{fmtTime(startTime)} ~ {fmtTime(endTime)}</Text>
          </View>
        </View>

        {/* 선택된 직원 */}
        <View style={s.section}>
          <Text style={s.label}>요청 대상 ({selectedCandidates.length}명)</Text>
          <View style={s.candidateRow}>
            {selectedCandidates.map((c) => (
              <View key={c.storeMemberId} style={s.candidateItem}>
                <View style={[s.candidateAvatar, { backgroundColor: avatarColor(c.staffName) }]}>
                  <Text style={s.candidateInitial}>{c.staffName.charAt(0)}</Text>
                </View>
                <Text style={s.candidateName}>{c.staffName}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 메시지 작성 */}
        <View style={s.section}>
          <Text style={s.label}>대타 요청 메시지</Text>
          <TextInput
            style={s.messageInput}
            placeholder="대타 요청 사유를 입력해주세요&#13;예: 자격증 시험 때문에 대타 요청드립니다."
            placeholderTextColor="#BBBBBB"
            value={message}
            onChangeText={setMessage}
            multiline
            textAlignVertical="top"
            maxLength={300}
          />
          <Text style={s.charCount}>{message.length}/300</Text>
        </View>

        {/* 전송 버튼 */}
        <TouchableOpacity
          style={[s.sendBtn, !!message.trim() && !sending && s.sendBtnActive]}
          activeOpacity={0.85}
          onPress={handleSend}
          disabled={sending}
        >
          {sending
            ? <ActivityIndicator size="small" color="#FFFFFF" />
            : <Text style={[s.sendBtnText, !!message.trim() && s.sendBtnTextActive]}>전송</Text>
          }
        </TouchableOpacity>
      </ScrollView>

      <BottomTabBarStatic activeIndex={3} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn:     { width: 36 },
  backArrow:   { fontSize: 22, color: '#1A1A1A' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  placeholder: { width: 36 },

  scroll: { padding: 20, gap: 20, paddingBottom: 100 },

  infoCard: {
    backgroundColor: '#F8F8F8', borderRadius: 12,
    padding: 14, gap: 8,
  },
  infoTitle: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
  infoRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 13, color: '#888888', fontWeight: '500' },
  infoValue: { fontSize: 13, color: '#1A1A1A', fontWeight: '600' },

  section: { gap: 10 },
  label:   { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },

  candidateRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  candidateItem:{ alignItems: 'center', gap: 4 },
  candidateAvatar: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
  },
  candidateInitial: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  candidateName:    { fontSize: 11, color: '#555555', fontWeight: '500' },

  messageInput: {
    borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12,
    padding: 14, minHeight: 120, fontSize: 14, color: '#1A1A1A',
    backgroundColor: '#FAFAFA', lineHeight: 22,
  },
  charCount: { fontSize: 11, color: '#AAAAAA', textAlign: 'right' },

  sendBtn: {
    borderRadius: 12, paddingVertical: 15, alignItems: 'center',
    backgroundColor: '#E0E0E0', marginTop: 4,
  },
  sendBtnActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  sendBtnText:      { fontSize: 15, fontWeight: '700', color: '#AAAAAA' },
  sendBtnTextActive:{ color: '#FFFFFF' },
});
