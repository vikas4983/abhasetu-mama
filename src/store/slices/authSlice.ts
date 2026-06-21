/**
 * @file        authSlice.ts
 * @description Redux Toolkit slice for managing user session authentication and ABHA profiles
 * @module      auth
 * @layer       slice
 * @author      Platform Team
 * @created     2026-06-21
 * @modified    2026-06-21
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AbhaAccount {
  preferredAbhaAddress: string;
  ABHANumber: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  profilePhoto?: string;
  mobile: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  activeProfile: AbhaAccount | null;
  availableProfiles: AbhaAccount[];
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  activeProfile: null,
  availableProfiles: [],
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ token: string; profile: AbhaAccount }>) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.activeProfile = action.payload.profile;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.activeProfile = null;
      state.availableProfiles = [];
    },
    setActiveProfile: (state, action: PayloadAction<AbhaAccount | null>) => {
      state.activeProfile = action.payload;
    },
    setAvailableProfiles: (state, action: PayloadAction<AbhaAccount[]>) => {
      state.availableProfiles = action.payload;
    },
  },
});

export const {
  loginSuccess,
  logout,
  setActiveProfile,
  setAvailableProfiles,
} = authSlice.actions;

export default authSlice.reducer;
