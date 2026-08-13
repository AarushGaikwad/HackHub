import React, { useCallback, useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import * as judgeApi from '../../api/judgeApi';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography } from '../../constants/theme';

export default function EvaluateSubmissionScreen({ route, navigation }) {
  const { submissionId } = route.params;
  const { user } = useAuth();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [existingEvalId, setExistingEvalId] = useState(null);

  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [submissionData, evaluations] = await Promise.all([
        judgeApi.getSubmissionById(submissionId),
        judgeApi.getSubmissionEvaluations(submissionId).catch(() => []),
      ]);
      setSubmission(submissionData);

      const mine = (evaluations || []).find((e) => e.judgeId === user?.userId);
      if (mine) {
        setExistingEvalId(mine.id);
        setScore(String(mine.score ?? ''));
        setFeedback(mine.feedback ?? '');
      }
    } catch (err) {
      setError(err.message || 'Failed to load submission');
    }
  }, [submissionId, user?.userId]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const validate = () => {
    const next = {};
    const scoreNum = Number(score);
    if (!score || Number.isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      next.score = 'Enter a score between 0 and 100';
    }
    if (!feedback.trim()) next.feedback = 'Feedback is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    setApiError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (existingEvalId) {
        await judgeApi.updateEvaluation(existingEvalId, {
          submissionId,
          score: Number(score),
          feedback: feedback.trim(),
        });
      } else {
        await judgeApi.submitEvaluation({
          submissionId,
          score: Number(score),
          feedback: feedback.trim(),
        });
      }
      navigation.goBack();
    } catch (err) {
      setApiError(err.message || `Failed to ${existingEvalId ? 'update' : 'submit'} evaluation`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <ScreenContainer scroll={false}><LoadingState /></ScreenContainer>;
  if (error || !submission) return <ScreenContainer scroll={false}><ErrorState message={error} onRetry={load} /></ScreenContainer>;

  return (
    <ScreenContainer>
      <Text style={styles.title}>{submission.title}</Text>
      <Text style={styles.subtitle}>{submission.teamName}</Text>

      <Card style={{ marginTop: spacing.lg }}>
        <Text style={styles.body}>{submission.description}</Text>
      </Card>

      <Card style={{ marginTop: spacing.lg }}>
        {existingEvalId ? (
          <Text style={styles.editingHint}>You've already evaluated this — edits will update your score.</Text>
        ) : null}
        <Input label="Score (0–100)" keyboardType="number-pad" value={score} onChangeText={setScore} error={errors.score} />
        <Input
          label="Feedback"
          multiline
          numberOfLines={4}
          style={{ height: 100, textAlignVertical: 'top', paddingTop: spacing.sm }}
          value={feedback}
          onChangeText={setFeedback}
          error={errors.feedback}
        />
        <Text style={styles.hint}>Criteria: Innovation · Execution · Presentation</Text>

        {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}

        <Button
          title={existingEvalId ? 'Update Evaluation' : 'Submit Evaluation'}
          onPress={handleSubmit}
          loading={submitting}
          style={{ marginTop: spacing.sm }}
        />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1 },
  subtitle: { ...typography.bodySecondary, marginTop: spacing.xs },
  body: { ...typography.body, color: colors.textSecondary },
  hint: { ...typography.caption, marginBottom: spacing.sm },
  editingHint: { ...typography.caption, color: colors.primary, marginBottom: spacing.md },
  apiError: { color: colors.danger, fontSize: 13, marginBottom: spacing.sm },
});