import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

export default function FixedScheduleScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>고정 스케줄 수정</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 18, color: Colors.textSecondary },
});
