import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
}

const initialState: AuthState = {
  isAuthenticated: true,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
      state.isAuthenticated = Boolean(action.payload) || state.isAuthenticated;
    },
    logout(state) {
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { logout, setToken } = authSlice.actions;
export default authSlice.reducer;
