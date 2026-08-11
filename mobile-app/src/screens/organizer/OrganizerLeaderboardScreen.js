import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, StyleSheet, Alert } from 'react-native';
import { Trophy, Medal, Award } from 'lucide-react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import StatCard from '../../components/StatCard';
import Button from '../../components/Button';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import * as organizerApi from '../../api/organizerApi';
import { colors, radius, spacing, typography } from '../../constants/theme';

const PODIUM_COLORS = { 1: '#F5B94D', 2: '#C7CCD6', 3: '#C97B4A' };
const PODIUM_HEIGHTS = { 1: 72, 2: 50, 3: 34 };
// Rendered left-to-right as 2nd, 1st, 3rd — classic podium layout.
const PODIUM_ORDER = [2, 1, 3];

export default function OrganizerLeaderboardScreen({ route }) {
  const { hackathonId, hackathonTitle } = route.params;
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await organizerApi.getLeaderboard(hackathonId);
      setEntries(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load leaderboard');
    }
  }, [hackathonId]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const handleGenerateCertificates = async () => {
    setGenerating(true);
    try {
      await organizerApi.generateCertificates(hackathonId);
      Alert.alert('Success', 'Certificates generated for all participants.');
    } catch (err) {
      Alert.alert('Generation failed', err.message || 'Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <ScreenContainer scroll={false}><LoadingState /></ScreenContainer>;
  if (error) return <ScreenContainer scroll={false}><ErrorState message={error} onRetry={load} /></ScreenContainer>;

  if (entries.length === 0) {
    return (
      <ScreenContainer>
        <Text style={styles.title}>{hackathonTitle || 'Leaderboard'}</Text>
        <EmptyState title="No scores yet" subtitle="The leaderboard fills in as evaluations are submitted." />
      </ScreenContainer>
    );
  }

  const scored = entries.map((e, i) => ({
    ...e,
    rank: e.rank ?? i + 1,
    score: e.averageScore ?? e.score ?? 0,
  }));
  const podium = scored.filter((e) => e.rank <= 3);
  const rest = scored.filter((e) => e.rank > 3);

  const avgScore =
    scored.length > 0
      ? (scored.reduce((sum, e) => sum + Number(e.score || 0), 0) / scored.length).toFixed(1)
      : '—';

  return (
    <ScreenContainer>
      <Text style={styles.title}>{hackathonTitle || 'Leaderboard'}</Text>
      <Text style={styles.subtitle}>Leaderboard</Text>

      <View style={styles.statsRow}>
        <StatCard value={scored.length} label="Teams scored" />
        <StatCard value={avgScore} label="Avg score" />
      </View>

      {podium.length > 0 && (
        <View style={styles.podiumRow}>
          {PODIUM_ORDER.map((rank) => {
            const entry = podium.find((e) => e.rank === rank);
            if (!entry) return <View key={rank} style={{ flex: 1 }} />;
            const color = PODIUM_COLORS[rank];
            const isFirst = rank === 1;
            return (
              <View key={rank} style={styles.podiumColumn}>
                <View style={[styles.podiumBadge, { borderColor: color, width: isFirst ? 40 : 34, height: isFirst ? 40 : 34 }]}>
                  {rank === 1 ? (
                    <Trophy size={isFirst ? 18 : 16} color={color} />
                  ) : (
                    <Medal size={16} color={color} />
                  )}
                </View>
                <Text style={[styles.podiumName, isFirst && styles.podiumNameFirst]} numberOfLines={1}>
                  {entry.teamName}
                </Text>
                <Text style={styles.podiumScore}>{entry.score}</Text>
                <View style={[styles.podiumBar, { height: PODIUM_HEIGHTS[rank], backgroundColor: colors.surface }]} />
              </View>
            );
          })}
        </View>
      )}

      {rest.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>FULL RANKINGS</Text>
          {rest.map((entry) => (
            <Card key={entry.teamId ?? entry.id ?? entry.rank} style={styles.rankRow}>
              <Text style={styles.rankNumber}>{entry.rank}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.rankTeamName}>{entry.teamName}</Text>
                {entry.projectTitle ? <Text style={styles.rankProject}>{entry.projectTitle}</Text> : null}
              </View>
              <Text style={styles.rankScore}>{entry.score}</Text>
            </Card>
          ))}
        </>
      )}

      <Button
        title="Generate Certificates"
        icon={<Award size={16} color="#fff" style={{ marginRight: spacing.xs }} />}
        loading={generating}
        onPress={handleGenerateCertificates}
        style={{ marginTop: spacing.lg }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1 },
  subtitle: { ...typography.caption, marginTop: 2, marginBottom: spacing.lg },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  sectionLabel: { ...typography.caption, marginBottom: spacing.sm, marginTop: spacing.sm },

  podiumRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs, marginBottom: spacing.lg },
  podiumColumn: { flex: 1, alignItems: 'center' },
  podiumBadge: {
    borderRadius: radius.full,
    borderWidth: 2,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  podiumName: { ...typography.caption, fontWeight: '600', color: colors.textPrimary, textAlign: 'center' },
  podiumNameFirst: { fontSize: 13, fontWeight: '700' },
  podiumScore: { ...typography.caption, marginTop: 2 },
  podiumBar: { width: '100%', borderTopLeftRadius: radius.sm, borderTopRightRadius: radius.sm, marginTop: spacing.xs },

  rankRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, paddingVertical: spacing.sm },
  rankNumber: { ...typography.bodySecondary, width: 24, fontWeight: '600' },
  rankTeamName: { ...typography.body, fontWeight: '600' },
  rankProject: { ...typography.caption, marginTop: 2 },
  rankScore: { ...typography.h3, color: colors.primary },
});