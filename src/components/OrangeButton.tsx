import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../constants/colors';

interface OrangeButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  secondary?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function OrangeButton({ title, onPress, disabled = false, loading = false, secondary = false, style, textStyle }: OrangeButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, secondary && styles.secondary, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={Colors.white} />
      ) : (
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  secondary: {
    backgroundColor: Colors.inactive,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
