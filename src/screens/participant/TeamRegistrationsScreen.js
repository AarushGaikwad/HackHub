import React, { useCallback, useEffect, useState } from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import * as participantApi from '../../api/participantApi';
import { colors, spacing, typography } from '../../constants/theme';


export default function TeamRegistrationsScreen({ route, navigation }) {
  const { teamId } = route.params;
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await participantApi.getTeamRegistrations(teamId);
      setRegistrations(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load registrations');
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
      <Text style={styles.title}>Your Hackathons</Text>

      {registrations.length === 0 ? (
        <EmptyState title="Not registered yet" subtitle="Register your team for a hackathon from the Browse tab." />
      ) : (
        registrations.map((reg) => (
          <Pressable
            key={reg.id}
            onPress={() =>
              navigation.navigate('TeamSubmissions', {
                teamRegistrationId: reg.id,
                hackathonTitle: reg.hackathonTitle || reg.hackathon?.title,
              })
            }
          >
            <Card style={styles.card}>
              <Text style={styles.name}>{reg.hackathonTitle || reg.hackathon?.title}</Text>
              <Badge label={reg.status} />
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