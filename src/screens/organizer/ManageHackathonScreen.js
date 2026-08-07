import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, StyleSheet, Alert } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import SelectField from '../../components/SelectField';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import * as organizerApi from '../../api/organizerApi';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography } from '../../constants/theme';
import { getStatusLabel } from '../../constants/statusLabels';

export default function ManageHackathonScreen({ route, navigation }) {
  const { hackathonId } = route.params;
  const { user } = useAuth();

  const [hackathon, setHackathon] = useState(null);
  const [registeredTeams, setRegisteredTeams] = useState([]);
  const [judges, setJudges] = useState([]);
  const [allJudges, setAllJudges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedJudgeId, setSelectedJudgeId] = useState(null);
  const [assigningJudge, setAssigningJudge] = useState(false);
  const [actingTeamId, setActingTeamId] = useState(null);
  const [generatingCerts, setGeneratingCerts] = useState(false);
  const [deletingHackathon, setDeletingHackathon] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [hackathonData, teams, judgeList, judgesDirectory] = await Promise.all([
        organizerApi.getHackathonById(hackathonId),
        organizerApi.getRegisteredTeams(hackathonId),
        organizerApi.getAssignedJudges(hackathonId),
        organizerApi.getJudges().catch(() => []), // don't block the screen if this fails
      ]);
      setHackathon(hackathonData);
      setRegisteredTeams(teams || []);
      // JudgeAssignmentResponseDto.status can be INACTIVE for removed
      // assignments (removeJudge soft-deletes rather than deleting the
      // row) — filter defensively in case the backend doesn't already
      // exclude inactive ones from this endpoint.
      setJudges((judgeList || []).filter((j) => (j.status || 'ACTIVE').toUpperCase() !== 'INACTIVE'));
      setAllJudges(judgesDirectory || []);
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
    if (!selectedJudgeId) return;
    setAssigningJudge(true);
    try {
      await organizerApi.assignJudge(hackathonId, selectedJudgeId, user.userId);
      setSelectedJudgeId(null);
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

  const handleDeleteHackathon = () => {
    Alert.alert(
      'Delete this hackathon?',
      `"${hackathon.title}" will be permanently removed, including all registrations and submissions tied to it. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingHackathon(true);
            try {
              await organizerApi.deleteHackathon(hackathonId);
              navigation.goBack();
            } catch (err) {
              Alert.alert('Delete failed', err.message || 'Please try again.');
              setDeletingHackathon(false);
            }
          },
        },
      ]
    );
  };

  if (loading) return <ScreenContainer scroll={false}><LoadingState /></ScreenContainer>;
  if (error || !hackathon) return <ScreenContainer scroll={false}><ErrorState message={error} onRetry={load} /></ScreenContainer>;

  // Don't let the organizer pick a judge who's already assigned.
  const assignedJudgeIds = new Set(judges.map((j) => j.judgeId));
  const judgeOptions = allJudges
    .filter((j) => !assignedJudgeIds.has(j.id))
    .map((j) => ({ value: j.id, label: j.name }));

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{hackathon.title}</Text>
        <Badge label={hackathon.status} displayLabel={getStatusLabel(hackathon.status)} />
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

        <View style={styles.assignSection}>
          <SelectField
            label="Assign a judge"
            value={selectedJudgeId}
            options={judgeOptions}
            onSelect={setSelectedJudgeId}
            placeholder="Search judges by name"
            searchable
          />
          <Button
            title="Assign"
            loading={assigningJudge}
            disabled={!selectedJudgeId}
            onPress={handleAssignJudge}
          />
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
      <Button
        title="Delete Hackathon"
        variant="danger"
        loading={deletingHackathon}
        onPress={handleDeleteHackathon}
        style={{ marginTop: spacing.xl }}
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
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  teamActions: { flexDirection: 'row' },
  assignSection: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
});