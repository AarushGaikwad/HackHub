import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, StyleSheet, Alert, Pressable } from 'react-native';
import { Pencil, Trash2 } from 'lucide-react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import * as participantApi from '../../api/participantApi';
import { colors, spacing, typography } from '../../constants/theme';


export default function TeamSubmissionsScreen({ route, navigation }) {
  const { teamRegistrationId, hackathonTitle } = route.params;

  const [progressSubmissions, setProgressSubmissions] = useState([]);
  const [finalSubmission, setFinalSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [progressData, finalData] = await Promise.all([
        participantApi.getTeamProgressSubmissions(teamRegistrationId),
        participantApi.getFinalSubmission(teamRegistrationId).catch(() => null), // no final yet is expected, not an error
      ]);
      setProgressSubmissions(progressData || []);
      setFinalSubmission(finalData);
    } catch (err) {
      setError(err.message || 'Failed to load submissions');
    }
  }, [teamRegistrationId]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const handleDeleteProgress = (submissionId) => {
    Alert.alert('Delete this update?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await participantApi.deleteProgressSubmission(submissionId);
            load();
          } catch (err) {
            Alert.alert('Delete failed', err.message || 'Please try again.');
          }
        },
      },
    ]);
  };

  if (loading) return <ScreenContainer scroll={false}><LoadingState /></ScreenContainer>;
  if (error) return <ScreenContainer scroll={false}><ErrorState message={error} onRetry={load} /></ScreenContainer>;

  return (
    <ScreenContainer>
      <Text style={styles.title}>{hackathonTitle || 'Submissions'}</Text>

      {/* Final Submission */}
      <Card style={{ marginTop: spacing.lg }}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Final Submission</Text>
          {finalSubmission ? <Badge label="SUBMITTED" /> : null}
        </View>

        {finalSubmission ? (
          <>
            <Text style={styles.itemTitle}>{finalSubmission.title}</Text>
            <Text style={styles.itemBody}>{finalSubmission.description}</Text>
          </>
        ) : (
          <>
            <Text style={styles.body}>You haven't submitted your final project yet.</Text>
            <Button
              title="Submit Final Project"
              onPress={() => navigation.navigate('SubmitFinal', { teamRegistrationId })}
              style={{ marginTop: spacing.md }}
            />
          </>
        )}
      </Card>

      {/* Progress Updates */}
      <View style={styles.progressHeader}>
        <Text style={styles.sectionTitle}>Progress Updates</Text>
        <Button
          title="+ Add Update"
          variant="secondary"
          onPress={() => navigation.navigate('SubmitProgress', { teamRegistrationId })}
        />
      </View>

      {progressSubmissions.length === 0 ? (
        <EmptyState title="No progress updates yet" subtitle="Share what your team has built so far." />
      ) : (
        progressSubmissions.map((sub) => (
          <Card key={sub.id} style={{ marginBottom: spacing.md }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.itemTitle}>{sub.title}</Text>
              <View style={styles.actionsRow}>
                <Pressable onPress={() => navigation.navigate('SubmitProgress', { teamRegistrationId, submissionId: sub.id })} hitSlop={8}>
                  <Pencil size={16} color={colors.textMuted} />
                </Pressable>
                <Pressable onPress={() => handleDeleteProgress(sub.id)} hitSlop={8} style={{ marginLeft: spacing.md }}>
                  <Trash2 size={16} color={colors.danger} />
                </Pressable>
              </View>
            </View>
            <Text style={styles.itemBody}>{sub.description}</Text>
          </Card>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle: { ...typography.h3 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.sm },
  itemTitle: { ...typography.h3, fontSize: 16 },
  itemBody: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  body: { ...typography.body, color: colors.textSecondary },
  actionsRow: { flexDirection: 'row', alignItems: 'center' },
});