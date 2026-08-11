import React from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import { radius, spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon = null,
  style,
}) {
  const { colors } = useTheme();

  const isDisabled = disabled || loading;

  const variantStyles = {
    primary: {
      backgroundColor: colors.primary,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
    },
    danger: {
      backgroundColor: colors.danger,
    },
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' ? colors.primary : '#FFFFFF'}
        />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text
            style={[
              styles.text,
              variant === 'secondary' && { color: colors.primary },
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  text: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  disabled: {
    opacity: 0.5,
  },

  pressed: {
    opacity: 0.85,
  },
});