import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Header from '../../components/Header';
import OrangeButton from '../../components/OrangeButton';
import { RootStackParamList } from '../../navigation/AppNavigator';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function StoreCodeScreen() {
  const navigation = useNavigation<Nav>();
  const { fetchAndSetStoreInfo } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const isActive = code.trim().length > 0;

  const handleJoin = async () => {
    if (!isActive) return;
    setLoading(true);
    try {
      await api.post('/stores/join', { inviteCode: code.trim() });
      await fetchAndSetStoreInfo(); // 실패해도 조인 자체는 성공이므로 무시
      navigation.replace('EmployeeMain');
    } catch (e: any) {
      Alert.alert('오류', e.response?.data?.message ?? '매장 합류에 실패했습니다. 코드를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header title="등록하기" showBack />

      <View style={styles.content}>
        <Text style={styles.guide}>{'전달 받은 코드를\n입력해주세요!'}</Text>

        <TextInput
          style={styles.input}
          placeholder="매장 코드"
          placeholderTextColor="#AAAAAA"
          value={code}
          onChangeText={setCode}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {loading
          ? <ActivityIndicator color="#FF8D28" />
          : (
            <OrangeButton
              title="확인"
              onPress={handleJoin}
              disabled={!isActive}
              style={[styles.btnOverride, isActive ? styles.btnActive : styles.btnInactive]}
              textStyle={styles.btnText}
            />
          )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFE' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
  guide: { fontSize: 24, fontWeight: '600', color: '#000000', textAlign: 'center', lineHeight: 36 },
  input: {
    width: 256, height: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#FF8D28',
    borderRadius: 12, paddingHorizontal: 14,
    fontSize: 14, color: '#1A1A1A',
  },
  btnOverride: { width: 274, height: 40, borderRadius: 5 },
  btnActive: { backgroundColor: '#FF8D28' },
  btnInactive: { backgroundColor: '#AAAAAA' },
  btnText: { fontWeight: '700' },
});
