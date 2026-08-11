import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from './Button';
import { spacing, typography } from '../constants/theme';

export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Couldn't load this</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? <Button title="Try again" variant="secondary" onPress={onRetry} style={styles.retryBtn} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
  title: { ...typography.h3, textAlign: 'center' },
  message: { ...typography.bodySecondary, textAlign: 'center', marginTop: spacing.xs },
  retryBtn: { marginTop: spacing.lg, minWidth: 140 },
});