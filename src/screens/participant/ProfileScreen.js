import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography } from '../../constants/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  return (
    <ScreenContainer>
      <Text style={styles.title}>Profile</Text>
      <Card style={{ marginTop: spacing.lg }}>
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.name || '?').charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={styles.name}>{user?.name}</Text>
            <Badge label={user?.role} />
          </View>
        </View>
        <View style={styles.divider} />
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>
      </Card>
      <Button title="Log Out" variant="danger" onPress={logout} style={{ marginTop: spacing.xl }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.primary, fontSize: 22, fontWeight: '700' },
  name: { ...typography.h3, marginBottom: spacing.xs },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  label: { ...typography.caption },
  value: { ...typography.body, marginTop: 2 },
});