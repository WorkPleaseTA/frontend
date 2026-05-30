import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Header from '../../components/Header';
import OrangeButton from '../../components/OrangeButton';
import DropDown from '../../components/DropDown';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const INDUSTRY_OPTIONS = ['식음료', '소매', '라이프 스타일', '전문직'];
const SCALE_OPTIONS = ['1-5명', '6-10명', '11-15명', '16명 이상'];

export default function StoreRegisterScreen() {
  const navigation = useNavigation<Nav>();
  const [storeName, setStoreName] = useState('');
  const [industry, setIndustry] = useState('');
  const [scale, setScale] = useState('');

  const isFormValid = storeName.trim() !== '' && industry !== '' && scale !== '';

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

        {/* 매장명 */}
        <View style={styles.fieldWrap}>
          <TextInput
            style={styles.input}
            placeholder="매장명"
            placeholderTextColor="#AAAAAA"
            value={storeName}
            onChangeText={setStoreName}
          />
        </View>

        {/* 업종 드롭다운 */}
        <View style={styles.fieldWrap}>
          <DropDown
            options={INDUSTRY_OPTIONS}
            value={industry}
            onSelect={setIndustry}
            placeholder="업종"
          />
        </View>

        {/* 규모 드롭다운 */}
        <View style={styles.fieldWrap}>
          <DropDown
            options={SCALE_OPTIONS}
            value={scale}
            onSelect={setScale}
            placeholder="규모"
          />
        </View>

        <View style={styles.buttonWrap}>
          <OrangeButton
            title="회원가입"
            onPress={() => navigation.navigate('SignUpComplete')}
            disabled={!isFormValid}
            style={[styles.btnOverride, !isFormValid && styles.btnDisabled]}
            textStyle={styles.btnText}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFE',
  },
  scroll: {
    paddingBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#FF8C00',
    marginLeft: 52,
    marginBottom: 12,
  },
  fieldWrap: {
    paddingHorizontal: 52,
    marginBottom: 12,
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
    paddingHorizontal: 43,
    marginTop: 32,
  },
  btnOverride: {
    height: 40,
    borderRadius: 5,
    backgroundColor: '#FF8D28',
  },
  btnDisabled: {
    backgroundColor: '#C7C7CC',
  },
  btnText: {
    fontWeight: '700',
  },
});
