import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { radius, spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

export default function Badge({ label }) {
  const { colors } = useTheme();

  const VARIANTS = {
    ACTIVE: {
      bg: colors.successMuted,
      fg: colors.success,
    },
    DRAFT: {
      bg: colors.warningMuted,
      fg: colors.warning,
    },
    ENDED: {
      bg: colors.dangerMuted,
      fg: colors.danger,
    },
    PENDING: {
      bg: colors.warningMuted,
      fg: colors.warning,
    },
    APPROVED: {
      bg: colors.successMuted,
      fg: colors.success,
    },
    REJECTED: {
      bg: colors.dangerMuted,
      fg: colors.danger,
    },
    DEFAULT: {
      bg: colors.primaryMuted,
      fg: colors.primary,
    },
  };

  const variant =
    VARIANTS[label?.toUpperCase()] || VARIANTS.DEFAULT;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variant.bg,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: variant.fg,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});