/**
 * @file        uiSlice.ts
 * @description Redux Toolkit slice for managing theme, accessibility, and drawer states
 * @module      ui
 * @layer       slice
 * @author      Platform Team
 * @created     2026-06-21
 * @modified    2026-06-21
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  theme: string;
  accessibility: {
    largeFont: boolean;
    highContrast: boolean;
  };
  drawerActive: boolean;
  drawerType: 'main' | 'login' | 'create' | 'find' | null;
  flowState: string;
}

const getInitialState = (): UIState => {
  return {
    theme: 'dark-teal',
    accessibility: {
      largeFont: false,
      highContrast: false,
    },
    drawerActive: false,
    drawerType: null,
    flowState: 'menu',
  };
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState: getInitialState(),
  reducers: {
    setTheme: (state, action: PayloadAction<string>) => {
      state.theme = action.payload;
    },
    toggleLargeFont: (state) => {
      state.accessibility.largeFont = !state.accessibility.largeFont;
    },
    toggleHighContrast: (state) => {
      state.accessibility.highContrast = !state.accessibility.highContrast;
    },
    setDrawerActive: (state, action: PayloadAction<boolean>) => {
      state.drawerActive = action.payload;
    },
    setDrawerType: (state, action: PayloadAction<'main' | 'login' | 'create' | 'find' | null>) => {
      state.drawerType = action.payload;
    },
    setFlowState: (state, action: PayloadAction<string>) => {
      state.flowState = action.payload;
    },
    resetUI: (state) => {
      state.drawerActive = false;
      state.drawerType = null;
      state.flowState = 'menu';
    },
  },
});

export const {
  setTheme,
  toggleLargeFont,
  toggleHighContrast,
  setDrawerActive,
  setDrawerType,
  setFlowState,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;
