import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, View, Pressable, Switch, StyleSheet, Alert } from 'react-native';
import {
  Mail,
  Briefcase,
  Award,
  ChevronRight,
  Bell,
  Edit3,
  Moon,
  Sun,
  ShieldCheck,
} from 'lucide-react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import StatCard from '../../components/StatCard';
import LoadingState from '../../components/LoadingState';
import * as judgeApi from '../../api/judgeApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function JudgeProfileScreen() {
  const { user, logout } = useAuth();
  const { colors, spacing, radius, typography, isDark, toggleTheme } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, radius, typography),
    [colors, spacing, radius, typography]
  );

  const [stats, setStats] = useState(null);
  const [assignedHackathons, setAssignedHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  const judgeId = user?.id || user?.userId;

  const load = useCallback(async () => {
    if (!judgeId) return;
    try {
      const [statsRes, hackathonsRes] = await Promise.all([
        judgeApi.getJudgeStats(judgeId).catch(() => null),
        judgeApi.getJudgeHackathons(judgeId).catch(() => []),
      ]);

      setStats({
        completed: statsRes?.evaluatedCount || statsRes?.completedEvaluations || 0,
        pending: statsRes?.pendingCount || statsRes?.pendingEvaluations || 0,
        hackathons: (hackathonsRes || []).length,
      });
      setAssignedHackathons(hackathonsRes || []);
    } finally {
      setLoading(false);
    }
  }, [judgeId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleComingSoon = (feature) => {
    Alert.alert(feature, "This isn't available yet — coming in a future update.");
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Profile</Text>

      {/* Header Info */}
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.name || '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ marginLeft: spacing.md, flex: 1 }}>
          <Text style={styles.name}>{user?.name}</Text>
          <Badge label={user?.role || 'JUDGE'} />
        </View>
      </View>

      {/* Evaluation Statistics */}
      {loading ? (
        <LoadingState label="Loading your activity..." />
      ) : (
        stats && (
          <View style={styles.statsRow}>
            <StatCard value={stats.completed} label="Evaluated" />
            <StatCard value={stats.pending} label="Pending" />
            <StatCard value={stats.hackathons} label="Hackathons" />
          </View>
        )
      )}

      {/* Account Details Section */}
      <Text style={styles.sectionLabel}>ACCOUNT</Text>
      <Card style={styles.listCard}>
        <View style={styles.listRow}>
          <Mail size={16} color={colors.textMuted} />
          <View style={{ marginLeft: spacing.sm }}>
            <Text style={styles.listLabel}>Email</Text>
            <Text style={styles.listValue}>{user?.email || 'N/A'}</Text>
          </View>
        </View>
        {user?.designation ? (
          <View style={[styles.listRow, styles.listRowBorder]}>
            <Briefcase size={16} color={colors.textMuted} />
            <View style={{ marginLeft: spacing.sm }}>
              <Text style={styles.listLabel}>Designation</Text>
              <Text style={styles.listValue}>{user.designation}</Text>
            </View>
          </View>
        ) : null}
        <View style={[styles.listRow, styles.listRowBorder]}>
          <ShieldCheck size={16} color={colors.textMuted} />
          <View style={{ marginLeft: spacing.sm }}>
            <Text style={styles.listLabel}>Judge ID</Text>
            <Text style={styles.listValue}>#{judgeId || 'N/A'}</Text>
          </View>
        </View>
      </Card>

      {/* Assigned Events Section */}
      {assignedHackathons.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>ASSIGNED HACKATHONS</Text>
          <Card style={styles.listCard}>
            {assignedHackathons.map((item, index) => (
              <View
                key={item.id || item.hackathonId || index}
                style={[styles.listRow, index > 0 && styles.listRowBorder]}
              >
                <Award size={16} color={colors.primary} />
                <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                  <Text style={styles.listValue}>
                    {item.hackathonTitle || item.title || `Hackathon #${item.hackathonId}`}
                  </Text>
                  <Text style={styles.listLabel}>Status: {item.status || 'ACTIVE'}</Text>
                </View>
              </View>
            ))}
          </Card>
        </>
      )}

      {/* Appearance Controls */}
      <Text style={styles.sectionLabel}>APPEARANCE</Text>
      <Card style={styles.listCard}>
        <View style={styles.listRow}>
          {isDark ? (
            <Moon size={16} color={colors.textSecondary} />
          ) : (
            <Sun size={16} color={colors.textSecondary} />
          )}
          <Text style={[styles.listValue, { flex: 1, marginLeft: spacing.sm }]}>
            Dark mode
          </Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#fff"
          />
        </View>
      </Card>

      {/* Profile Actions */}
      <Card style={styles.listCard}>
        <Pressable
          style={styles.listRow}
          onPress={() => handleComingSoon('Edit Profile')}
        >
          <Edit3 size={16} color={colors.textSecondary} />
          <Text style={[styles.listValue, { flex: 1, marginLeft: spacing.sm }]}>
            Edit profile
          </Text>
          <ChevronRight size={18} color={colors.textMuted} />
        </Pressable>
        <Pressable
          style={[styles.listRow, styles.listRowBorder]}
          onPress={() => handleComingSoon('Notification Settings')}
        >
          <Bell size={16} color={colors.textSecondary} />
          <Text style={[styles.listValue, { flex: 1, marginLeft: spacing.sm }]}>
            Notification settings
          </Text>
          <ChevronRight size={18} color={colors.textMuted} />
        </Pressable>
      </Card>

      {/* Sign Out Button */}
      <Button
        title="Log Out"
        variant="danger"
        onPress={logout}
        style={{ marginTop: spacing.md, marginBottom: spacing.lg }}
      />
    </ScreenContainer>
  );
}

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
    listRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    listRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
    listLabel: { ...typography.caption, marginBottom: 2 },
    listValue: { ...typography.body, fontSize: 14, fontWeight: '500' },
  });
}