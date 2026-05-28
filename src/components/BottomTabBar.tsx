import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../constants/colors';

// Unicode / emoji icons — no native font dependency
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
  Notification: { label: '할일',  iconKey: 'check'    },
};

export default function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const stackNav = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();

  // routes = [Home, Calendar, Chat, Notification]
  // Visual: 홈 | 캘린더 | 메세지 | 알림(bell→stack) | 할일(Notification tab)
  const firstRoutes = state.routes.slice(0, 3); // Home, Calendar, Chat
  const lastRoutes  = state.routes.slice(3);    // Notification (=할일)

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
    <View style={styles.container}>
      {/* 1·2·3: 홈, 캘린더, 메세지 */}
      {firstRoutes.map((route, idx) => renderTab(route, idx))}

      {/* 4: 알림 — Stack 화면(SubstituteRequest)으로 이동 */}
      <TouchableOpacity
        style={styles.tab}
        onPress={() => stackNav?.navigate('SubstituteRequest')}
        activeOpacity={0.7}
      >
        <Text style={styles.icon}>{ICONS.bell.inactive}</Text>
        <Text style={styles.label}>알림</Text>
      </TouchableOpacity>

      {/* 5: 할일 (Notification tab → ToDoListScreen) */}
      {lastRoutes.map((route, idx) => renderTab(route, 3 + idx))}
    </View>
  );
}

// Static tab bar for screens outside the tab navigator (employee branch screens)
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
    navigation.navigate('Main' as never, { screen: tabName } as never);
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
