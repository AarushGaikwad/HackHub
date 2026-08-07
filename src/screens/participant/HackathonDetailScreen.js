import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, Pressable } from 'react-native';
import { CheckCircle2, Check } from 'lucide-react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import * as commonApi from '../../api/commonApi';
import * as participantApi from '../../api/participantApi';
import { useAuth } from '../../context/AuthContext';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { getStatusLabel } from '../../constants/statusLabels';

export default function HackathonDetailScreen({ route, navigation }) {
  const { hackathonId } = route.params;
  const { user } = useAuth();

  const [hackathon, setHackathon] = useState(null);
  // Each entry: { id, name, registration: { id, status } | null }
  const [myTeams, setMyTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registeringTeamId, setRegisteringTeamId] = useState(null);

  // Which team's inline confirmation panel is open, and whether the rules
  // checkbox in that panel has been ticked.
  const [confirmingTeamId, setConfirmingTeamId] = useState(null);
  const [agreedToRules, setAgreedToRules] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [hackathonData, teamsData] = await Promise.all([
        commonApi.getHackathonById(hackathonId),
        user?.userId ? participantApi.getTeamsByUser(user.userId) : Promise.resolve([]),
      ]);
      setHackathon(hackathonData);

      const teamsWithStatus = await Promise.all(
        (teamsData || []).map(async (team) => {
          let registration = null;
          try {
            const regs = await participantApi.getTeamRegistrations(team.id);
            registration = (regs || []).find(
              (r) => (r.hackathonId ?? r.hackathon?.id) === hackathonId
            ) || null;
          } catch {
            // No registrations yet for this team is expected, not an error.
          }
          return { ...team, registration };
        })
      );
      setMyTeams(teamsWithStatus);
    } catch (err) {
      setError(err.message || 'Failed to load hackathon');
    }
  }, [hackathonId, user?.userId]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const openConfirm = (teamId) => {
    setConfirmingTeamId(teamId);
    setAgreedToRules(false);
  };

  const cancelConfirm = () => {
    setConfirmingTeamId(null);
    setAgreedToRules(false);
  };

  const handleRegister = async (teamId) => {
    setRegisteringTeamId(teamId);
    try {
      await participantApi.registerTeamForHackathon(hackathonId, teamId);
      setConfirmingTeamId(null);
      setAgreedToRules(false);
      // Refetch so the new PENDING status renders inline immediately.
      await load();
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
        <Badge label={hackathon.status} displayLabel={getStatusLabel(hackathon.status)} />
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
          <Button
            title="Create a Team to Register"
            onPress={() => navigation.navigate('CreateTeam', { hackathonId })}
          />
        ) : (
          <>
            <Text style={styles.sectionTitle}>Your Teams</Text>
            {myTeams.map((team) => (
              <Card key={team.id} style={styles.teamCard}>
                {team.registration ? (
                  // Already registered — show status, no further action.
                  <View style={styles.statusRow}>
                    <CheckCircle2 size={20} color={colors.success} />
                    <View style={{ flex: 1, marginLeft: spacing.sm }}>
                      <Text style={styles.statusTitle}>{team.name} is registered</Text>
                      <Text style={styles.statusSubtitle}>
                        {team.registration.status === 'PENDING'
                          ? 'Awaiting organizer approval'
                          : team.registration.status === 'APPROVED'
                          ? "You're all set"
                          : 'Registration was rejected'}
                      </Text>
                    </View>
                    <Badge label={team.registration.status} />
                  </View>
                ) : confirmingTeamId === team.id ? (
                  // Inline confirmation panel — replaces the Register button
                  // until the user explicitly confirms or cancels.
                  <View>
                    <Text style={styles.confirmTitle}>Confirm registration for {team.name}</Text>
                    {hackathon.rules ? (
                      <View style={styles.rulesBox}>
                        <Text style={styles.rulesText} numberOfLines={4}>{hackathon.rules}</Text>
                      </View>
                    ) : null}
                    <Pressable style={styles.agreeRow} onPress={() => setAgreedToRules((v) => !v)}>
                      <View style={[styles.checkbox, agreedToRules && styles.checkboxChecked]}>
                        {agreedToRules ? <Check size={13} color="#fff" /> : null}
                      </View>
                      <Text style={styles.agreeText}>I have read and agree to the rules</Text>
                    </Pressable>
                    <View style={styles.confirmActionsRow}>
                      <Button title="Cancel" variant="secondary" onPress={cancelConfirm} style={{ flex: 1 }} />
                      <Button
                        title="Confirm"
                        disabled={!agreedToRules}
                        loading={registeringTeamId === team.id}
                        onPress={() => handleRegister(team.id)}
                        style={{ flex: 1 }}
                      />
                    </View>
                  </View>
                ) : (
                  // Default state — team not registered, confirmation not open yet.
                  <View style={styles.registerRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.statusTitle}>{team.name}</Text>
                      <Text style={styles.statusSubtitle}>
                        {team.membersCount ?? team.members?.length ?? '—'} members
                      </Text>
                    </View>
                    <Button
                      title="Register"
                      onPress={() => openConfirm(team.id)}
                      style={styles.registerBtn}
                    />
                  </View>
                )}
              </Card>
            ))}
          </>
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
  teamCard: { marginBottom: spacing.sm, marginTop: spacing.sm },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  registerRow: { flexDirection: 'row', alignItems: 'center' },
  statusTitle: { ...typography.h3, fontSize: 15 },
  statusSubtitle: { ...typography.bodySecondary, marginTop: 2 },
  registerBtn: { paddingHorizontal: spacing.md },

  confirmTitle: { ...typography.h3, fontSize: 14, marginBottom: spacing.sm },
  rulesBox: { backgroundColor: colors.bg, borderRadius: radius.sm, padding: spacing.sm, marginBottom: spacing.sm },
  rulesText: { ...typography.caption, color: colors.textSecondary, lineHeight: 18 },
  agreeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  agreeText: { ...typography.caption, color: colors.textSecondary, flex: 1 },
  confirmActionsRow: { flexDirection: 'row', gap: spacing.sm },
});