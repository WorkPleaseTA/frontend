import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SignUpScreen() {
  const navigation = useNavigation<Nav>();

  const handleSelectRole = async (role: 'manager' | 'employee') => {
    await AsyncStorage.setItem('userRole', role);
    if (role === 'manager') {
      navigation.navigate('SignUpManager');
    } else {
      navigation.navigate('SignUpEmployee');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="" showBack noBorder />

      <View style={styles.content}>
        <Text style={styles.title}>어떤 역할인가요?</Text>
        <Text style={styles.sub}>역할에 맞는 계정을 만들어 드릴게요</Text>

        <View style={styles.cards}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleSelectRole('manager')}
            activeOpacity={0.8}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.cardEmoji}>🏢</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>사장님이신가요?</Text>
              <Text style={styles.cardDesc}>매장을 등록하고 직원을 관리해요</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CCCCCC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => handleSelectRole('employee')}
            activeOpacity={0.8}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.cardEmoji}>👤</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>직원이신가요?</Text>
              <Text style={styles.cardDesc}>초대코드로 매장에 합류해요</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CCCCCC" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    gap: 0,
    marginTop: -48,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  sub: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 32,
  },
  cards: { gap: 14 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8FA',
    borderRadius: 18,
    padding: 18,
    gap: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFF4EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: { fontSize: 26 },
  cardBody: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  cardDesc: { fontSize: 12, color: '#888888', lineHeight: 18 },
});
