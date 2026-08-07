import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import { ChevronRight, UserCircle, Clock } from 'lucide-react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import * as judgeApi from '../../api/judgeApi';
import { useAuth } from '../../context/AuthContext';
import { getRelativeTimeAgo } from '../../utils/dateUtils';
import { colors, spacing, typography } from '../../constants/theme';

// A judge picks a hackathon here before viewing its leaderboard.
export default function JudgeHackathonsScreen({ navigation }) {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!user?.userId) return;
    setError(null);
    try {
      const data = await judgeApi.getJudgeHackathons(user.userId);
      // getJudgeHackathons returns JudgeAssignmentResponseDto — status here
      // is the ASSIGNMENT's status (ACTIVE/INACTIVE), not the hackathon's
      // own lifecycle status. removeJudge soft-deletes to INACTIVE rather
      // than deleting the row, so filter those out — a judge shouldn't see
      // hackathons they've been removed from.
      const active = (data || []).filter((h) => (h.status || 'ACTIVE').toUpperCase() !== 'INACTIVE');
      setHackathons(active);
    } catch (err) {
      setError(err.message || 'Failed to load your assigned hackathons');
    }
  }, [user?.userId]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  if (loading) return <ScreenContainer scroll={false}><LoadingState /></ScreenContainer>;
  if (error) return <ScreenContainer scroll={false}><ErrorState message={error} onRetry={load} /></ScreenContainer>;

  return (
    <ScreenContainer>
      <Text style={styles.title}>Assigned Hackathons</Text>

      {hackathons.length === 0 ? (
        <EmptyState title="Not assigned yet" subtitle="An organizer will assign you to a hackathon to judge." />
      ) : (
        hackathons.map((h) => {
          const timeAgo = getRelativeTimeAgo(h.assignedAt);
          return (
            <Pressable
              key={h.id ?? h.hackathonId}
              onPress={() =>
                navigation.navigate('Leaderboard', {
                  hackathonId: h.hackathonId,
                  hackathonTitle: h.hackathonTitle,
                })
              }
            >
              <Card style={styles.card}>
                <Text style={styles.name}>{h.hackathonTitle}</Text>
                {h.assignedByName ? (
                  <View style={styles.metaRow}>
                    <UserCircle size={14} color={colors.textMuted} />
                    <Text style={styles.metaText}>Assigned by {h.assignedByName}</Text>
                  </View>
                ) : null}
                {timeAgo ? (
                  <View style={styles.metaRow}>
                    <Clock size={14} color={colors.textMuted} />
                    <Text style={styles.metaTextMuted}>{timeAgo}</Text>
                  </View>
                ) : null}
                <View style={styles.footerRow}>
                  <Text style={styles.viewText}>View leaderboard</Text>
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
  title: { ...typography.h1, marginBottom: spacing.lg },
  card: { marginBottom: spacing.md },
  name: { ...typography.h3, marginBottom: spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  metaText: { ...typography.caption, color: colors.textSecondary },
  metaTextMuted: { ...typography.caption, color: colors.textMuted },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  viewText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
});