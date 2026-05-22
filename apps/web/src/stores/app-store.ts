"use client";

import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Role, RouteKey } from "@/types/domain";

interface UserState {
  name: string;
  email: string;
  role: Role;
  accessToken: string;
}

interface AppState {
  route: RouteKey;
  user: UserState | null;
  language: "en" | "hi";
}

const initialState: AppState = {
  route: "dashboard",
  user: null,
  language: "en"
};

const slice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setRoute: (state, action: PayloadAction<RouteKey>) => {
      state.route = action.payload;
    },
    setUser: (state, action: PayloadAction<UserState | null>) => {
      state.user = action.payload;
    },
    setLanguage: (state, action: PayloadAction<"en" | "hi">) => {
      state.language = action.payload;
    }
  }
});

export const { setRoute, setUser, setLanguage } = slice.actions;

export const store = configureStore({
  reducer: {
    app: slice.reducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
