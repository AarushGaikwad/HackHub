import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { View, ActivityIndicator } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/roles';
import { colors } from '../constants/theme';

import AuthStack from './AuthStack';

import ParticipantHomeScreen from '../screens/participant/ParticipantHomeScreen';
import OrganizerHomeScreen from '../screens/organizer/OrganizerHomeScreen';
import JudgeHomeScreen from '../screens/judge/JudgeHomeScreen';

const ROLE_SCREENS = {
  [ROLES.PARTICIPANT]: ParticipantHomeScreen,
  [ROLES.ORGANIZER]: OrganizerHomeScreen,
  [ROLES.JUDGE]: JudgeHomeScreen,
};

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

export default function RootNavigator() {
  const { isAuthenticated, isBootstrapping, user } = useAuth();

  if (isBootstrapping) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const RoleScreen = isAuthenticated
    ? ROLE_SCREENS[user?.role]
    : null;

  return (
    <NavigationContainer theme={navTheme}>
      {isAuthenticated && RoleScreen ? <RoleScreen /> : <AuthStack />}
    </NavigationContainer>
  );
}