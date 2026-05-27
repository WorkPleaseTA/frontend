import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface DropDownProps {
  placeholder: string;
  options: string[];
  value: string;
  onSelect: (value: string) => void;
}

export default function DropDown({ placeholder, options, value, onSelect }: DropDownProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (item: string) => {
    onSelect(item);
    setOpen(false);
  };

  return (
    <View style={[styles.container, open && styles.containerOpen]}>
      {/* 트리거 */}
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setOpen((prev) => !prev)}
        activeOpacity={0.9}
      >
        <Text style={[styles.triggerText, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      {/* 옵션 목록 */}
      {open &&
        options.map((item) => {
          const selected = item === value;
          return (
            <TouchableOpacity
              key={item}
              style={[styles.option, selected && styles.optionSelected]}
              onPress={() => handleSelect(item)}
              activeOpacity={0.8}
            >
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  containerOpen: {
    // 열렸을 때 그림자로 목록 구분
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  trigger: {
    height: 58,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  triggerText: {
    fontSize: 14,
    color: '#1E1E1E',
  },
  placeholder: {
    color: '#9C9C9C',
  },
  arrow: {
    fontSize: 10,
    color: '#9C9C9C',
  },
  option: {
    height: 58,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  optionSelected: {
    backgroundColor: '#FED4AE',
  },
  optionText: {
    fontSize: 14,
    color: '#1E1E1E',
  },
  optionTextSelected: {
    color: '#FF7800',
  },
});
