'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface AccessibilitySettings {
  highContrast: boolean;
  largeFont: boolean;
  screenReader: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (updater: (prev: AccessibilitySettings) => AccessibilitySettings) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const DEFAULT_ACCESSIBILITY: AccessibilitySettings = {
  highContrast: false,
  largeFont: false,
  screenReader: false,
};

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_ACCESSIBILITY);

  useEffect(() => {
    try {
      const state = JSON.parse(localStorage.getItem('setu_state') || '{}');
      if (state.accessibility) {
        setSettings(state.accessibility);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const updateSettings = (updater: (prev: AccessibilitySettings) => AccessibilitySettings) => {
    setSettings((prev) => {
      const next = updater(prev);
      try {
        const state = JSON.parse(localStorage.getItem('setu_state') || '{}');
        state.accessibility = next;
        localStorage.setItem('setu_state', JSON.stringify(state));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  useEffect(() => {
    const body = document.body;
    
    if (settings.largeFont) {
      body.classList.add('accessibility-large-font');
    } else {
      body.classList.remove('accessibility-large-font');
    }

    if (settings.highContrast) {
      body.classList.add('accessibility-high-contrast');
    } else {
      body.classList.remove('accessibility-high-contrast');
    }
  }, [settings]);

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
