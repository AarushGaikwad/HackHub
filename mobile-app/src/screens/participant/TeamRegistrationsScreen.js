import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, Pressable, Alert, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import * as participantApi from '../../api/participantApi';
import { colors, spacing, typography } from '../../constants/theme';

const WITHDRAWABLE_STATUSES = ['PENDING', 'APPROVED'];

export default function TeamRegistrationsScreen({ route, navigation }) {
  const { teamId } = route.params;
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [withdrawingId, setWithdrawingId] = useState(null);

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

  const confirmWithdraw = (reg) => {
    const hackathonId = reg.hackathonId ?? reg.hackathon?.id;
    const title = reg.hackathonTitle || reg.hackathon?.title || 'this hackathon';
    Alert.alert(
      'Withdraw registration',
      `Withdraw your team from ${title}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: () => handleWithdraw(reg, hackathonId),
        },
      ]
    );
  };

  const handleWithdraw = async (reg, hackathonId) => {
    setWithdrawingId(reg.id);
    try {
      await participantApi.withdrawTeam(hackathonId, teamId);
      await load();
    } catch (err) {
      Alert.alert('Withdraw failed', err.message || 'Please try again.');
    } finally {
      setWithdrawingId(null);
    }
  };

  if (loading) return <ScreenContainer scroll={false}><LoadingState /></ScreenContainer>;
  if (error) return <ScreenContainer scroll={false}><ErrorState message={error} onRetry={load} /></ScreenContainer>;

  return (
    <ScreenContainer>
      <Text style={styles.title}>Your Hackathons</Text>

      {registrations.length === 0 ? (
        <EmptyState title="Not registered yet" subtitle="Register your team for a hackathon from the Browse tab." />
      ) : (
        registrations.map((reg) => {
          const canWithdraw = WITHDRAWABLE_STATUSES.includes(reg.status?.toUpperCase());
          return (
            <Card key={reg.id ?? reg.hackathonId} style={styles.card}>
              <Pressable
                style={styles.rowTop}
                onPress={() =>
                  navigation.navigate('TeamSubmissions', {
                    teamRegistrationId: reg.id,
                    hackathonTitle: reg.hackathonTitle || reg.hackathon?.title,
                  })
                }
              >
                <Text style={styles.name} numberOfLines={1}>{reg.hackathonTitle || reg.hackathon?.title}</Text>
                <Badge label={reg.status} />
                <ChevronRight size={18} color={colors.textMuted} />
              </Pressable>

              {canWithdraw ? (
                <Button
                  title="Withdraw"
                  variant="danger"
                  loading={withdrawingId === reg.id}
                  onPress={() => confirmWithdraw(reg)}
                  style={styles.withdrawBtn}
                />
              ) : null}
            </Card>
          );
        })
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, marginBottom: spacing.lg },
  card: { marginBottom: spacing.md },
  rowTop: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  name: { ...typography.h3, flex: 1 },
  withdrawBtn: { marginTop: spacing.md },
});