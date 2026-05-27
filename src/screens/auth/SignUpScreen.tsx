import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Header from '../../components/Header';
import OrangeButton from '../../components/OrangeButton';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SignUpScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <Header title="" showBack />

      <View style={styles.content}>
        <Text style={styles.title}>회원가입</Text>

        <View style={styles.buttons}>
          <OrangeButton
            title="관리자이신가요?"
            onPress={() => navigation.navigate('RegisterManager')}
            style={styles.btnOverride}
            textStyle={styles.btnText}
          />
          <OrangeButton
            title="직원인가요?"
            secondary
            onPress={() => navigation.navigate('RegisterEmployee')}
            style={[styles.btnOverride, styles.secondaryOverride]}
            textStyle={styles.btnText}
          />
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
    gap: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
  },
  buttons: {
    width: '100%',
    paddingHorizontal: 46,
    gap: 12,
  },
  btnOverride: {
    height: 40,
    borderRadius: 5,
    backgroundColor: '#FF8D28',
  },
  secondaryOverride: {
    backgroundColor: '#C7C7CC',
    borderWidth: 1,
    borderColor: '#C7C7CC',
  },
  btnText: {
    fontWeight: '700',
    fontSize: 14,
  },
});
