import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../constants/colors';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SplashScreen() {
  const navigation = useNavigation<Nav>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Start');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>일해조</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  logo: { fontSize: 36, fontWeight: '700', color: Colors.white },
});
