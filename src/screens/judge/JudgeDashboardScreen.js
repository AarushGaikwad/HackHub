import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { ChevronRight, Github } from 'lucide-react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import * as judgeApi from '../../api/judgeApi';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography } from '../../constants/theme';

export default function JudgeDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [pending, setPending] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!user?.userId) return;
    setError(null);
    try {
      const [pendingData, statsData] = await Promise.all([
        judgeApi.getPendingSubmissions(user.userId),
        judgeApi.getJudgeStats(user.userId),
      ]);
      setPending(pendingData || []);
      setStats(statsData);
    } catch (err) {
      setError(err.message || 'Failed to load evaluations');
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
      <Text style={styles.title}>Hey {user?.name?.split(' ')[0]}</Text>

      {stats && (
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalEvaluated ?? '—'}</Text>
            <Text style={styles.statLabel}>Evaluated</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.averageScore ?? '—'}</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{pending.length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </Card>
        </View>
      )}

      <Text style={styles.sectionTitle}>Pending Evaluations</Text>

      {pending.length === 0 ? (
        <EmptyState title="All caught up!" subtitle="No pending evaluations." />
      ) : (
        pending.map((sub) => (
          <Pressable key={sub.id} onPress={() => navigation.navigate('EvaluateSubmission', { submissionId: sub.id })}>
            <Card style={styles.submissionCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.submissionTitle}>{sub.title}</Text>
                <Text style={styles.submissionMeta}>{sub.teamName}</Text>
                {sub.githubLink ? (
                  <View style={styles.linkRow}>
                    <Github size={13} color={colors.textMuted} />
                    <Text style={styles.linkText} numberOfLines={1}>{sub.githubLink}</Text>
                  </View>
                ) : null}
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </Card>
          </Pressable>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, marginBottom: spacing.lg },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  statValue: { ...typography.h2 },
  statLabel: { ...typography.caption, marginTop: spacing.xs },
  sectionTitle: { ...typography.h3, marginBottom: spacing.sm },
  submissionCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  submissionTitle: { ...typography.h3 },
  submissionMeta: { ...typography.bodySecondary, marginTop: 2 },
  linkRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, gap: 4 },
  linkText: { ...typography.caption, flex: 1 },
});