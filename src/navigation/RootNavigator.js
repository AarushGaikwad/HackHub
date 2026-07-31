import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { View, ActivityIndicator } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/roles';
import { colors } from '../constants/theme';

import AuthStack from './AuthStack';

import ParticipantNavigator from './ParticipantNavigator';
import OrganizerNavigator from './OrganizerNavigator';
import JudgeNavigator from './JudgeNavigator';

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bgElevated,
    border: colors.border,
    primary: colors.primary,
    text: colors.textPrimary,
  },
};

const ROLE_SCREENS = {
  [ROLES.PARTICIPANT]: ParticipantNavigator,
  [ROLES.ORGANIZER]: OrganizerNavigator,
  [ROLES.JUDGE]: JudgeNavigator,
};

export default function RootNavigator() {
  const { isAuthenticated, isBootstrapping, user } = useAuth();

  if (isBootstrapping) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const RoleScreen = isAuthenticated ? ROLE_SCREENS[user?.role] : null;

  return (
    <NavigationContainer theme={navTheme}>
      {isAuthenticated && RoleScreen ? <RoleScreen /> : <AuthStack />}
    </NavigationContainer>
  );
}