import { Badge } from '@mui/material';
import { Bell, ChevronDown, Plus } from 'lucide-react';
import { MouseEvent, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ServiceSearch } from './ServiceSearch';
import { NotificationPanel } from '@features/notifications/NotificationPanel';
import { ProfileMenu } from '@features/profile/ProfileMenu';
import { APP_NAME, APP_TAGLINE, profileImageUrl } from '@/constants/app';
import { setLanguage } from '@app/store/preferencesSlice';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';

export const AppHeader = memo(function AppHeader() {
  const dispatch = useAppDispatch();
  const { i18n } = useTranslation();
  const unreadCount = useAppSelector((state) => state.notifications.items.filter((item) => item.unread).length);
  const language = useAppSelector((state) => state.preferences.language);
  const [notificationAnchor, setNotificationAnchor] = useState<HTMLElement | null>(null);
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);

  return (
    <header className="header">
      <Link className="logo" to="/" aria-label={`${APP_NAME} home`}>
        <div className="logo-icon">
          <Plus className="logo-plus" aria-hidden="true" />
        </div>
        <div className="logo-text">
          <h1>{APP_NAME}</h1>
          <span>{APP_TAGLINE}</span>
        </div>
      </Link>
      <ServiceSearch />
      <div className="header-actions">
        <button
          className="lang-selector"
          type="button"
          aria-label="Toggle language"
          onClick={() => {
            const nextLanguage = language === 'en' ? 'hi' : 'en';
            dispatch(setLanguage(nextLanguage));
            void i18n.changeLanguage(nextLanguage);
          }}
        >
          <span>{language.toUpperCase()}</span>
          <ChevronDown className="chevron-icon" aria-hidden="true" />
        </button>
        <button
          className="notification"
          onClick={(event: MouseEvent<HTMLButtonElement>) => setNotificationAnchor(event.currentTarget)}
          type="button"
          aria-label="Open notifications"
        >
          <Badge badgeContent={unreadCount} color="error">
            <Bell className="bell-icon" aria-hidden="true" />
          </Badge>
        </button>
        <button
          className="avatar"
          onClick={(event: MouseEvent<HTMLButtonElement>) => setProfileAnchor(event.currentTarget)}
          type="button"
          aria-label="Open profile menu"
        >
          <img src={profileImageUrl} alt="" />
          <span className="avatar-status" />
        </button>
      </div>
      <NotificationPanel anchorEl={notificationAnchor} onClose={() => setNotificationAnchor(null)} />
      <ProfileMenu anchorEl={profileAnchor} onClose={() => setProfileAnchor(null)} />
    </header>
  );
});
