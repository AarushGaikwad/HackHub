import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import * as participantApi from '../../api/participantApi';
import { useAuth } from '../../context/AuthContext';
import { spacing, typography } from '../../constants/theme';

export default function MyTeamScreen({ navigation }) {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!user?.userId) return;
    setError(null);
    try {
      const data = await participantApi.getTeamsByUser(user.userId);
      setTeams(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load your team');
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
      <Text style={styles.title}>My Team</Text>

      {teams.length === 0 ? (
        <>
          <EmptyState title="No team yet" subtitle="Create a team or join one with an invite code." />
          <Button title="Create Team" onPress={() => navigation.navigate('CreateTeam')} />
          <Button title="Join Team" variant="secondary" onPress={() => navigation.navigate('JoinTeam')} style={{ marginTop: spacing.sm }} />
        </>
      ) : (
        teams.map((team) => (
          <Card key={team.id} style={{ marginBottom: spacing.md }}>
            <Text style={styles.teamName}>{team.name}</Text>
            <Text style={styles.teamMeta}>Members: {team.membersCount ?? team.members?.length ?? '—'}</Text>
            <View style={{ flexDirection: 'row', marginTop: spacing.md, gap: spacing.sm }}>
              <Button title="View Members" variant="secondary" onPress={() => navigation.navigate('TeamMembers', { teamId: team.id })} style={{ flex: 1 }} />
              <Button title="Submissions" variant="secondary" onPress={() => navigation.navigate('TeamRegistrations', { teamId: team.id })} style={{ flex: 1 }} />
            </View>
          </Card>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, marginBottom: spacing.lg },
  teamName: { ...typography.h3 },
  teamMeta: { ...typography.bodySecondary, marginTop: spacing.xs },
});