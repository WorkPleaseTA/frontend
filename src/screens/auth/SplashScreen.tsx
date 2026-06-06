import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SplashScreen() {
  const navigation = useNavigation<Nav>();
  const { fetchAndSetStoreInfo } = useAuth();

  useEffect(() => {
    const init = async () => {
      const [token] = await Promise.all([
        AsyncStorage.getItem('accessToken'),
        new Promise((r) => setTimeout(r, 1500)),
      ]);

      if (token) {
        try {
          const info = await fetchAndSetStoreInfo();
          if (info) {
            navigation.replace(info.role === 'OWNER' ? 'Main' : 'EmployeeMain');
            return;
          }
        } catch {}
      }
      navigation.replace('Start');
    };
    init();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFE', alignItems: 'center', justifyContent: 'center' },
  logo: { width: 220, height: 220 },
});
