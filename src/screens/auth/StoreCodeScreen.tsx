import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

export default function StoreCodeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>알바생 코드 입력 (매장 찾기)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 18, color: Colors.textSecondary },
});
