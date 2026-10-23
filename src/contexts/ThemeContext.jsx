import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_THEME, STORAGE_KEYS } from '@/constants/storage';
import { readString, writeString } from '@/utils/storage';

export const ThemeContext = createContext(null);

function getSystemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return DEFAULT_THEME;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveInitialTheme() {
  return readString(STORAGE_KEYS.theme, null) ?? getSystemTheme();
}

function applyTheme(theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(resolveInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    writeString(STORAGE_KEYS.theme, theme);
  }, [theme]);

  const setTheme = useCallback((next) => {
    setThemeState(next === 'dark' ? 'dark' : 'light');
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(
    () => ({ theme, isDark: theme === 'dark', setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
