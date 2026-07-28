// Auth-side navigation. Only one real screen (AuthScreen handles both
// Login and Sign-up via an internal toggle) — kept as a stack in case you
// need to push something on top later (e.g. "Forgot Password").
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../constants/theme';
import AuthScreen from '../screens/auth/AuthScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
    </Stack.Navigator>
  );
}