import React from 'react';
import { Text } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import ThemeToggle from '../../components/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../constants/theme';

export default function JudgeProfileScreen() {
  const { user, logout } = useAuth();
  const { typography } = useTheme();

  return (
    <ScreenContainer>
      <Text style={typography.h1}>Profile</Text>

      <Card style={{ marginTop: spacing.lg }}>
        <Text style={typography.h3}>{user?.name}</Text>
        <Badge label={user?.role} />
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