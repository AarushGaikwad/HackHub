import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import * as participantApi from '../../api/participantApi';
import { colors, spacing, typography } from '../../constants/theme';

export default function CreateTeamScreen({ route, navigation }) {
  const hackathonId = route.params?.hackathonId;
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setApiError(null);
    if (!name.trim()) { setError('Team name is required'); return; }
    setError(null);
    setLoading(true);
    try {
      // TeamRequestDto — field names not yet confirmed, using `name` + `hackathonId`.
      await participantApi.createTeam({ name: name.trim(), hackathonId });
      navigation.navigate('MyTeamTab');
    } catch (err) {
      setApiError(err.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Create a Team</Text>
      <Text style={styles.subtitle}>You'll be the team leader — invite members after.</Text>
      <Card style={{ marginTop: spacing.xl }}>
        <Input label="Team Name" value={name} onChangeText={setName} error={error} />
        {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}
        <Button title="Create Team" onPress={handleSubmit} loading={loading} />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1 },
  subtitle: { ...typography.bodySecondary, marginTop: spacing.xs },
  apiError: { color: colors.danger, fontSize: 13, marginBottom: spacing.sm },
});