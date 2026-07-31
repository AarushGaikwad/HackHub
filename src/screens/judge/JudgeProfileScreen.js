import React from 'react';
import { Text, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { spacing, typography } from '../../constants/theme';

export default function JudgeProfileScreen() {
  const { user, logout } = useAuth();
  return (
    <ScreenContainer>
      <Text style={styles.title}>Profile</Text>
      <Card style={{ marginTop: spacing.lg }}>
        <Text style={styles.name}>{user?.name}</Text>
        <Badge label={user?.role} />
        <Text style={[styles.label, { marginTop: spacing.sm }]}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>
      </Card>
      <Button title="Log Out" variant="danger" onPress={logout} style={{ marginTop: spacing.xl }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1 },
  name: { ...typography.h3, marginBottom: spacing.xs },
  label: { ...typography.caption },
  value: { ...typography.body, marginTop: 2 },
});