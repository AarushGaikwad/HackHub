import React, { useState } from 'react';
import { Text, StyleSheet, Alert } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import * as participantApi from '../../api/participantApi';
import { colors, spacing, typography } from '../../constants/theme';

export default function SubmitFinalScreen({ route, navigation }) {
  const { teamRegistrationId } = route.params;
  const [form, setForm] = useState({ title: '', description: '', githubLink: '', demoLink: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Required';
    if (!form.description.trim()) next.description = 'Required';
    if (!form.githubLink.trim()) next.githubLink = 'Required for final submission';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    setApiError(null);
    if (!validate()) return;

    Alert.alert(
      'Submit Final Project?',
      'This is your final submission and typically cannot be edited afterward. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', onPress: doSubmit },
      ]
    );
  };

  const doSubmit = async () => {
    setLoading(true);
    try {
      // FinalSubmissionRequestDto — field names not yet confirmed; using
      // { teamRegistrationId, title, description, githubLink, demoLink } as a guess.
      await participantApi.submitFinal({ teamRegistrationId, ...form });
      navigation.goBack();
    } catch (err) {
      setApiError(err.message || 'Failed to submit final project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Final Submission</Text>
      <Text style={styles.subtitle}>This is what judges will evaluate.</Text>

      <Card style={{ marginTop: spacing.xl }}>
        <Input label="Project Title" value={form.title} onChangeText={update('title')} error={errors.title} />
        <Input
          label="Description"
          multiline
          numberOfLines={5}
          style={{ height: 120, textAlignVertical: 'top', paddingTop: spacing.sm }}
          value={form.description}
          onChangeText={update('description')}
          error={errors.description}
        />
        <Input label="GitHub Link" autoCapitalize="none" value={form.githubLink} onChangeText={update('githubLink')} error={errors.githubLink} />
        <Input label="Demo Link (optional)" autoCapitalize="none" value={form.demoLink} onChangeText={update('demoLink')} />

        {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}

        <Button title="Submit Final Project" onPress={handleSubmit} loading={loading} />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1 },
  subtitle: { ...typography.bodySecondary, marginTop: spacing.xs },
  apiError: { color: colors.danger, fontSize: 13, marginBottom: spacing.sm },
});