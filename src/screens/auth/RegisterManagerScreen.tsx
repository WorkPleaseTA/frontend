import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RegisterManagerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>회원가입(관리자)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  text: { fontSize: 18, color: '#1A1A1A' },
});
