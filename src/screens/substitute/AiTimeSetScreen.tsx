import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AiTimeSetScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>AI가능시간설정</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  text: { fontSize: 18, color: '#1A1A1A' },
});
