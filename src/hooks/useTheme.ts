import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

export function useTheme() {
  const [themeMode, setThemeMode] = useLocalStorage<ThemeMode>('theme-mode', 'system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateTheme = () => {
      if (themeMode === 'system') {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      } else {
        setResolvedTheme(themeMode as ResolvedTheme);
      }
    };

    updateTheme();
    mediaQuery.addEventListener('change', updateTheme);
    
    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [themeMode]);

  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [resolvedTheme]);

  return {
    themeMode,
    setThemeMode,
    resolvedTheme,
    isDark: resolvedTheme === 'dark'
  };
}