// Catches uncaught render errors anywhere below it in the tree and shows a
// recoverable screen instead of a white-screen crash. React error boundaries
// only catch render/lifecycle errors, not async errors inside event handlers
// (those are already handled per-screen via try/catch + ErrorState).
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from './Button';
import { colors, spacing, typography } from '../constants/theme';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Hook up a crash-reporting service here later (Sentry, etc).
    console.error('Unhandled render error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            The app hit an unexpected error. Try again — if it keeps happening, restart the app.
          </Text>
          <Button title="Try Again" onPress={this.handleReset} style={{ marginTop: spacing.lg, minWidth: 160 }} />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  title: { ...typography.h2, textAlign: 'center' },
  message: { ...typography.bodySecondary, textAlign: 'center', marginTop: spacing.sm },
});