import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

export default function EmptyState({
  title = 'Nothing here yet',
  subtitle,
}) {
  const { typography } = useTheme();

  return (
    <View style={styles.container}>
      <Text
        style={[
          typography.h3,
          {
            textAlign: 'center',
          },
        ]}
      >
        {title}
      </Text>

      {subtitle ? (
        <Text
          style={[
            typography.bodySecondary,
            {
              textAlign: 'center',
              marginTop: spacing.xs,
            },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
});