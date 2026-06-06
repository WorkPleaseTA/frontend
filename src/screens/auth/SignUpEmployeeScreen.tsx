import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/Header';
import OrangeButton from '../../components/OrangeButton';
import { RootStackParamList } from '../../navigation/AppNavigator';
import api from '../../api/client';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type IdCheckStatus = 'none' | 'available' | 'duplicate';

export default function EmployeeSignUpScreen() {
  const navigation = useNavigation<Nav>();
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [idCheckStatus, setIdCheckStatus] = useState<IdCheckStatus>('none');
  const [loading, setLoading] = useState(false);

  const handleUserIdChange = (text: string) => {
    setUserId(text);
    setIdCheckStatus('none');
  };

  const handleIdCheck = async () => {
    if (!userId) return;
    setIdCheckStatus('available');
  };

  const isFormValid =
    name.trim() !== '' &&
    userId.trim() !== '' &&
    password !== '' &&
    passwordConfirm !== '';

  const handleNext = async () => {
    if (password !== passwordConfirm) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/signup', { loginId: userId, password, name, role: 'STAFF' });

      const res = await api.post('/auth/login', { loginId: userId, password });
      const { accessToken, refreshToken } = res.data.data;
      await AsyncStorage.multiSet([
        ['accessToken', accessToken],
        ['refreshToken', refreshToken],
        ['userRole', 'STAFF'],
        ['userName', name],
      ]);

      navigation.navigate('StoreCode');
    } catch (e: any) {
      if (e.response?.status === 409) {
        setIdCheckStatus('duplicate');
        Alert.alert('중복된 아이디', '이미 사용 중인 아이디입니다.');
      } else {
        Alert.alert('오류', e.response?.data?.message ?? '회원가입에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.sectionLabel}>개인정보 입력</Text>

        <View style={styles.fieldWrap}>
          <TextInput
            style={styles.input}
            placeholder="이름"
            placeholderTextColor="#AAAAAA"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.idSection}>
          <View style={styles.idRow}>
            <TextInput
              style={[styles.input, styles.idInput]}
              placeholder="아이디"
              placeholderTextColor="#AAAAAA"
              value={userId}
              onChangeText={handleUserIdChange}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.checkBtn} onPress={handleIdCheck} activeOpacity={0.8}>
              <Text style={styles.checkBtnText}>중복확인</Text>
            </TouchableOpacity>
          </View>
          {idCheckStatus === 'available' && (
            <Text style={styles.msgAvailable}>사용할 수 있는 아이디입니다.</Text>
          )}
          {idCheckStatus === 'duplicate' && (
            <Text style={styles.msgDuplicate}>중복된 아이디입니다. 다른 아이디를 사용해주세요.</Text>
          )}
        </View>

        <View style={styles.fieldWrap}>
          <TextInput
            style={styles.input}
            placeholder="비밀번호"
            placeholderTextColor="#AAAAAA"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.fieldWrap}>
          <TextInput
            style={styles.input}
            placeholder="비밀번호 재입력"
            placeholderTextColor="#AAAAAA"
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            secureTextEntry
          />
        </View>

        <View style={styles.buttonWrap}>
          {loading
            ? <ActivityIndicator color="#FF8D28" />
            : (
              <OrangeButton
                title="다음"
                onPress={handleNext}
                disabled={!isFormValid}
                style={[styles.btnOverride, !isFormValid && styles.btnDisabled]}
                textStyle={styles.btnText}
              />
            )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFE' },
  scroll: { paddingBottom: 48 },
  title: { fontSize: 32, fontWeight: '500', color: '#000000', textAlign: 'center', marginTop: 32, marginBottom: 28 },
  sectionLabel: { fontSize: 14, color: '#FF8C00', marginLeft: 57, marginBottom: 12 },
  fieldWrap: { paddingHorizontal: 57, marginBottom: 12 },
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
  idSection: { paddingHorizontal: 57, marginBottom: 12 },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  idInput: { flex: 1 },
  checkBtn: {
    backgroundColor: '#FF8D28',
    borderRadius: 11,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '500' },
  msgAvailable: { marginTop: 4, fontSize: 11, fontWeight: '500', color: '#34C759' },
  msgDuplicate: { marginTop: 4, fontSize: 11, fontWeight: '500', color: '#FF0000' },
  buttonWrap: { paddingHorizontal: 46, marginTop: 32 },
  btnOverride: { height: 40, borderRadius: 5, backgroundColor: '#FF8D28' },
  btnDisabled: { backgroundColor: '#C7C7CC' },
  btnText: { fontWeight: '700' },
});
