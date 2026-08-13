import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import * as authApi from '../api/authApi';
import { saveToken, saveUser, getToken, getUser, clearAuth } from '../utils/storage';
import { setUnauthorizedHandler } from '../api/client';

const AuthContext = createContext(null);
 
export function AuthProvider({ children }) {
  // user shape mirrors LoginResponseDto minus the token:
  // { userId, name, email, role, status }
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
 
  // Restore session on cold start so the user isn't logged out every reload.
  useEffect(() => {
    (async () => {
      const [storedToken, storedUser] = await Promise.all([getToken(), getUser()]);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
      setIsBootstrapping(false);
    })();
  }, []);
 
  // If any API call gets a 401, api/client.js calls this to force logout.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setToken(null);
    });
  }, []);
 
  const login = useCallback(async (email, password) => {
    // LoginResponseDto: { token, userId, name, email, role, status }
    const data = await authApi.login(email, password);

    console.log('LOGIN RESPONSE:', data);
    console.log('LOGIN TOKEN EXISTS:', !!data?.token);
 
    const resolvedUser = {
      userId: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status, // e.g. organizer PENDING vs APPROVED
    };
 
    await saveToken(data.token);
    await saveUser(resolvedUser);
    setToken(data.token);
    setUser(resolvedUser);
 
    return resolvedUser;
  }, []);
 
  const logout = useCallback(async () => {
    await clearAuth();
    setUser(null);
    setToken(null);
  }, []);
 
  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      isBootstrapping,
      login,
      logout,
    }),
    [user, token, isBootstrapping, login, logout]
  );
 
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
 
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}