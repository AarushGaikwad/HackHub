import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { spacing, typography } from '../../constants/theme';

export default function OrganizerProfileScreen() {
  const { user, logout } = useAuth();
  return (
    <ScreenContainer>
      <Text style={styles.title}>Profile</Text>
      <Card style={{ marginTop: spacing.lg }}>
        <View style={styles.row}>
          <Text style={styles.name}>{user?.name}</Text>
          <Badge label={user?.status} />
        </View>
        <Text style={styles.label}>Role</Text>
        <Text style={styles.value}>{user?.role}</Text>
        <Text style={[styles.label, { marginTop: spacing.sm }]}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>
      </Card>
      <Button title="Log Out" variant="danger" onPress={logout} style={{ marginTop: spacing.xl }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  name: { ...typography.h3 },
  label: { ...typography.caption },
  value: { ...typography.body, marginTop: 2 },
});