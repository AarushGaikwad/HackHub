import React, { useCallback, useEffect, useState } from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import * as judgeApi from '../../api/judgeApi';
import { useAuth } from '../../context/AuthContext';
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
      setHackathons(data || []);
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
        hackathons.map((h) => (
          <Pressable
            key={h.hackathonId ?? h.id}
            onPress={() =>
              navigation.navigate('Leaderboard', {
                hackathonId: h.hackathonId ?? h.id,
                hackathonTitle: h.hackathonTitle || h.title,
              })
            }
          >
            <Card style={styles.card}>
              <Text style={styles.name}>{h.hackathonTitle || h.title}</Text>
              <Badge label={h.status || 'ACTIVE'} />
              <ChevronRight size={18} color={colors.textMuted} style={styles.chevron} />
            </Card>
          </Pressable>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, marginBottom: spacing.lg },
  card: { marginBottom: spacing.md, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  name: { ...typography.h3, flex: 1 },
  chevron: { position: 'absolute', right: spacing.lg },
});