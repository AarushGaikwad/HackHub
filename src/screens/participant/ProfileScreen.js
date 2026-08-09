import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, View, Pressable, Switch, StyleSheet, Alert } from 'react-native';
import { Mail, School, ChevronRight, Bell, Edit3, Moon, Sun } from 'lucide-react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import StatCard from '../../components/StatCard';
import LoadingState from '../../components/LoadingState';
import * as participantApi from '../../api/participantApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { colors, spacing, radius, typography, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, radius, typography), [colors, spacing, radius, typography]);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.userId) return;
    try {
      const [hackathons, teams, certificates] = await Promise.all([
        participantApi.getUserParticipatedHackathons(user.userId).catch(() => []),
        participantApi.getTeamsByUser(user.userId).catch(() => []),
        participantApi.getMyCertificates().catch(() => []),
      ]);
      setStats({
        hackathons: (hackathons || []).length,
        teams: (teams || []).length,
        certificates: (certificates || []).length,
      });
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleComingSoon = (feature) => {
    Alert.alert(feature, "This isn't available yet — coming in a future update.");
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.name || '?').charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ marginLeft: spacing.md }}>
          <Text style={styles.name}>{user?.name}</Text>
          <Badge label={user?.role} />
        </View>
      </View>

      {loading ? (
        <LoadingState label="Loading your activity..." />
      ) : (
        stats && (
          <View style={styles.statsRow}>
            <StatCard value={stats.hackathons} label="Hackathons" />
            <StatCard value={stats.teams} label="Team" />
            <StatCard value={stats.certificates} label="Certificates" />
          </View>
        )
      )}

      <Text style={styles.sectionLabel}>ACCOUNT</Text>
      <Card style={styles.listCard}>
        <View style={styles.listRow}>
          <Mail size={16} color={colors.textMuted} />
          <View style={{ marginLeft: spacing.sm }}>
            <Text style={styles.listLabel}>Email</Text>
            <Text style={styles.listValue}>{user?.email}</Text>
          </View>
        </View>
        {user?.collegeName ? (
          <View style={[styles.listRow, styles.listRowBorder]}>
            <School size={16} color={colors.textMuted} />
            <View style={{ marginLeft: spacing.sm }}>
              <Text style={styles.listLabel}>College</Text>
              <Text style={styles.listValue}>{user.collegeName}</Text>
            </View>
          </View>
        ) : null}
      </Card>

      <Text style={styles.sectionLabel}>APPEARANCE</Text>
      <Card style={styles.listCard}>
        <View style={styles.listRow}>
          {isDark ? <Moon size={16} color={colors.textSecondary} /> : <Sun size={16} color={colors.textSecondary} />}
          <Text style={[styles.listValue, { flex: 1, marginLeft: spacing.sm }]}>Dark mode</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#fff"
          />
        </View>
      </Card>

      <Card style={styles.listCard}>
        <Pressable style={styles.listRow} onPress={() => handleComingSoon('Edit Profile')}>
          <Edit3 size={16} color={colors.textSecondary} />
          <Text style={[styles.listValue, { flex: 1, marginLeft: spacing.sm }]}>Edit profile</Text>
          <ChevronRight size={18} color={colors.textMuted} />
        </Pressable>
        <Pressable
          style={[styles.listRow, styles.listRowBorder]}
          onPress={() => handleComingSoon('Notification Settings')}
        >
          <Bell size={16} color={colors.textSecondary} />
          <Text style={[styles.listValue, { flex: 1, marginLeft: spacing.sm }]}>Notification settings</Text>
          <ChevronRight size={18} color={colors.textMuted} />
        </Pressable>
      </Card>

      <Button title="Log Out" variant="danger" onPress={logout} style={{ marginTop: spacing.md }} />
    </ScreenContainer>
  );
}

// Styles are a function of the active palette, recomputed (via useMemo)
// whenever colors change — NOT a module-level StyleSheet.create, which
// would freeze at whatever theme was active on first import and never
// update when the user toggles dark/light.
function createStyles(colors, spacing, radius, typography) {
  return StyleSheet.create({
    title: { ...typography.h1, marginBottom: spacing.lg },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: radius.full,
      backgroundColor: colors.primaryMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { color: colors.primary, fontSize: 24, fontWeight: '700' },
    name: { ...typography.h2, fontSize: 18 },
    statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
    sectionLabel: { ...typography.caption, marginBottom: spacing.sm },
    listCard: { padding: 0, marginBottom: spacing.lg, overflow: 'hidden' },
    listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
    listRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
    listLabel: { ...typography.caption, marginBottom: 2 },
    listValue: { ...typography.body, fontSize: 14, fontWeight: '500' },
  });
}