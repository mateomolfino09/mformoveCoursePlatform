'use client';

import { useEffect, useState } from 'react';

export const ADMIN_THEME_KEY = 'mmove-admin-theme';
export type AdminTheme = 'light' | 'dark';

export function useAdminTheme() {
  const [theme, setThemeState] = useState<AdminTheme>('light');

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(ADMIN_THEME_KEY);
      if (stored === 'dark' || stored === 'light') {
        setThemeState(stored);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setTheme = (next: AdminTheme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(ADMIN_THEME_KEY, next);
    } catch {
      /* ignore */
    }
  };

  return { theme, setTheme };
}
