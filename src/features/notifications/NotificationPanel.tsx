import { Menu } from '@mui/material';
import { Link } from 'react-router-dom';
import { markAllAsRead, markAsRead } from './notificationSlice';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';

interface NotificationPanelProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export function NotificationPanel({ anchorEl, onClose }: NotificationPanelProps) {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notifications.items);

  return (
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose}>
      <div className="menu-panel notification-panel">
        <button className="back-link" onClick={() => dispatch(markAllAsRead())} type="button">
          Mark all as read
        </button>
        {notifications.map((notification) => (
          <Link
            className={`notification-item ${notification.unread ? 'unread' : ''}`}
            key={notification.id}
            onClick={() => {
              dispatch(markAsRead(notification.id));
              onClose();
            }}
            to={notification.route}
          >
            <strong>{notification.title}</strong>
            <span>{notification.message}</span>
            <small>{notification.time}</small>
          </Link>
        ))}
        <Link className="notification-item" onClick={onClose} to="/notifications">
          View notification center
        </Link>
      </div>
    </Menu>
  );
}
