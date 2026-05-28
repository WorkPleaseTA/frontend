import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface DropDownProps {
  label: string;
  options: string[];
  value: string | null;
  onSelect: (value: string) => void;
}

export default function DropDown({ label, options, value, onSelect }: DropDownProps) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setOpen(!open)}
        activeOpacity={0.8}
      >
        <Text style={[styles.triggerText, !value && styles.placeholder]}>
          {value ?? label}
        </Text>
        <Text style={styles.arrow}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.list}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={styles.item}
              onPress={() => { onSelect(opt); setOpen(false); }}
              activeOpacity={0.7}
            >
              <Text style={styles.itemText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    zIndex: 10,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: Colors.background,
  },
  triggerText: {
    fontSize: 15,
    color: Colors.text,
  },
  placeholder: {
    color: Colors.inactive,
  },
  arrow: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  list: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.background,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  item: {
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemText: {
    fontSize: 15,
    color: Colors.text,
  },
});
