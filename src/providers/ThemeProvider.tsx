'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark-teal' | 'slate-dark' | 'ocean-blue' | 'emerald-light' | 'saffron-emerald' | 'crimson-red' | 'abdm-sandbox';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark-teal');

  useEffect(() => {
    try {
      const state = JSON.parse(localStorage.getItem('setu_state') || '{}');
      if (state.theme) {
        setThemeState(state.theme);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      const state = JSON.parse(localStorage.getItem('setu_state') || '{}');
      state.theme = newTheme;
      localStorage.setItem('setu_state', JSON.stringify(state));
    } catch (e) {
      console.error(e);
    }
  };

  const cycleTheme = () => {
    const themes: Theme[] = ['dark-teal', 'slate-dark', 'ocean-blue', 'emerald-light', 'saffron-emerald', 'crimson-red', 'abdm-sandbox'];
    const currentIdx = themes.indexOf(theme);
    const nextIdx = (currentIdx + 1) % themes.length;
    setTheme(themes[nextIdx]);
  };

  useEffect(() => {
    const body = document.body;
    body.className = body.className
      .split(' ')
      .filter((c) => !c.startsWith('theme-') && c !== 'theme-light')
      .join(' ');

    if (theme !== 'dark-teal') {
      body.classList.add(`theme-${theme}`);
    }

    if (theme === 'emerald-light' || theme === 'abdm-sandbox') {
      body.classList.add('theme-light');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
