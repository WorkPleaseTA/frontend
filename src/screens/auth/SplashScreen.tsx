import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import OrangeButton from '../../components/OrangeButton';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const LOGO_WIDTH = Math.min(470, Dimensions.get('window').width - 48);

export default function SplashScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Image
          source={require('../../../assets/logo.png')}
          style={{ width: LOGO_WIDTH, height: LOGO_WIDTH }}
          resizeMode="contain"
        />
        <Text style={styles.appName}>일해조</Text>
      </View>

      <View style={styles.buttons}>
        <OrangeButton title="로그인" onPress={() => navigation.navigate('Login')} />
        <OrangeButton title="회원가입" secondary onPress={() => navigation.navigate('RegisterEmployee')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  buttons: {
    gap: 12,
  },
});
