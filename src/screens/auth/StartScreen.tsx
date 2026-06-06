import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function StartScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.illustrationArea}>
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.welcome}>Welcome</Text>
      <Text style={styles.subtitle}>
        일해조와 함께{'\n'}스마트하게 일해보세요
      </Text>

      <View style={styles.buttonArea}>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginText}>로그인</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signUpButton}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.signUpText}>회원가입</Text>
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
  illustrationArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
  welcome: {
    fontSize: 32,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#2C3948',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  buttonArea: {
    paddingHorizontal: 43,
    paddingBottom: 40,
  },
  loginButton: {
    height: 40,
    backgroundColor: '#FF8D28',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  loginText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  signUpButton: {
    height: 40,
    backgroundColor: '#C7C7CC',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
