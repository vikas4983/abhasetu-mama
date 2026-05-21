import { Menu, MenuItem } from '@mui/material';
import { Languages, LogOut, Moon, Settings, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { logout } from '@features/auth/authSlice';
import { setLanguage, toggleThemeMode } from '@app/store/preferencesSlice';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import type { AppLanguage } from '@/types/domain';

interface ProfileMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export function ProfileMenu({ anchorEl, onClose }: ProfileMenuProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const language = useAppSelector((state) => state.preferences.language);

  const changeLanguage = (nextLanguage: AppLanguage) => {
    dispatch(setLanguage(nextLanguage));
    void i18n.changeLanguage(nextLanguage);
    onClose();
  };

  return (
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose}>
      <div className="menu-panel">
        <MenuItem onClick={() => { navigate('/profile'); onClose(); }}>
          <UserRound className="small-icon" /> Profile
        </MenuItem>
        <MenuItem onClick={() => { navigate('/settings'); onClose(); }}>
          <Settings className="small-icon" /> Settings
        </MenuItem>
        <MenuItem onClick={() => { dispatch(toggleThemeMode()); onClose(); }}>
          <Moon className="small-icon" /> Theme Settings
        </MenuItem>
        <MenuItem onClick={() => changeLanguage(language === 'en' ? 'hi' : 'en')}>
          <Languages className="small-icon" /> {language === 'en' ? 'Hindi' : 'English'}
        </MenuItem>
        <MenuItem onClick={() => { dispatch(logout()); onClose(); }}>
          <LogOut className="small-icon" /> Logout
        </MenuItem>
      </div>
    </Menu>
  );
}
