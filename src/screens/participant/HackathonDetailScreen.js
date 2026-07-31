import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import * as commonApi from '../../api/commonApi';
import * as participantApi from '../../api/participantApi';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography } from '../../constants/theme';

export default function HackathonDetailScreen({ route, navigation }) {
  const { hackathonId } = route.params;
  const { user } = useAuth();

  const [hackathon, setHackathon] = useState(null);
  const [myTeams, setMyTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registeringTeamId, setRegisteringTeamId] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [hackathonData, teamsData] = await Promise.all([
        commonApi.getHackathonById(hackathonId),
        user?.userId ? participantApi.getTeamsByUser(user.userId) : Promise.resolve([]),
      ]);
      setHackathon(hackathonData);
      setMyTeams(teamsData || []);
    } catch (err) {
      setError(err.message || 'Failed to load hackathon');
    }
  }, [hackathonId, user?.userId]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const handleRegister = async (teamId) => {
    setRegisteringTeamId(teamId);
    try {
      await participantApi.registerTeamForHackathon(hackathonId, teamId);
      Alert.alert('Success', 'Your team is registered for this hackathon.');
    } catch (err) {
      Alert.alert('Registration failed', err.message || 'Please try again.');
    } finally {
      setRegisteringTeamId(null);
    }
  };

  if (loading) return <ScreenContainer scroll={false}><LoadingState /></ScreenContainer>;
  if (error || !hackathon) return <ScreenContainer scroll={false}><ErrorState message={error} onRetry={load} /></ScreenContainer>;

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{hackathon.title}</Text>
        <Badge label={hackathon.status} />
      </View>
      {hackathon.organizationName ? <Text style={styles.org}>Hosted by {hackathon.organizationName}</Text> : null}
      <Text style={styles.dates}>{hackathon.startDate} → {hackathon.endDate}</Text>

      <Card style={{ marginTop: spacing.lg }}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.body}>{hackathon.description || 'No description provided.'}</Text>
        {hackathon.rules ? (
          <>
            <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>Rules & Guidelines</Text>
            <Text style={styles.body}>{hackathon.rules}</Text>
          </>
        ) : null}
      </Card>

      <View style={{ marginTop: spacing.lg }}>
        {myTeams.length === 0 ? (
          <Button title="Create a Team to Register" onPress={() => navigation.navigate('CreateTeam', { hackathonId })} />
        ) : (
          myTeams.map((team) => (
            <Button
              key={team.id}
              title={`Register "${team.name}" for this Hackathon`}
              loading={registeringTeamId === team.id}
              onPress={() => handleRegister(team.id)}
              style={{ marginBottom: spacing.sm }}
            />
          ))
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { ...typography.h1, flex: 1, marginRight: spacing.sm },
  org: { ...typography.bodySecondary, marginTop: spacing.xs },
  dates: { ...typography.caption, marginTop: spacing.xs },
  sectionTitle: { ...typography.h3 },
  body: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 22 },
});