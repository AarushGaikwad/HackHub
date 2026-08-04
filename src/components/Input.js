import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
} from 'react-native';

import { radius, spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

export default function Input({
  label,
  error,
  style,
  ...textInputProps
}) {
  const [focused, setFocused] = useState(false);

  const { colors, typography } = useTheme();

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text
          style={[
            typography.bodySecondary,
            {
              marginBottom: spacing.xs,
              fontWeight: '500',
            },
          ]}
        >
          {label}
        </Text>
      ) : null}

      <TextInput
        {...textInputProps}
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          {
            borderColor: colors.border,
            backgroundColor: colors.surface,
            color: colors.textPrimary,
          },
          focused && {
            borderColor: colors.primary,
          },
          error && {
            borderColor: colors.danger,
          },
          style,
        ]}
        onFocus={(e) => {
          setFocused(true);
          textInputProps.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          textInputProps.onBlur?.(e);
        }}
      />

      {error ? (
        <Text
          style={{
            color: colors.danger,
            fontSize: 12,
            marginTop: spacing.xs,
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },

  input: {
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 15,
  },
});