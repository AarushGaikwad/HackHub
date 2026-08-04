import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Clock, ChevronRight, Compass, Award } from 'lucide-react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import StatCard from '../../components/StatCard';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import * as participantApi from '../../api/participantApi';
import { useAuth } from '../../context/AuthContext';
import { colors, radius, spacing, typography } from '../../constants/theme';

const URGENT_DAYS = 3;   // used for the "Due soon" stat count
const DEADLINE_WINDOW = 7; // only surface the deadline banner within this window

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}

export default function ParticipantHomeScreen({ navigation }) {
  const { user } = useAuth();
  const [registered, setRegistered] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!user?.userId) return;
    setError(null);
    try {
      const [registeredData, teamsData] = await Promise.all([
        participantApi.getUserParticipatedHackathons(user.userId),
        participantApi.getTeamsByUser(user.userId),
      ]);

      const teamsList = teamsData || [];
      // Only fetch member count for the first team — that's the only one
      // rendered on this screen, no need to fan out for the rest.
      if (teamsList[0]) {
        try {
          const members = await participantApi.getTeamMembers(teamsList[0].id);
          teamsList[0] = { ...teamsList[0], members: members || [] };
        } catch {
          // Fine to show the team card without a member count.
        }
      }

      setRegistered(registeredData || []);
      setTeams(teamsList);
    } catch (err) {
      setError(err.message || 'Failed to load your dashboard');
    }
  }, [user?.userId]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  if (loading) return <ScreenContainer scroll={false}><LoadingState /></ScreenContainer>;
  if (error) return <ScreenContainer scroll={false}><ErrorState message={error} onRetry={load} /></ScreenContainer>;

  // "Due soon" is a proxy based on registered hackathons ending within
  // URGENT_DAYS — there's no direct submission-deadline endpoint yet, so
  // this uses the hackathon's own endDate as the closest available signal.
  const upcoming = registered
    .map((h) => ({ ...h, daysLeft: daysUntil(h.endDate) }))
    .filter((h) => h.daysLeft !== null && h.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const dueSoonCount = upcoming.filter((h) => h.daysLeft <= URGENT_DAYS).length;
  const nextDeadline = upcoming.find((h) => h.daysLeft <= DEADLINE_WINDOW);
  const firstTeam = teams[0];

  return (
    <ScreenContainer>
      <Text style={styles.greeting}>Welcome back</Text>
      <Text style={styles.name}>{user?.name?.split(' ')[0] || 'there'}</Text>

      <View style={styles.statsRow}>
        <StatCard value={registered.length} label="Registered" />
        <StatCard value={teams.length} label="Active team" />
        <StatCard
          value={dueSoonCount}
          label="Due soon"
          style={dueSoonCount > 0 ? styles.dueSoonCard : undefined}
        />
      </View>

      {nextDeadline && (
        <Card style={styles.deadlineCard}>
          <View style={styles.deadlineHeader}>
            <Clock size={16} color={colors.warning} />
            <Text style={styles.deadlineLabel}>
              {nextDeadline.daysLeft === 0
                ? 'Ends today'
                : nextDeadline.daysLeft === 1
                ? 'Ends tomorrow'
                : `Ends in ${nextDeadline.daysLeft} days`}
            </Text>
          </View>
          <Text style={styles.deadlineTitle}>{nextDeadline.title}</Text>
        </Card>
      )}

      <Text style={styles.sectionLabel}>MY TEAM</Text>
      {firstTeam ? (
        <Pressable onPress={() => navigation.navigate('MyTeam', { screen: 'MyTeamTab' })}>
          <Card style={styles.teamCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.teamName}>{firstTeam.name}</Text>
              <Text style={styles.teamMeta}>
                {firstTeam.members?.length ?? firstTeam.membersCount ?? '—'} members
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </Card>
        </Pressable>
      ) : (
        <Pressable onPress={() => navigation.navigate('MyTeam', { screen: 'MyTeamTab' })}>
          <Card style={styles.teamCard}>
            <Text style={styles.teamMeta}>No team yet — tap to create or join one.</Text>
          </Card>
        </Pressable>
      )}

      <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
      <View style={styles.actionsRow}>
        <Pressable style={styles.actionTile} onPress={() => navigation.navigate('Browse')}>
          <Compass size={20} color={colors.textPrimary} />
          <Text style={styles.actionText}>Browse</Text>
        </Pressable>
        <Pressable style={styles.actionTile} onPress={() => navigation.navigate('Certificates')}>
          <Award size={20} color={colors.textPrimary} />
          <Text style={styles.actionText}>Certificates</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  greeting: { ...typography.bodySecondary },
  name: { ...typography.h1, marginBottom: spacing.lg },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  dueSoonCard: { borderColor: colors.warning },
  deadlineCard: { backgroundColor: colors.warningMuted, borderColor: colors.warning, marginBottom: spacing.lg },
  deadlineHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 4 },
  deadlineLabel: { ...typography.caption, color: colors.warning, fontWeight: '700' },
  deadlineTitle: { ...typography.h3, fontSize: 15 },
  sectionLabel: { ...typography.caption, marginBottom: spacing.sm },
  teamCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  teamName: { ...typography.h3, fontSize: 15 },
  teamMeta: { ...typography.bodySecondary, marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  actionTile: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  actionText: { ...typography.caption, color: colors.textPrimary, fontWeight: '600' },
});