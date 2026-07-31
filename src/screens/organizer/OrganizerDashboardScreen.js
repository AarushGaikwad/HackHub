import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import HackathonCard from '../../components/HackathonCard';
import Button from '../../components/Button';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import * as organizerApi from '../../api/organizerApi';
import { useAuth } from '../../context/AuthContext';
import { spacing, typography } from '../../constants/theme';

export default function OrganizerDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!user?.userId) return;
    setError(null);
    try {
      const data = await organizerApi.getHackathonsByOrganizer(user.userId);
      setHackathons(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load your hackathons');
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
      <Text style={styles.title}>My Hackathons</Text>

      <Button
        title="Create New Hackathon"
        onPress={() => navigation.navigate('CreateHackathon')}
        style={{ marginBottom: spacing.lg, marginTop: spacing.md }}
      />

      {hackathons.length === 0 ? (
        <EmptyState title="No hackathons yet" subtitle="Create your first hackathon to get started." />
      ) : (
        hackathons.map((h) => (
          <HackathonCard key={h.id} hackathon={h} onPress={() => navigation.navigate('ManageHackathon', { hackathonId: h.id })} />
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1 },
});