import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import { Users, ChevronRight } from 'lucide-react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import StatCard from '../../components/StatCard';
import Button from '../../components/Button';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import * as organizerApi from '../../api/organizerApi';
import { useAuth } from '../../context/AuthContext';
import { getHackathonTiming } from '../../utils/dateUtils';
import { getStatusLabel } from '../../constants/statusLabels';
import { colors, spacing, typography } from '../../constants/theme';

export default function OrganizerDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!user?.userId) return;
    setError(null);
    try {
      const data = await organizerApi.getHackathonsByOrganizer(user.userId);
      setHackathons(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load your hackathons');
    }
  }, [user?.userId]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  if (loading) return <ScreenContainer scroll={false}><LoadingState /></ScreenContainer>;
  if (error) return <ScreenContainer scroll={false}><ErrorState message={error} onRetry={load} /></ScreenContainer>;

  const activeCount = hackathons.filter((h) => h.status?.toUpperCase() === 'ACTIVE').length;
  const upcomingCount = hackathons.filter((h) => h.status?.toUpperCase() === 'DRAFT').length;

  return (
    <ScreenContainer>
      <Text style={styles.greeting}>Welcome back</Text>
      <Text style={styles.name}>{user?.name?.split(' ')[0] || 'there'}</Text>

      <View style={styles.statsRow}>
        <StatCard value={hackathons.length} label="Total" />
        <StatCard value={activeCount} label="Active" />
        <StatCard value={upcomingCount} label="Upcoming" />
      </View>

      <Button
        title="Create Hackathon"
        onPress={() => navigation.navigate('CreateHackathon')}
        style={{ marginBottom: spacing.lg }}
      />

      <Text style={styles.sectionLabel}>MY HACKATHONS</Text>

      {hackathons.length === 0 ? (
        <EmptyState title="No hackathons yet" subtitle="Create your first hackathon to get started." />
      ) : (
        hackathons.map((h) => {
          const timing = getHackathonTiming(h.startDate, h.endDate);
          // Team count only renders if the backend already includes it on
          // this DTO (e.g. registeredTeamsCount) — deliberately not fetching
          // it per-hackathon here to avoid an N+1 request per card.
          const teamCount = h.registeredTeamsCount ?? h.teamsCount ?? null;

          return (
            <Pressable key={h.id} onPress={() => navigation.navigate('ManageHackathon', { hackathonId: h.id })}>
              <Card style={styles.card}>
                <View style={styles.headerRow}>
                  <Text style={styles.title} numberOfLines={1}>{h.title}</Text>
                  <Badge label={h.status} displayLabel={getStatusLabel(h.status)} />
                </View>
                {(h.startDate || h.endDate) && (
                  <Text style={styles.dates}>{h.startDate} → {h.endDate}</Text>
                )}
                <View style={styles.footerRow}>
                  {teamCount !== null ? (
                    <View style={styles.teamsRow}>
                      <Users size={13} color={colors.textSecondary} />
                      <Text style={styles.teamsText}>{teamCount} teams registered</Text>
                    </View>
                  ) : timing ? (
                    <Text style={styles.timingText}>{timing}</Text>
                  ) : (
                    <Text style={styles.timingText}>Manage hackathon</Text>
                  )}
                  <ChevronRight size={18} color={colors.textMuted} />
                </View>
              </Card>
            </Pressable>
          );
        })
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  greeting: { ...typography.bodySecondary },
  name: { ...typography.h1, marginBottom: spacing.lg },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  sectionLabel: { ...typography.caption, marginBottom: spacing.sm },
  card: { marginBottom: spacing.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typography.h3, flex: 1, marginRight: spacing.sm },
  dates: { ...typography.caption, marginTop: spacing.xs },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  teamsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  teamsText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  timingText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
});