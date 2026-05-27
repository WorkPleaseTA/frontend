import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Header from '../../components/Header';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function RegisterCompleteScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <Header title="등록하기" showBack={false} />

      <View style={styles.content}>
        {/* 일러스트 — assets/register_complete.png 추가 후 Image로 교체 */}
        <View style={styles.illustration} />

        <Text style={styles.message}>알바생 등록이 완료되었습니다!</Text>
      </View>

      <View style={styles.buttonWrap}>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Text style={styles.loginBtnText}>로그인하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFE',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  illustration: {
    width: 216,
    height: 216,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  message: {
    fontSize: 20,
    fontWeight: '400',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 20 * 1.5,
  },
  buttonWrap: {
    paddingHorizontal: 43,
    paddingBottom: 48,
  },
  loginBtn: {
    backgroundColor: '#FF8C00',
    borderRadius: 5,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '400',
  },
});
