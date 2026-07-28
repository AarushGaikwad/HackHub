// Single combined Login / Sign-up screen. Sign-up shows a role selector
// (Participant / Organizer / Judge — no Admin, admin is web-only) and the
// form fields swap to match that role's exact RequestDto.
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button.js';
import * as authApi from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';
import { colors, spacing, typography, radius } from '../../constants/theme';

const ROLE_TABS = [
  { key: ROLES.PARTICIPANT, label: 'Participant' },
  { key: ROLES.ORGANIZER, label: 'Organizer' },
  { key: ROLES.JUDGE, label: 'Judge' },
];

const initialFormState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  collegeName: '',       // participant only
  organizationName: '',  // organizer only
  designation: '',        // judge only
};

export default function AuthScreen() {
  const { login } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [role, setRole] = useState(ROLES.PARTICIPANT);
  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setErrors({});
    setApiError(null);
  };

  const validateLogin = () => {
    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email';
    if (!form.password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateSignup = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email';
    if (form.password.length < 6) next.password = 'At least 6 characters';
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match';

    if (role === ROLES.PARTICIPANT && !form.collegeName.trim()) next.collegeName = 'College name is required';
    if (role === ROLES.ORGANIZER && !form.organizationName.trim()) next.organizationName = 'Organization name is required';
    if (role === ROLES.JUDGE && !form.designation.trim()) next.designation = 'Occupation is required';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleLogin = async () => {
    setApiError(null);
    if (!validateLogin()) return;
    setLoading(true);
    try {
      await login(form.email.trim(), form.password);
      // RootNavigator reacts to auth state automatically.
    } catch (err) {
      setApiError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setApiError(null);
    if (!validateSignup()) return;
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      };

      if (role === ROLES.PARTICIPANT) {
        payload.collegeName = form.collegeName.trim();
        await authApi.registerParticipant(payload);
      } else if (role === ROLES.ORGANIZER) {
        payload.organizationName = form.organizationName.trim();
        await authApi.registerOrganizer(payload);
      } else {
        payload.designation = form.designation.trim();
        await authApi.registerJudge(payload);
      }

      const message =
        role === ROLES.ORGANIZER
          ? 'Account created. An admin needs to approve your organizer account before you can log in.'
          : 'Account created. You can log in now.';

      Alert.alert('Registration successful', message, [
        { text: 'OK', onPress: () => { setForm(initialFormState); switchMode('login'); } },
      ]);
    } catch (err) {
      setApiError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.brand}>HackHub</Text>
        <Text style={styles.tagline}>Discover, build, and judge hackathons.</Text>
      </View>

      {/* Login / Sign up toggle */}
      <View style={styles.toggleRow}>
        <Pressable style={[styles.toggleBtn, mode === 'login' && styles.toggleBtnActive]} onPress={() => switchMode('login')}>
          <Text style={[styles.toggleText, mode === 'login' && styles.toggleTextActive]}>Log In</Text>
        </Pressable>
        <Pressable style={[styles.toggleBtn, mode === 'signup' && styles.toggleBtnActive]} onPress={() => switchMode('signup')}>
          <Text style={[styles.toggleText, mode === 'signup' && styles.toggleTextActive]}>Sign Up</Text>
        </Pressable>
      </View>

      <Card>
        {mode === 'signup' && (
          <View style={styles.roleRow}>
            {ROLE_TABS.map((r) => (
              <Pressable
                key={r.key}
                style={[styles.roleTab, role === r.key && styles.roleTabActive]}
                onPress={() => setRole(r.key)}
              >
                <Text style={[styles.roleTabText, role === r.key && styles.roleTabTextActive]}>{r.label}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {mode === 'signup' && (
          <Input label="Full Name" value={form.name} onChangeText={update('name')} error={errors.name} />
        )}

        <Input
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={form.email}
          onChangeText={update('email')}
          error={errors.email}
        />

        {mode === 'signup' && role === ROLES.PARTICIPANT && (
          <Input label="College Name" value={form.collegeName} onChangeText={update('collegeName')} error={errors.collegeName} />
        )}
        {mode === 'signup' && role === ROLES.ORGANIZER && (
          <Input label="Organization Name" value={form.organizationName} onChangeText={update('organizationName')} error={errors.organizationName} />
        )}
        {mode === 'signup' && role === ROLES.JUDGE && (
          <Input label="Occupation" value={form.designation} onChangeText={update('designation')} error={errors.designation} />
        )}

        <Input
          label="Password"
          secureTextEntry
          value={form.password}
          onChangeText={update('password')}
          error={errors.password}
        />

        {mode === 'signup' && (
          <Input
            label="Confirm Password"
            secureTextEntry
            value={form.confirmPassword}
            onChangeText={update('confirmPassword')}
            error={errors.confirmPassword}
          />
        )}

        {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}

        <Button
          title={mode === 'login' ? 'Log In' : 'Create Account'}
          onPress={mode === 'login' ? handleLogin : handleSignup}
          loading={loading}
          style={{ marginTop: spacing.sm }}
        />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: spacing.xl, marginTop: spacing.lg },
  brand: { ...typography.h1, fontSize: 32, color: colors.primary },
  tagline: { ...typography.bodySecondary, marginTop: spacing.xs, textAlign: 'center' },

  toggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    marginBottom: spacing.lg,
  },
  toggleBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.sm, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: colors.primary },
  toggleText: { ...typography.bodySecondary, fontWeight: '600' },
  toggleTextActive: { color: '#fff' },

  roleRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  roleTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  roleTabActive: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  roleTabText: { ...typography.caption, fontWeight: '600' },
  roleTabTextActive: { color: colors.primary },

  apiError: { color: colors.danger, fontSize: 13, marginBottom: spacing.sm },
});