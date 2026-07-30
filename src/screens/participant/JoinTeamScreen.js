import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import * as participantApi from '../../api/participantApi';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography } from '../../constants/theme';

export default function JoinTeamScreen({ navigation }) {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setApiError(null);
    if (!code.trim()) { setError('Invite code is required'); return; }
    setError(null);
    setLoading(true);
    try {
      await participantApi.joinTeam(code.trim(), user.userId);
      navigation.navigate('MyTeamTab');
    } catch (err) {
      setApiError(err.message || 'Invalid or expired invite code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Join a Team</Text>
      <Text style={styles.subtitle}>Enter the invite code shared by your team leader.</Text>
      <Card style={{ marginTop: spacing.xl }}>
        <Input label="Invite Code" autoCapitalize="characters" value={code} onChangeText={setCode} error={error} />
        {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}
        <Button title="Join Team" onPress={handleSubmit} loading={loading} />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1 },
  subtitle: { ...typography.bodySecondary, marginTop: spacing.xs },
  apiError: { color: colors.danger, fontSize: 13, marginBottom: spacing.sm },
});