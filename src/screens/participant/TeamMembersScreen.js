import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import Badge from '../../components/Badge';
import * as participantApi from '../../api/participantApi';
import { spacing, typography } from '../../constants/theme';

export default function TeamMembersScreen({ route }) {
  const { teamId } = route.params;
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await participantApi.getTeamMembers(teamId);
      setMembers(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load members');
    }
  }, [teamId]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  if (loading) return <ScreenContainer scroll={false}><LoadingState /></ScreenContainer>;
  if (error) return <ScreenContainer scroll={false}><ErrorState message={error} onRetry={load} /></ScreenContainer>;

  return (
    <ScreenContainer>
      <Text style={styles.title}>Team Members</Text>
      {members.map((member) => (
        <Card key={member.id} style={{ marginBottom: spacing.md }}>
          <View style={styles.row}>
            <Text style={styles.name}>{member.name}</Text>
            {member.isLeader ? <Badge label="LEADER" /> : null}
          </View>
          {member.email ? <Text style={styles.email}>{member.email}</Text> : null}
        </Card>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, marginBottom: spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { ...typography.h3 },
  email: { ...typography.bodySecondary, marginTop: spacing.xs },
});