// Theme mode state: defaults to the device's system setting, overridable by
// the user, persisted so the choice survives app restarts.
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { PALETTES, spacing, radius, buildTypography } from '../constants/theme';

const THEME_MODE_KEY = 'hackhub_theme_mode'; // stored value: 'light' | 'dark'

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const [mode, setMode] = useState(systemScheme === 'light' ? 'light' : 'dark');
  const [isReady, setIsReady] = useState(false);

  // Load any previously saved preference; falls back to system scheme if none saved.
  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync(THEME_MODE_KEY);
        if (saved === 'light' || saved === 'dark') {
          setMode(saved);
        }
      } catch (err) {
        console.warn('[ThemeContext] Failed to read saved theme, using system default:', err);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  const setThemeMode = useCallback(async (nextMode) => {
    setMode(nextMode);
    try {
      await SecureStore.setItemAsync(THEME_MODE_KEY, nextMode);
    } catch (err) {
      console.warn('[ThemeContext] Failed to persist theme choice:', err);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setThemeMode]);

  const value = useMemo(() => {
    const colors = PALETTES[mode];
    return {
      mode,
      isDark: mode === 'dark',
      colors,
      spacing,
      radius,
      typography: buildTypography(colors),
      setThemeMode,
      toggleTheme,
      isReady,
    };
  }, [mode, setThemeMode, toggleTheme, isReady]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}