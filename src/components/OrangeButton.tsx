import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface OrangeButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export default function OrangeButton({ title, onPress, disabled = false }: OrangeButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  disabled: {
    backgroundColor: Colors.inactive,
  },
  text: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
