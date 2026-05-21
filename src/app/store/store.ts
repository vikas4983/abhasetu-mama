import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@features/auth/authSlice';
import notificationReducer from '@features/notifications/notificationSlice';
import profileReducer from '@features/profile/profileSlice';
import preferencesReducer from './preferencesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationReducer,
    preferences: preferencesReducer,
    profile: profileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: true,
      immutableCheck: true,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
