import { Link } from 'react-router-dom';
import { PageHeader } from '@components/ui/PageHeader';
import { markAsRead } from '@features/notifications/notificationSlice';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notifications.items);

  return (
    <>
      <PageHeader title="Notifications" subtitle="Recent alerts, appointment updates, and locker activity." />
      <section className="route-card wide-card">
        {notifications.map((notification) => (
          <Link className={`notification-item ${notification.unread ? 'unread' : ''}`} key={notification.id} onClick={() => dispatch(markAsRead(notification.id))} to={notification.route}>
            <strong>{notification.title}</strong>
            <span>{notification.message}</span>
            <small>{notification.time}</small>
          </Link>
        ))}
      </section>
    </>
  );
}
