// Temporary placeholder — replaced by the real Judge navigator/screens
// in the next build phase. Exists only so the auth flow is testable now.
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { spacing, typography } from '../../constants/theme';

export default function PlaceholderHomeScreen() {
  const { user, logout } = useAuth();
  return (
    <ScreenContainer>
      <Text style={styles.title}>Welcome, {user?.name}</Text>
      <Card style={{ marginTop: spacing.lg }}>
        <Text style={styles.body}>Role: {user?.role}</Text>
        <Text style={styles.body}>Status: {user?.status}</Text>
        <Text style={styles.hint}>Judge screens land here in the next phase.</Text>
      </Card>
      <Button title="Log Out" variant="danger" onPress={logout} style={{ marginTop: spacing.xl }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1 },
  body: { ...typography.body, marginBottom: spacing.xs },
  hint: { ...typography.caption, marginTop: spacing.sm },
});