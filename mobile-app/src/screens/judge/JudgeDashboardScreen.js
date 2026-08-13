import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { ChevronRight, Github, Trophy } from 'lucide-react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import StatCard from '../../components/StatCard';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import * as judgeApi from '../../api/judgeApi';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography } from '../../constants/theme';

export default function JudgeDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [pending, setPending] = useState([]);
  const [evaluated, setEvaluated] = useState([]);
  const [stats, setStats] = useState(null);
  const [hackathonCount, setHackathonCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!user?.userId) return;
    setError(null);
    try {
      const [pendingData, evaluatedData, statsData, hackathonsData] = await Promise.all([
        judgeApi.getPendingSubmissions(user.userId),
        judgeApi.getJudgeEvaluations(user.userId).catch(() => []),
        judgeApi.getJudgeStats(user.userId),
        judgeApi.getJudgeHackathons(user.userId).catch(() => []),
      ]);
      setPending(pendingData || []);
      setEvaluated(evaluatedData || []);
      setStats(statsData);
      setHackathonCount((hackathonsData || []).length);
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
          <StatCard value={stats.totalEvaluated ?? '—'} label="Evaluated" />
          <StatCard value={stats.averageScore ?? '—'} label="Avg score" />
          <StatCard value={pending.length} label="Pending" />
        </View>
      )}

      {hackathonCount !== null && (
        <Pressable onPress={() => navigation.navigate('Hackathons')}>
          <Card style={styles.hackathonSummaryCard}>
            <View style={styles.hackathonSummaryRow}>
              <Trophy size={20} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text style={styles.hackathonSummaryTitle}>
                  {hackathonCount} hackathon{hackathonCount === 1 ? '' : 's'} assigned
                </Text>
                <Text style={styles.hackathonSummarySubtitle}>Tap to view all</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </View>
          </Card>
        </Pressable>
      )}

      <Text style={styles.sectionTitle}>Pending evaluations</Text>

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

      {evaluated.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Your evaluations</Text>
          {evaluated.map((ev) => (
            <Pressable
              key={ev.id}
              onPress={() => navigation.navigate('EvaluateSubmission', { submissionId: ev.submissionId })}
            >
              <Card style={styles.submissionCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.submissionTitle}>{ev.submissionTitle}</Text>
                  <Text style={styles.submissionMeta}>{ev.teamName}</Text>
                </View>
                <Text style={styles.scoreText}>{ev.score}</Text>
                <ChevronRight size={18} color={colors.textMuted} />
              </Card>
            </Pressable>
          ))}
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, marginBottom: spacing.lg },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  hackathonSummaryCard: { marginBottom: spacing.lg },
  hackathonSummaryRow: { flexDirection: 'row', alignItems: 'center' },
  hackathonSummaryTitle: { ...typography.h3, fontSize: 15 },
  hackathonSummarySubtitle: { ...typography.caption, marginTop: 2 },
  sectionTitle: { ...typography.h3, marginBottom: spacing.sm },
  submissionCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  submissionTitle: { ...typography.h3 },
  submissionMeta: { ...typography.bodySecondary, marginTop: 2 },
  linkRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, gap: 4 },
  linkText: { ...typography.caption, flex: 1 },
  scoreText: { ...typography.h3, fontSize: 15, color: colors.primary, marginRight: spacing.sm },
});