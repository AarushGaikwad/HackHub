import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../constants/theme';

function formatDate(date) {
  if (!date) return 'Select date';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// Styled to match Input.js visually, but renders as a Pressable since the
// actual date selection happens in a native picker, not a text field.
export default function DateField({ label, value, onPress, error, style }) {
  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.field, !!error && styles.fieldError, pressed && styles.fieldPressed]}
      >
        <Calendar size={16} color={colors.textSecondary} />
        <Text style={styles.value}>{formatDate(value)}</Text>
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  label: { ...typography.bodySecondary, marginBottom: spacing.xs, fontWeight: '500' },
  field: {
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  fieldPressed: { borderColor: colors.primary },
  fieldError: { borderColor: colors.danger },
  value: { ...typography.body, fontSize: 14 },
  errorText: { color: colors.danger, fontSize: 12, marginTop: spacing.xs },
});