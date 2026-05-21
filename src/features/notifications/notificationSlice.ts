import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { notifications as seedNotifications } from '@/constants/data';
import type { NotificationItem } from '@/types/domain';

interface NotificationsState {
  items: NotificationItem[];
}

const initialState: NotificationsState = {
  items: seedNotifications,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    markAsRead(state, action: PayloadAction<string>) {
      const item = state.items.find((notification) => notification.id === action.payload);
      if (item) item.unread = false;
    },
    markAllAsRead(state) {
      state.items.forEach((notification) => {
        notification.unread = false;
      });
    },
  },
});

export const { markAllAsRead, markAsRead } = notificationSlice.actions;
export default notificationSlice.reducer;
