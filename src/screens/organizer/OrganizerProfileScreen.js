import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import ThemeToggle from '../../components/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../constants/theme';

export default function OrganizerProfileScreen() {
  const { user, logout } = useAuth();
  const { typography } = useTheme();

  return (
    <ScreenContainer>
      <Text style={typography.h1}>Profile</Text>

      <Card style={{ marginTop: spacing.lg }}>
        <View style={styles.row}>
          <Text style={typography.h3}>{user?.name}</Text>
          <Badge label={user?.status} />
        </View>
        <Text style={typography.caption}>Role</Text>
        <Text style={[typography.body, { marginTop: 2 }]}>{user?.role}</Text>
        <Text style={[typography.caption, { marginTop: spacing.sm }]}>Email</Text>
        <Text style={[typography.body, { marginTop: 2 }]}>{user?.email}</Text>
      </Card>

      <Card style={{ marginTop: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={typography.body}>Appearance</Text>
        <ThemeToggle />
      </Card>

      <Button title="Log Out" variant="danger" onPress={logout} style={{ marginTop: spacing.xl }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
});