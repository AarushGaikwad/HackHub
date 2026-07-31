import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../constants/theme';

export default function ScreenContainer({ children, scroll = true, style }) {
  const Wrapper = scroll ? ScrollView : View;
  const wrapperProps = scroll
    ? { contentContainerStyle: [styles.scrollContent, style], keyboardShouldPersistTaps: 'handled' }
    : { style: [styles.content, style] };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* iOS needs an explicit offset because the keyboard otherwise sits on
          top of whatever input was focused, hiding it completely. Android
          handles this natively via the 'adjustResize' windowSoftInputMode
          set through Expo, so no offset needed there. */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <Wrapper {...wrapperProps}>{children}</Wrapper>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 },
  content: { flex: 1, padding: spacing.lg },
});