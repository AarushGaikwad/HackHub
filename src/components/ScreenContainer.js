import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

export default function ScreenContainer({
  children,
  scroll = true,
  style,
}) {
  const { colors } = useTheme();

  const Wrapper = scroll ? ScrollView : View;

  const wrapperProps = scroll
    ? {
        contentContainerStyle: [styles.scrollContent, style],
        keyboardShouldPersistTaps: 'handled',
      }
    : {
        style: [styles.content, style],
      };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.bg }]}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <Wrapper {...wrapperProps}>
          {children}
        </Wrapper>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },

  content: {
    flex: 1,
    padding: spacing.lg,
  },
});