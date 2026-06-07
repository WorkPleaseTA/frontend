import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface TabMeta {
  label: string;
  active: IoniconName;
  inactive: IoniconName;
}

const TAB_META: Record<string, TabMeta> = {
  Home:         { label: '홈',    active: 'home',              inactive: 'home-outline'              },
  Calendar:     { label: '캘린더', active: 'calendar',          inactive: 'calendar-outline'          },
  Chat:         { label: '메세지', active: 'chatbubbles',       inactive: 'chatbubbles-outline'       },
  Notification: { label: '알림',  active: 'notifications',     inactive: 'notifications-outline'     },
  Todo:         { label: '할일',  active: 'checkbox',          inactive: 'checkbox-outline'          },
};

export default function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, idx) => {
        const meta     = TAB_META[route.name];
        if (!meta) return null;
        const isActive = state.index === idx;
        const iconName = isActive ? meta.active : meta.inactive;
        const color    = isActive ? Colors.primary : '#AAAAAA';

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tab}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.7}
          >
            <Ionicons name={iconName} size={24} color={color} />
            <Text style={[styles.label, isActive && styles.labelActive]}>{meta.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Static version (used inside Stack screens) ─────────────────────────────

const STATIC_TABS: Array<{ name: string; label: string; active: IoniconName; inactive: IoniconName }> = [
  { name: 'Home',         label: '홈',    active: 'home',          inactive: 'home-outline'          },
  { name: 'Calendar',     label: '캘린더', active: 'calendar',      inactive: 'calendar-outline'      },
  { name: 'Chat',         label: '채팅',  active: 'chatbubbles',   inactive: 'chatbubbles-outline'   },
  { name: 'Notification', label: '알림',  active: 'notifications', inactive: 'notifications-outline' },
  { name: 'Todo',         label: '메모',  active: 'checkbox',      inactive: 'checkbox-outline'      },
];

export function BottomTabBarStatic({ activeIndex }: { activeIndex: number }) {
  const navigation = useNavigation();
  const insets     = useSafeAreaInsets();

  const handlePress = (tabName: string) => {
    (navigation as any).navigate('EmployeeMain', { screen: tabName });
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {STATIC_TABS.map((tab, index) => {
        const isActive = index === activeIndex;
        const iconName = isActive ? tab.active : tab.inactive;
        const color    = isActive ? Colors.primary : '#AAAAAA';
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => handlePress(tab.name)}
            activeOpacity={0.7}
          >
            <Ionicons name={iconName} size={24} color={color} />
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
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
