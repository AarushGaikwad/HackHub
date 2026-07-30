import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Compass, Users, Award, User as UserIcon } from 'lucide-react-native';
import { colors } from '../constants/theme';

import BrowseHackathonsScreen from '../screens/participant/BrowseHackathonsScreen';
import HackathonDetailScreen from '../screens/participant/HackathonDetailScreen';
import MyTeamScreen from '../screens/participant/MyTeamScreen';
import CreateTeamScreen from '../screens/participant/CreateTeamScreen';
import JoinTeamScreen from '../screens/participant/JoinTeamScreen';
import TeamMembersScreen from '../screens/participant/TeamMembersScreen';
import TeamRegistrationsScreen from '../screens/participant/TeamRegistrationsScreen';
import TeamSubmissionsScreen from '../screens/participant/TeamSubmissionsScreen';
import SubmitProgressScreen from '../screens/participant/SubmitProgressScreen';
import SubmitFinalScreen from '../screens/participant/SubmitFinalScreen';
import CertificatesScreen from '../screens/participant/CertificatesScreen';
import ProfileScreen from '../screens/participant/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.bg },
  headerTintColor: colors.textPrimary,
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.bg },
};

function BrowseStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="BrowseHackathons" component={BrowseHackathonsScreen} options={{ title: 'Browse' }} />
      <Stack.Screen name="HackathonDetail" component={HackathonDetailScreen} options={{ title: 'Hackathon' }} />
      <Stack.Screen name="CreateTeam" component={CreateTeamScreen} options={{ title: 'Create Team' }} />
    </Stack.Navigator>
  );
}

function MyTeamStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="MyTeamTab" component={MyTeamScreen} options={{ title: 'My Team' }} />
      <Stack.Screen name="CreateTeam" component={CreateTeamScreen} options={{ title: 'Create Team' }} />
      <Stack.Screen name="JoinTeam" component={JoinTeamScreen} options={{ title: 'Join Team' }} />
      <Stack.Screen name="TeamMembers" component={TeamMembersScreen} options={{ title: 'Members' }} />
      <Stack.Screen name="TeamRegistrations" component={TeamRegistrationsScreen} options={{ title: 'Your Hackathons' }} />
      <Stack.Screen name="TeamSubmissions" component={TeamSubmissionsScreen} options={{ title: 'Submissions' }} />
      <Stack.Screen name="SubmitProgress" component={SubmitProgressScreen} options={{ title: 'Progress Update' }} />
      <Stack.Screen name="SubmitFinal" component={SubmitFinalScreen} options={{ title: 'Final Submission' }} />
    </Stack.Navigator>
  );
}

export default function ParticipantNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.bgElevated, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen name="Browse" component={BrowseStack} options={{ tabBarIcon: ({ color, size }) => <Compass color={color} size={size} /> }} />
      <Tab.Screen name="MyTeam" component={MyTeamStack} options={{ tabBarLabel: 'My Team', tabBarIcon: ({ color, size }) => <Users color={color} size={size} /> }} />
      <Tab.Screen name="Certificates" component={CertificatesScreen} options={{ tabBarIcon: ({ color, size }) => <Award color={color} size={size} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color, size }) => <UserIcon color={color} size={size} /> }} />
    </Tab.Navigator>
  );
}