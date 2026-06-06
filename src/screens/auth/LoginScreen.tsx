import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/Header';
import OrangeButton from '../../components/OrangeButton';
import { RootStackParamList } from '../../navigation/AppNavigator';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// JWT payload 디코드로 role 추출 — API 응답에 role 필드 없어도 동작
function extractRoleFromJWT(token: string): 'OWNER' | 'STAFF' | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const raw: string | undefined = payload.role ?? payload.roles?.[0] ?? payload.authority;
    if (!raw) return null;
    const normalized = String(raw).replace(/^ROLE_/i, '').toUpperCase();
    if (normalized === 'OWNER') return 'OWNER';
    if (normalized === 'STAFF') return 'STAFF';
    return null;
  } catch {
    return null;
  }
}

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { fetchAndSetStoreInfo } = useAuth();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!id || !password) {
      Alert.alert('알림', '아이디와 비밀번호를 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { loginId: id, password });
      const { accessToken, refreshToken, name: loginName, role: loginRole } = res.data.data;

      // 응답의 role 우선, 없으면 JWT 디코딩 폴백
      const resolvedRole = (loginRole as 'OWNER' | 'STAFF' | undefined) ?? extractRoleFromJWT(accessToken);
      const storageItems: [string, string][] = [
        ['accessToken', accessToken],
        ['refreshToken', refreshToken],
      ];
      if (resolvedRole) storageItems.push(['userRole', resolvedRole]);
      if (loginName) storageItems.push(['userName', loginName]);
      await AsyncStorage.multiSet(storageItems);

      const info = await fetchAndSetStoreInfo();
      if (info) {
        navigation.replace(info.role === 'OWNER' ? 'Main' : 'EmployeeMain');
      } else {
        // 가게 미등록 — OWNER는 가게 등록 화면, STAFF는 홈으로 (매장 합류는 회원가입 때만)
        const role = await AsyncStorage.getItem('userRole');
        navigation.replace(role === 'OWNER' ? 'StoreRegister' : 'EmployeeMain');
      }
    } catch (e: any) {
      Alert.alert('로그인 실패', e.response?.data?.message ?? '아이디 또는 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="" showBack />

      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Text style={styles.title}>로그인</Text>

        <View style={styles.inputs}>
          <TextInput
            style={styles.input}
            placeholder="아이디"
            placeholderTextColor="#AAAAAA"
            value={id}
            onChangeText={setId}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="비밀번호"
            placeholderTextColor="#AAAAAA"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.buttonWrap}>
          {loading
            ? <ActivityIndicator color="#FF8D28" />
            : (
              <OrangeButton
                title="로그인"
                onPress={handleLogin}
                style={styles.btnOverride}
                textStyle={styles.btnText}
              />
            )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFE' },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
  title: { fontSize: 32, fontWeight: '500', color: '#000000', textAlign: 'center' },
  inputs: { width: '100%', paddingHorizontal: 52, gap: 12 },
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
  buttonWrap: { width: '100%', paddingHorizontal: 43 },
  btnOverride: { height: 40, borderRadius: 5, backgroundColor: '#FF8D28' },
  btnText: { fontWeight: '700', fontSize: 14 },
});
