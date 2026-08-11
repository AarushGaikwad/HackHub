import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

export default function ScreenContainer({
  children,
  scroll = true,
  style,
}) {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.bg }]}
      edges={['top', 'bottom']}
    >
      {scroll ? (
        <KeyboardAwareScrollView
          contentContainerStyle={[styles.scrollContent, style]}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid
          extraScrollHeight={20}
          keyboardOpeningTime={0}
        >
          {children}
        </KeyboardAwareScrollView>
      ) : (
        <View style={[styles.content, style]}>{children}</View>
      )}
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