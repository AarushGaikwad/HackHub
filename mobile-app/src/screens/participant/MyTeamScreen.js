import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Share, Alert, Pressable } from 'react-native';
import { FileText, Share2, Trash2, LogOut, UserX, UserPlus, Check } from 'lucide-react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Input from '../../components/Input';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import * as participantApi from '../../api/participantApi';
import { useAuth } from '../../context/AuthContext';
import { colors, radius, spacing, typography } from '../../constants/theme';

function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '?';
}

export default function MyTeamScreen({ navigation }) {
  const { user } = useAuth();
  // Each entry: { id, name, members: [], registration, isLeader }
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invitingTeamId, setInvitingTeamId] = useState(null);
  const [actingTeamId, setActingTeamId] = useState(null);
  const [removingMemberId, setRemovingMemberId] = useState(null);

  // Inline "add member" form state, keyed by team id so multiple teams
  // don't fight over one shared input.
  const [addFormTeamId, setAddFormTeamId] = useState(null);
  const [addEmail, setAddEmail] = useState('');
  const [addError, setAddError] = useState(null);
  const [addingMember, setAddingMember] = useState(false);

  // Leader's "leave team" flow: a leader can't just leave, since someone
  // has to hold leadership — so this walks them through picking a
  // successor first, then transfers, then leaves.
  const [transferFormTeamId, setTransferFormTeamId] = useState(null);
  const [selectedSuccessorId, setSelectedSuccessorId] = useState(null);
  const [transferringTeamId, setTransferringTeamId] = useState(null);

  const load = useCallback(async () => {
    if (!user?.userId) return;
    setError(null);
    try {
      const teamsData = await participantApi.getTeamsByUser(user.userId);

      const enriched = await Promise.all(
        (teamsData || []).map(async (team) => {
          const [members, registrations] = await Promise.all([
            participantApi.getTeamMembers(team.id).catch(() => []),
            participantApi.getTeamRegistrations(team.id).catch(() => []),
          ]);
          const registration = (registrations || [])[0] || null;
          const me = (members || []).find((m) => m.userId === user.userId);
          return { ...team, members: members || [], registration, isLeader: !!me?.isLeader };
        })
      );

      setTeams(enriched);
    } catch (err) {
      setError(err.message || 'Failed to load your team');
    }
  }, [user?.userId]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const handleInvite = async (team) => {
    if (!team.inviteCode) {
      Alert.alert('No invite code', 'This team does not have an invite code yet.');
      return;
    }
    setInvitingTeamId(team.id);
    try {
      await Share.share({
        message: `Join my HackHub team "${team.name}" using invite code: ${team.inviteCode}`,
      });
    } finally {
      setInvitingTeamId(null);
    }
  };

  const handleDeleteTeam = (team) => {
    Alert.alert(
      'Delete this team?',
      `This permanently deletes "${team.name}" for every member. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setActingTeamId(team.id);
            try {
              await participantApi.deleteTeam(team.id);
              await load();
            } catch (err) {
              Alert.alert('Delete failed', err.message || 'Please try again.');
            } finally {
              setActingTeamId(null);
            }
          },
        },
      ]
    );
  };

  const handleLeaveTeam = (team) => {
    Alert.alert('Leave this team?', `You'll need a new invite code to rejoin "${team.name}".`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          setActingTeamId(team.id);
          try {
            await participantApi.leaveTeam(team.id);
            await load();
          } catch (err) {
            Alert.alert('Leave failed', err.message || 'Please try again.');
          } finally {
            setActingTeamId(null);
          }
        },
      },
    ]);
  };

  const handleRemoveMember = (team, member) => {
    Alert.alert(
      'Remove this member?',
      `${member.name} will lose access to "${team.name}".`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setRemovingMemberId(member.userId ?? member.id);
            try {
              await participantApi.removeTeamMember(team.id, member.userId);
              await load();
            } catch (err) {
              Alert.alert('Remove failed', err.message || 'Please try again.');
            } finally {
              setRemovingMemberId(null);
            }
          },
        },
      ]
    );
  };

  const openAddForm = (teamId) => {
    setAddFormTeamId(teamId);
    setAddEmail('');
    setAddError(null);
  };

  const handleAddMember = async (team) => {
    if (!/^\S+@\S+\.\S+$/.test(addEmail)) {
      setAddError('Enter a valid email');
      return;
    }
    setAddError(null);
    setAddingMember(true);
    try {
      await participantApi.addTeamMember(team.id, addEmail.trim());
      setAddFormTeamId(null);
      setAddEmail('');
      await load();
    } catch (err) {
      setAddError(err.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const openTransferForm = (teamId) => {
    setTransferFormTeamId(teamId);
    setSelectedSuccessorId(null);
  };

  const cancelTransferForm = () => {
    setTransferFormTeamId(null);
    setSelectedSuccessorId(null);
  };

  const handleTransferAndLeave = async (team) => {
    if (!selectedSuccessorId) return;
    setTransferringTeamId(team.id);
    try {
      await participantApi.transferLeadership(team.id, selectedSuccessorId);
      await participantApi.leaveTeam(team.id);
      setTransferFormTeamId(null);
      setSelectedSuccessorId(null);
      await load();
    } catch (err) {
      Alert.alert('Failed to leave team', err.message || 'Please try again.');
    } finally {
      setTransferringTeamId(null);
    }
  };

  if (loading) return <ScreenContainer scroll={false}><LoadingState /></ScreenContainer>;
  if (error) return <ScreenContainer scroll={false}><ErrorState message={error} onRetry={load} /></ScreenContainer>;

  return (
    <ScreenContainer>
      <Text style={styles.title}>My Team</Text>

      {teams.length === 0 ? (
        <>
          <EmptyState title="No team yet" subtitle="Create a team or join one with an invite code." />
          <Button title="Create Team" onPress={() => navigation.navigate('CreateTeam')} />
          <Button
            title="Join Team"
            variant="secondary"
            onPress={() => navigation.navigate('JoinTeam')}
            style={{ marginTop: spacing.sm }}
          />
        </>
      ) : (
        teams.map((team) => (
          <Card key={team.id} style={{ marginBottom: spacing.md }}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.teamName}>{team.name}</Text>
                <Text style={styles.teamMeta}>
                  {team.members.length} member{team.members.length === 1 ? '' : 's'}
                  {team.registration ? ` · ${team.registration.hackathonTitle || team.registration.hackathon?.title}` : ''}
                </Text>
              </View>
              {team.registration ? <Badge label={team.registration.status} /> : null}
            </View>

            {team.members.length > 0 && (
              <View style={styles.memberList}>
                {team.members.map((member) => {
                  const memberKey = member.id ?? member.userId;
                  const canRemove = team.isLeader && !member.isLeader;
                  return (
                    <View key={memberKey} style={styles.memberRow}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials(member.name)}</Text>
                      </View>
                      <Text style={styles.memberName} numberOfLines={1}>{member.name}</Text>
                      {member.isLeader ? <Badge label="LEADER" /> : null}
                      {canRemove ? (
                        <Pressable
                          hitSlop={8}
                          onPress={() => handleRemoveMember(team, member)}
                          disabled={removingMemberId === (member.userId ?? member.id)}
                        >
                          <UserX
                            size={16}
                            color={removingMemberId === (member.userId ?? member.id) ? colors.textMuted : colors.danger}
                          />
                        </Pressable>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            )}

            {/* Leader-only: add a member directly by email. */}
            {team.isLeader && (
              <View style={styles.addSection}>
                {addFormTeamId === team.id ? (
                  <View>
                    <Input
                      placeholder="Member's email"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      value={addEmail}
                      onChangeText={setAddEmail}
                      error={addError}
                    />
                    <View style={styles.addActionsRow}>
                      <Button
                        title="Cancel"
                        variant="secondary"
                        onPress={() => setAddFormTeamId(null)}
                        style={{ flex: 1 }}
                      />
                      <Button
                        title="Add"
                        loading={addingMember}
                        onPress={() => handleAddMember(team)}
                        style={{ flex: 1 }}
                      />
                    </View>
                  </View>
                ) : (
                  <Pressable style={styles.addRow} onPress={() => openAddForm(team.id)}>
                    <UserPlus size={16} color={colors.primary} />
                    <Text style={styles.addRowText}>Add member by email</Text>
                  </Pressable>
                )}
              </View>
            )}

            <View style={styles.actionsRow}>
              <Button
                title="Submissions"
                variant="secondary"
                icon={<FileText size={16} color={colors.primary} style={{ marginRight: spacing.xs }} />}
                onPress={() => navigation.navigate('TeamRegistrations', { teamId: team.id })}
                style={{ flex: 1 }}
              />
              <Button
                title="Invite"
                variant="secondary"
                icon={<Share2 size={16} color={colors.primary} style={{ marginRight: spacing.xs }} />}
                loading={invitingTeamId === team.id}
                onPress={() => handleInvite(team)}
                style={{ flex: 1 }}
              />
            </View>

            {team.isLeader ? (
              transferFormTeamId === team.id ? (
                // Successor picker — shown after tapping "Leave Team" as leader.
                <View style={styles.transferBox}>
                  <Text style={styles.transferTitle}>Choose a new leader before leaving</Text>
                  {team.members
                    .filter((m) => !m.isLeader)
                    .map((m) => {
                      const key = m.userId ?? m.id;
                      const selected = selectedSuccessorId === key;
                      return (
                        <Pressable
                          key={key}
                          style={[styles.successorRow, selected && styles.successorRowSelected]}
                          onPress={() => setSelectedSuccessorId(key)}
                        >
                          <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{initials(m.name)}</Text>
                          </View>
                          <Text style={styles.memberName}>{m.name}</Text>
                          {selected ? <Check size={16} color={colors.primary} /> : null}
                        </Pressable>
                      );
                    })}
                  <View style={styles.addActionsRow}>
                    <Button title="Cancel" variant="secondary" onPress={cancelTransferForm} style={{ flex: 1 }} />
                    <Button
                      title="Confirm & Leave"
                      variant="danger"
                      disabled={!selectedSuccessorId}
                      loading={transferringTeamId === team.id}
                      onPress={() => handleTransferAndLeave(team)}
                      style={{ flex: 1 }}
                    />
                  </View>
                </View>
              ) : (
                <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
                  <Button
                    title="Delete Team"
                    variant="danger"
                    icon={<Trash2 size={16} color="#fff" style={{ marginRight: spacing.xs }} />}
                    loading={actingTeamId === team.id}
                    onPress={() => handleDeleteTeam(team)}
                  />
                  {team.members.filter((m) => !m.isLeader).length > 0 && (
                    <Button
                      title="Leave Team"
                      variant="secondary"
                      icon={<LogOut size={16} color={colors.primary} style={{ marginRight: spacing.xs }} />}
                      onPress={() => openTransferForm(team.id)}
                    />
                  )}
                </View>
              )
            ) : (
              <Button
                title="Leave Team"
                variant="danger"
                icon={<LogOut size={16} color="#fff" style={{ marginRight: spacing.xs }} />}
                loading={actingTeamId === team.id}
                onPress={() => handleLeaveTeam(team)}
                style={{ marginTop: spacing.sm }}
              />
            )}
          </Card>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, marginBottom: spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  teamName: { ...typography.h3 },
  teamMeta: { ...typography.bodySecondary, marginTop: spacing.xs },
  memberList: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.md, paddingTop: spacing.sm },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs, gap: spacing.sm },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  memberName: { ...typography.body, fontSize: 14, flex: 1 },
  addSection: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xs },
  addRowText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  addActionsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  transferBox: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  transferTitle: { ...typography.caption, marginBottom: spacing.sm, fontWeight: '600' },
  successorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 4,
  },
  successorRowSelected: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
});