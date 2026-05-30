import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightElement?: React.ReactNode;
  titleStyle?: TextStyle;
}

export default function Header({ title, showBack = true, onBackPress, rightElement, titleStyle }: HeaderProps) {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {showBack && (
          <TouchableOpacity onPress={handleBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.back}>{'←'}</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={[styles.title, titleStyle]}>{title}</Text>
      <View style={styles.side}>{rightElement ?? null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 16,
  },
  side: {
    width: 40,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
  },
  back: {
    fontSize: 22,
    color: Colors.text,
  },
});
