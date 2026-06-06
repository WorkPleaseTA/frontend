import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Modal, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Clipboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/Header';
import OrangeButton from '../../components/OrangeButton';
import DropDown from '../../components/DropDown';
import { RootStackParamList } from '../../navigation/AppNavigator';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const INDUSTRY_OPTIONS = ['식음료', '소매', '라이프스타일', '전문직'];
const SCALE_OPTIONS = ['1-5명', '6-10명', '11-15명', '16명 이상'];

const BUSINESS_TYPE_MAP: Record<string, string> = {
  '식음료': 'FOOD_BEVERAGE',
  '소매': 'RETAIL',
  '라이프스타일': 'LIFESTYLE',
  '전문직': 'PROFESSIONAL',
};

const SIZE_MAP: Record<string, string> = {
  '1-5명': 'SMALL',
  '6-10명': 'MEDIUM',
  '11-15명': 'LARGE',
  '16명 이상': 'EXTRA_LARGE',
};

export default function StoreRegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { fetchAndSetStoreInfo } = useAuth();
  const [storeName, setStoreName] = useState('');
  const [industry, setIndustry] = useState('');
  const [scale, setScale] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [showCodeModal, setShowCodeModal] = useState(false);

  const isFormValid = storeName.trim() !== '' && industry !== '' && scale !== '';

  const handleRegister = async () => {
    setLoading(true);
    try {
      const res = await api.post('/stores', {
        name: storeName,
        businessType: BUSINESS_TYPE_MAP[industry],
        size: SIZE_MAP[scale],
      });
      const code: string = res.data.data?.inviteCode ?? '';
      setInviteCode(code);
      await AsyncStorage.setItem('inviteCode', code);
      await fetchAndSetStoreInfo();
      setShowCodeModal(true);
    } catch (e: any) {
      Alert.alert('오류', e.response?.data?.message ?? '매장 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    Clipboard.setString(inviteCode);
    Alert.alert('복사 완료', '초대 코드가 클립보드에 복사되었습니다.');
  };

  const handleConfirm = () => {
    setShowCodeModal(false);
    navigation.replace('Main');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header title="" showBack />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>회원가입</Text>
        <Text style={styles.sectionLabel}>매장정보 입력</Text>

        <View style={styles.fieldWrap}>
          <TextInput
            style={styles.input}
            placeholder="매장명"
            placeholderTextColor="#AAAAAA"
            value={storeName}
            onChangeText={setStoreName}
          />
        </View>

        <View style={styles.fieldWrap}>
          <DropDown
            options={INDUSTRY_OPTIONS}
            value={industry}
            onSelect={setIndustry}
            placeholder="업종"
          />
        </View>

        <View style={styles.fieldWrap}>
          <DropDown
            options={SCALE_OPTIONS}
            value={scale}
            onSelect={setScale}
            placeholder="규모"
          />
        </View>

        <View style={styles.buttonWrap}>
          {loading
            ? <ActivityIndicator color="#FF8D28" />
            : (
              <OrangeButton
                title="회원가입"
                onPress={handleRegister}
                disabled={!isFormValid}
                style={[styles.btnOverride, !isFormValid && styles.btnDisabled]}
                textStyle={styles.btnText}
              />
            )}
        </View>
      </ScrollView>

      {/* 초대 코드 확인 모달 */}
      <Modal visible={showCodeModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>매장 등록 완료!</Text>
            <Text style={styles.modalDesc}>
              직원에게 아래 초대 코드를 공유하세요.
            </Text>

            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{inviteCode}</Text>
            </View>

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.copyBtn} onPress={copyCode} activeOpacity={0.8}>
                <Text style={styles.copyBtnText}>복사</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.8}>
                <Text style={styles.confirmBtnText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFE' },
  scroll: { paddingBottom: 48 },
  title: { fontSize: 32, fontWeight: '500', color: '#000000', textAlign: 'center', marginTop: 32, marginBottom: 28 },
  sectionLabel: { fontSize: 14, color: '#FF8C00', marginLeft: 52, marginBottom: 12 },
  fieldWrap: { paddingHorizontal: 52, marginBottom: 12 },
  input: {
    height: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FF8D28',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 12,
    color: '#1A1A1A',
  },
  buttonWrap: { paddingHorizontal: 43, marginTop: 32 },
  btnOverride: { height: 40, borderRadius: 5, backgroundColor: '#FF8D28' },
  btnDisabled: { backgroundColor: '#C7C7CC' },
  btnText: { fontWeight: '700' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalBox: {
    width: 300, backgroundColor: '#FFFFFF',
    borderRadius: 16, padding: 24, gap: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  modalDesc: { fontSize: 13, color: '#777777', lineHeight: 18 },
  codeBox: {
    backgroundColor: '#FFF8F5',
    borderWidth: 1.5, borderColor: '#FF8D28',
    borderRadius: 12, paddingVertical: 14,
    alignItems: 'center',
  },
  codeText: { fontSize: 22, fontWeight: '800', color: '#FF8D28', letterSpacing: 2 },
  modalBtns: { flexDirection: 'row', gap: 12 },
  copyBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#FF8D28',
    borderRadius: 10, paddingVertical: 12, alignItems: 'center',
  },
  copyBtnText: { fontSize: 14, fontWeight: '600', color: '#FF8D28' },
  confirmBtn: {
    flex: 1, backgroundColor: '#FF8D28',
    borderRadius: 10, paddingVertical: 12, alignItems: 'center',
  },
  confirmBtnText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
});
