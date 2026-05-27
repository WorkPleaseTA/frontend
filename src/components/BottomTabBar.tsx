import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors } from '../constants/colors';

const TABS = [
  { name: 'Home', label: '홈', icon: '🏠' },
  { name: 'Calendar', label: '캘린더', icon: '📅' },
  { name: 'Chat', label: '채팅', icon: '💬' },
  { name: 'Notifications', label: '알림', icon: '🔔' },
  { name: 'Memo', label: '메모', icon: '📝' },
];

export default function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      {TABS.map((tab, index) => {
        const isFocused = state.index === index;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => navigation.navigate(tab.name)}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{tab.icon}</Text>
            <Text style={[styles.label, isFocused && styles.activeLabel]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  activeLabel: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
