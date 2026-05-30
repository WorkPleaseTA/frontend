import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Clipboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// TODO: 실제 API에서 발급된 코드로 교체
const INVITE_CODE = 'Hr@3621';

export default function SignUpCompleteScreen() {
  const navigation = useNavigation<Nav>();

  const handleCopy = () => {
    Clipboard.setString(INVITE_CODE);
    Alert.alert('복사 완료', '초대 코드가 클립보드에 복사되었습니다.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* 일러스트 — assets/complete_illustration.png 추가 후 Image로 교체 */}
        <View style={styles.illustration} />

        <Text style={styles.title}>가입 완료!</Text>

        <View style={styles.codeArea}>
          <Text style={styles.codeLabel}>위 코드를 복사하여 직원 추가</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{INVITE_CODE}</Text>
            <TouchableOpacity onPress={handleCopy} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.copyIcon}>⧉</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 32 * 1.5,
  },
  codeArea: {
    width: 280,
    gap: 8,
  },
  codeLabel: {
    fontSize: 14,
    color: '#FF8C00',
  },
  codeBox: {
    height: 48,
    borderWidth: 1,
    borderColor: '#FF8C00',
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  codeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  copyIcon: {
    fontSize: 18,
    color: '#FF8C00',
  },
  buttonWrap: {
    paddingHorizontal: 47,
    paddingBottom: 48,
  },
  loginBtn: {
    backgroundColor: '#FF8D28',
    borderRadius: 5,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
