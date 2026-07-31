import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LayoutGrid, User as UserIcon } from 'lucide-react-native';
import { colors } from '../constants/theme';

import OrganizerDashboardScreen from '../screens/organizer/OrganizerDashboardScreen';
import CreateHackathonScreen from '../screens/organizer/CreateHackathonScreen';
import ManageHackathonScreen from '../screens/organizer/ManageHackathonScreen';
import OrganizerLeaderboardScreen from '../screens/organizer/OrganizerLeaderboardScreen';
import OrganizerProfileScreen from '../screens/organizer/OrganizerProfileScreen';

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
      <Stack.Screen name="OrganizerDashboard" component={OrganizerDashboardScreen} options={{ title: 'My Hackathons' }} />
      <Stack.Screen name="CreateHackathon" component={CreateHackathonScreen} options={{ title: 'Create Hackathon' }} />
      <Stack.Screen name="ManageHackathon" component={ManageHackathonScreen} options={{ title: 'Manage' }} />
      <Stack.Screen name="Leaderboard" component={OrganizerLeaderboardScreen} options={{ title: 'Leaderboard' }} />
    </Stack.Navigator>
  );
}

export default function OrganizerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.bgElevated, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} options={{ tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} /> }} />
      <Tab.Screen name="Profile" component={OrganizerProfileScreen} options={{ tabBarIcon: ({ color, size }) => <UserIcon color={color} size={size} /> }} />
    </Tab.Navigator>
  );
}