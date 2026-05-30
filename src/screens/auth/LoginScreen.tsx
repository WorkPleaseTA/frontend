import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Header from '../../components/Header';
import OrangeButton from '../../components/OrangeButton';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

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
          <OrangeButton
            title="다음"
            onPress={() => navigation.navigate('Main')}
            style={styles.btnOverride}
            textStyle={styles.btnText}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFE',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
  },
  inputs: {
    width: '100%',
    paddingHorizontal: 52,
    gap: 12,
  },
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
  buttonWrap: {
    width: '100%',
    paddingHorizontal: 43,
  },
  btnOverride: {
    height: 40,
    borderRadius: 5,
    backgroundColor: '#FF8D28',
  },
  btnText: {
    fontWeight: '700',
    fontSize: 14,
  },
});
