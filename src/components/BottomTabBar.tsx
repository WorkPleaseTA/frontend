import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';

const ICONS = {
  home:     { active: '🏠', inactive: '🏠' },
  calendar: { active: '📅', inactive: '📅' },
  chat:     { active: '💬', inactive: '💬' },
  bell:     { active: '🔔', inactive: '🔔' },
  check:    { active: '✅', inactive: '☑️' },
};

const TAB_META: Record<string, { label: string; iconKey: keyof typeof ICONS }> = {
  Home:         { label: '홈',    iconKey: 'home'     },
  Calendar:     { label: '캘린더', iconKey: 'calendar' },
  Chat:         { label: '메세지', iconKey: 'chat'     },
  Notification: { label: '알림',  iconKey: 'bell'     },
  Todo:         { label: '할일',  iconKey: 'check'    },
};

export default function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      {state.routes.map((route, idx) => {
        const meta = TAB_META[route.name];
        if (!meta) return null;
        const isActive = state.index === idx;
        const icon = isActive ? ICONS[meta.iconKey].active : ICONS[meta.iconKey].inactive;

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tab}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{icon}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>{meta.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Static tab bar for screens outside the tab navigator
const STATIC_TABS = [
  { name: 'Home',         label: '홈',    icon: '🏠' },
  { name: 'Calendar',     label: '캘린더', icon: '📅' },
  { name: 'Chat',         label: '채팅',   icon: '💬' },
  { name: 'Notification', label: '알림',   icon: '🔔' },
  { name: 'Todo',         label: '할일',   icon: '✅' },
];

export function BottomTabBarStatic({ activeIndex }: { activeIndex: number }) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {STATIC_TABS.map((tab, index) => {
        const isFocused = index === activeIndex;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => (navigation as any).navigate('Main', { screen: tab.name })}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{tab.icon}</Text>
            <Text style={[styles.label, isFocused && styles.labelActive]}>{tab.label}</Text>
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
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
    fontSize: 10,
    color: '#AAAAAA',
    fontWeight: '500',
  },
  labelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
