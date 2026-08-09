import React, { useState } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

import { radius, spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

export default function Input({
  label,
  error,
  style,
  secureTextEntry,
  ...textInputProps
}) {
  const [focused, setFocused] = useState(false);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { colors, typography } = useTheme();


  const isPasswordField = !!secureTextEntry;

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

      <View style={styles.inputRow}>
        <TextInput
          {...textInputProps}
          secureTextEntry={isPasswordField && !isPasswordVisible}
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
            isPasswordField && { paddingRight: 44 },
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

        {isPasswordField ? (
          <Pressable
            onPress={() => setIsPasswordVisible((prev) => !prev)}
            hitSlop={10}
            style={styles.eyeButton}
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color={colors.textMuted} />
            ) : (
              <Eye size={20} color={colors.textMuted} />
            )}
          </Pressable>
        ) : null}
      </View>

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

  inputRow: {
    justifyContent: 'center',
  },

  input: {
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 15,
  },

  eyeButton: {
    position: 'absolute',
    right: spacing.md,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});