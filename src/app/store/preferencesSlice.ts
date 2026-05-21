import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '@/constants/app';
import type { AppLanguage, ThemeMode } from '@/types/domain';

interface PreferencesState {
  themeMode: ThemeMode;
  language: AppLanguage;
  palette: 'default' | 'cyan' | 'emerald';
}

const initialState: PreferencesState = {
  themeMode: (localStorage.getItem(STORAGE_KEYS.themeMode) as ThemeMode | null) ?? 'dark',
  language: (localStorage.getItem(STORAGE_KEYS.language) as AppLanguage | null) ?? 'en',
  palette: 'default',
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.themeMode = action.payload;
      localStorage.setItem(STORAGE_KEYS.themeMode, action.payload);
    },
    toggleThemeMode(state) {
      state.themeMode = state.themeMode === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEYS.themeMode, state.themeMode);
    },
    setLanguage(state, action: PayloadAction<AppLanguage>) {
      state.language = action.payload;
      localStorage.setItem(STORAGE_KEYS.language, action.payload);
    },
    setPalette(state, action: PayloadAction<PreferencesState['palette']>) {
      state.palette = action.payload;
    },
  },
});

export const { setLanguage, setPalette, setThemeMode, toggleThemeMode } = preferencesSlice.actions;
export default preferencesSlice.reducer;
