import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, typography } from '../constants/theme';

export default function EmptyState({ title = 'Nothing here yet', subtitle }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
  title: { ...typography.h3, textAlign: 'center' },
  subtitle: { ...typography.bodySecondary, textAlign: 'center', marginTop: spacing.xs },
});