import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Header from '../../components/Header';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// TODO: 실제 코드 인증 후 매장명을 props 또는 전역 상태로 전달
const STORE_NAME = '스타벅스 강남점';

export default function StoreConfirmScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <Header title="등록하기" showBack />

      <View style={styles.content}>
        {/* 일러스트 — assets/store_illustration.png 추가 후 Image로 교체 */}
        <View style={styles.illustration} />

        <View style={styles.storeBox}>
          <Text style={styles.storeName}>{STORE_NAME}</Text>
        </View>

        <Text style={styles.confirm}>{'해당 매장에\n등록하는 것이 맞으신가요?'}</Text>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.btn, styles.noBtn]}
            onPress={() => navigation.navigate('StoreCode')}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>아니요</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.yesBtn]}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>예</Text>
          </TouchableOpacity>
        </View>
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
    gap: 24,
  },
  illustration: {
    width: 216,
    height: 216,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  storeBox: {
    width: 256,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FF8D28',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  storeName: {
    fontSize: 14,
    color: '#000000',
  },
  confirm: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 24 * 1.5,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    width: 136,
    height: 35,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noBtn: {
    backgroundColor: '#E2E0DE',
  },
  yesBtn: {
    backgroundColor: '#FF8C00',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
