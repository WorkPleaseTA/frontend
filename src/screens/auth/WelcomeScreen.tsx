import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import OrangeButton from '../../components/OrangeButton';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function WelcomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      {/* 뒤로가기 */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      {/* 중앙 콘텐츠 */}
      <View style={styles.center}>
        {/* 일러스트 — assets/welcome_illustration.png 추가 후 아래 Image 교체 */}
        <View style={styles.illustrationPlaceholder} />

        <Text style={styles.greeting}>안녕하세요</Text>
        <Text style={styles.guide}>
          {'기존 회원이시면 로그인을\n저희 서비스가 처음이라면 회원가입을\n진행해주세요'}
        </Text>
      </View>

      {/* 하단 버튼 */}
      <View style={styles.buttons}>
        <OrangeButton
          title="로그인"
          onPress={() => navigation.navigate('Login')}
          style={styles.btnOverride}
          textStyle={styles.btnText}
        />
        <OrangeButton
          title="회원가입"
          secondary
          onPress={() => navigation.navigate('RegisterEmployee')}
          style={[styles.btnOverride, styles.signupOverride]}
          textStyle={styles.btnText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFE',
    paddingBottom: 48,
  },
  backButton: {
    position: 'absolute',
    top: 52,
    left: 20,
    zIndex: 10,
  },
  backIcon: {
    fontSize: 22,
    color: '#000000',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  illustrationPlaceholder: {
    width: 240,
    height: 200,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 8,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '500',
    color: '#000000',
  },
  guide: {
    fontSize: 15,
    color: '#2C3948',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttons: {
    paddingHorizontal: 43,
    gap: 12,
  },
  btnOverride: {
    height: 40,
    borderRadius: 5,
    backgroundColor: '#FF8D28',
  },
  signupOverride: {
    backgroundColor: '#C7C7CC',
    borderWidth: 1,
    borderColor: '#C7C7CC',
  },
  btnText: {
    fontWeight: '700',
  },
});
