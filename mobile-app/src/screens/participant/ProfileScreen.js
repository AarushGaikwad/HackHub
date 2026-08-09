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

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { colors, typography } = useTheme();

  return (
    <ScreenContainer>
      <Text style={typography.h1}>Profile</Text>

      <Card style={{ marginTop: spacing.lg }}>
        <View style={styles.headerRow}>
          <View style={[styles.avatar, { backgroundColor: colors.primaryMuted }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {(user?.name || '?').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={[typography.h3, { marginBottom: spacing.xs }]}>{user?.name}</Text>
            <Badge label={user?.role} />
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Text style={typography.caption}>Email</Text>
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
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 22, fontWeight: '700' },
  divider: { height: 1, marginVertical: spacing.md },
});
