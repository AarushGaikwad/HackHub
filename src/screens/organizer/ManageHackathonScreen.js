import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, StyleSheet, Alert } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Input from '../../components/Input';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import * as organizerApi from '../../api/organizerApi';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography } from '../../constants/theme';

export default function ManageHackathonScreen({ route, navigation }) {
  const { hackathonId } = route.params;
  const { user } = useAuth();

  const [hackathon, setHackathon] = useState(null);
  const [registeredTeams, setRegisteredTeams] = useState([]);
  const [judges, setJudges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [judgeIdInput, setJudgeIdInput] = useState('');
  const [assigningJudge, setAssigningJudge] = useState(false);
  const [actingTeamId, setActingTeamId] = useState(null);
  const [generatingCerts, setGeneratingCerts] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [hackathonData, teams, judgeList] = await Promise.all([
        organizerApi.getHackathonById(hackathonId),
        organizerApi.getRegisteredTeams(hackathonId),
        organizerApi.getAssignedJudges(hackathonId),
      ]);
      setHackathon(hackathonData);
      setRegisteredTeams(teams || []);
      setJudges(judgeList || []);
    } catch (err) {
      setError(err.message || 'Failed to load hackathon');
    }
  }, [hackathonId]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const handleStatusUpdate = async (teamId, status) => {
    setActingTeamId(teamId);
    try {
      await organizerApi.updateRegistrationStatus(hackathonId, teamId, user.userId, status);
      await load();
    } catch (err) {
      Alert.alert('Update failed', err.message || 'Please try again.');
    } finally {
      setActingTeamId(null);
    }
  };

  const handleAssignJudge = async () => {
    if (!judgeIdInput.trim() || Number.isNaN(Number(judgeIdInput))) {
      Alert.alert('Invalid Judge ID', 'Enter a numeric judge ID.');
      return;
    }
    setAssigningJudge(true);
    try {
      await organizerApi.assignJudge(hackathonId, Number(judgeIdInput), user.userId);
      setJudgeIdInput('');
      await load();
    } catch (err) {
      Alert.alert('Assignment failed', err.message || 'Please try again.');
    } finally {
      setAssigningJudge(false);
    }
  };

  const handleRemoveJudge = async (judgeId) => {
    try {
      await organizerApi.removeJudge(hackathonId, judgeId, user.userId);
      await load();
    } catch (err) {
      Alert.alert('Removal failed', err.message || 'Please try again.');
    }
  };

  const handleGenerateCertificates = async () => {
    setGeneratingCerts(true);
    try {
      await organizerApi.generateCertificates(hackathonId);
      Alert.alert('Success', 'Certificates generated for all participants.');
    } catch (err) {
      Alert.alert('Generation failed', err.message || 'Please try again.');
    } finally {
      setGeneratingCerts(false);
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
      <Text style={styles.dates}>{hackathon.startDate} → {hackathon.endDate}</Text>

      {/* Registered Teams */}
      <Card style={{ marginTop: spacing.lg }}>
        <Text style={styles.sectionTitle}>Registered Teams ({registeredTeams.length})</Text>
        {registeredTeams.length === 0 ? (
          <Text style={styles.body}>No teams registered yet.</Text>
        ) : (
          registeredTeams.map((reg) => (
            <View key={reg.id ?? reg.teamId} style={styles.teamRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.body}>{reg.teamName || reg.team?.name}</Text>
                <Badge label={reg.status} />
              </View>
              {reg.status === 'PENDING' && (
                <View style={styles.teamActions}>
                  <Button
                    title="Approve"
                    loading={actingTeamId === reg.teamId}
                    onPress={() => handleStatusUpdate(reg.teamId, 'APPROVED')}
                    style={{ marginRight: spacing.xs }}
                  />
                  <Button
                    title="Reject"
                    variant="danger"
                    loading={actingTeamId === reg.teamId}
                    onPress={() => handleStatusUpdate(reg.teamId, 'REJECTED')}
                  />
                </View>
              )}
            </View>
          ))
        )}
      </Card>

      {/* Judges */}
      <Card style={{ marginTop: spacing.lg }}>
        <Text style={styles.sectionTitle}>Assigned Judges ({judges.length})</Text>
        {judges.map((j) => (
          <View key={j.id ?? j.judgeId} style={styles.teamRow}>
            <Text style={styles.body}>{j.judgeName || `Judge #${j.judgeId}`}</Text>
            <Button title="Remove" variant="danger" onPress={() => handleRemoveJudge(j.judgeId)} />
          </View>
        ))}

        <Text style={styles.hint}>
          No judge search is available yet — enter the judge's numeric ID directly.
        </Text>
        <View style={styles.assignRow}>
          <Input
            placeholder="Judge ID"
            keyboardType="number-pad"
            value={judgeIdInput}
            onChangeText={setJudgeIdInput}
            style={{ flex: 1, marginBottom: 0 }}
          />
          <Button title="Assign" loading={assigningJudge} onPress={handleAssignJudge} style={styles.assignBtn} />
        </View>
      </Card>

      {/* Certificates */}
      <Button
        title="View Leaderboard"
        variant="secondary"
        onPress={() => navigation.navigate('Leaderboard', { hackathonId, hackathonTitle: hackathon.title })}
        style={{ marginTop: spacing.lg }}
      />
      <Button
        title="Generate Certificates"
        variant="secondary"
        onPress={handleGenerateCertificates}
        loading={generatingCerts}
        style={{ marginTop: spacing.sm }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { ...typography.h1, flex: 1, marginRight: spacing.sm },
  dates: { ...typography.caption, marginTop: spacing.xs },
  sectionTitle: { ...typography.h3, marginBottom: spacing.sm },
  body: { ...typography.body, color: colors.textSecondary },
  hint: { ...typography.caption, marginTop: spacing.md, marginBottom: spacing.xs },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  teamActions: { flexDirection: 'row' },
  assignRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  assignBtn: { paddingHorizontal: spacing.md },
});