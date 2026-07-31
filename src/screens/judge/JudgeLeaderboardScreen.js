import React, { useCallback, useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import LeaderboardList from '../../components/LeaderboardList';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import * as judgeApi from '../../api/judgeApi';
import { spacing, typography } from '../../constants/theme';

export default function LeaderboardScreen({ route }) {
  const { hackathonId, hackathonTitle } = route.params;
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await judgeApi.getLeaderboard(hackathonId);
      setEntries(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load leaderboard');
    }
  }, [hackathonId]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  if (loading) return <ScreenContainer scroll={false}><LoadingState /></ScreenContainer>;
  if (error) return <ScreenContainer scroll={false}><ErrorState message={error} onRetry={load} /></ScreenContainer>;

  return (
    <ScreenContainer>
      <Text style={styles.title}>{hackathonTitle || 'Leaderboard'}</Text>
      <LeaderboardList entries={entries} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, marginBottom: spacing.lg },
});