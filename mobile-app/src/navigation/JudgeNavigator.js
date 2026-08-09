import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ClipboardList, Trophy, User as UserIcon } from 'lucide-react-native';
import { colors } from '../constants/theme';

import JudgeDashboardScreen from '../screens/judge/JudgeDashboardScreen';
import EvaluateSubmissionScreen from '../screens/judge/EvaluateSubmissionScreen';
import JudgeHackathonsScreen from '../screens/judge/JudgeHackathonsScreen';
import JudgeLeaderboardScreen from '../screens/judge/JudgeLeaderboardScreen';
import JudgeProfileScreen from '../screens/judge/JudgeProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.bg },
  headerTintColor: colors.textPrimary,
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.bg },
};

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="JudgeDashboard" component={JudgeDashboardScreen} options={{ title: 'Evaluations' }} />
      <Stack.Screen name="EvaluateSubmission" component={EvaluateSubmissionScreen} options={{ title: 'Evaluate' }} />
    </Stack.Navigator>
  );
}

function HackathonsStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="JudgeHackathons" component={JudgeHackathonsScreen} options={{ title: 'Hackathons' }} />
      <Stack.Screen name="Leaderboard" component={JudgeLeaderboardScreen} options={{ title: 'Leaderboard' }} />
    </Stack.Navigator>
  );
}

export default function JudgeNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.bgElevated, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} options={{ tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} /> }} />
      <Tab.Screen name="Hackathons" component={HackathonsStack} options={{ tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} /> }} />
      <Tab.Screen name="Profile" component={JudgeProfileScreen} options={{ tabBarIcon: ({ color, size }) => <UserIcon color={color} size={size} /> }} />
    </Tab.Navigator>
  );
}