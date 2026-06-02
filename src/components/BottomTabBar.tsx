import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';

const ICONS = {
  home:      { active: '🏠', inactive: '🏠' },
  calendar:  { active: '📅', inactive: '📅' },
  chat:      { active: '💬', inactive: '💬' },
  bell:      { active: '🔔', inactive: '🔔' },
  check:     { active: '✅', inactive: '☑️' },
};

const TAB_META: Record<string, { label: string; iconKey: keyof typeof ICONS }> = {
  Home:         { label: '홈',    iconKey: 'home'     },
  Calendar:     { label: '캘린더', iconKey: 'calendar' },
  Chat:         { label: '메세지', iconKey: 'chat'     },
  Notification: { label: '알림',  iconKey: 'bell'     },
  Todo:         { label: '할일',  iconKey: 'check'    },
};

export default function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const renderTab = (route: (typeof state.routes)[0], tabIndex: number) => {
    const meta     = TAB_META[route.name];
    const isActive = state.index === tabIndex;
    const icon     = isActive ? ICONS[meta.iconKey].active : ICONS[meta.iconKey].inactive;

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
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, idx) => renderTab(route, idx))}
    </View>
  );
}

const STATIC_TABS = [
  { name: 'Home',         label: '홈',    icon: '🏠' },
  { name: 'Calendar',     label: '캘린더', icon: '📅' },
  { name: 'Chat',         label: '채팅',   icon: '💬' },
  { name: 'Notification', label: '알림',   icon: '🔔' },
  { name: 'Todo',         label: '메모',   icon: '📝' },
];

export function BottomTabBarStatic({ activeIndex }: { activeIndex: number }) {
  const navigation = useNavigation();

  const handlePress = (tabName: string) => {
    (navigation as any).navigate('EmployeeMain', { screen: tabName });
  };

  return (
    <View style={styles.container}>
      {STATIC_TABS.map((tab, index) => {
        const isFocused = index === activeIndex;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => handlePress(tab.name)}
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 8,
    minHeight: 60,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 2 : 6,
    gap: 3,
  },
  icon: {
    fontSize: 22,
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
