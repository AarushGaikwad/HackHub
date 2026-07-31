import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../constants/theme';

export default function LoadingState({ label = 'Loading...' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl },
  label: { color: colors.textSecondary, marginTop: spacing.md, fontSize: 14 },
});