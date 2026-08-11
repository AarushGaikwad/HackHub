import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Sun, Moon } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme, colors, radius } = useTheme();

  return (
    <Pressable
      onPress={toggleTheme}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.full,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      {isDark ? <Sun size={20} color={colors.primary} /> : <Moon size={20} color={colors.primary} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});