import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../constants/theme';

// Compact metric tile — value on top, label below.
// Use in a flexDirection:'row' wrapper with gap, 2-4 across.
export default function StatCard({ value, label, style }) {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.value} numberOfLines={1}>{value ?? '—'}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  value: { ...typography.h2 },
  label: { ...typography.caption, marginTop: spacing.xs },
});