import { Calendar, FileText, Grid3X3, HeartPulse, Home } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

const navItems = [
  { labelKey: 'navigation.home', to: '/', icon: Home },
  { labelKey: 'navigation.health', to: '/health', icon: HeartPulse },
  { labelKey: 'navigation.appointments', to: '/appointments', icon: Calendar },
  { labelKey: 'navigation.records', to: '/records', icon: FileText },
  { labelKey: 'navigation.more', to: '/more', icon: Grid3X3 },
];

export const AppNavigation = memo(function AppNavigation() {
  const { t } = useTranslation();

  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink className="nav-item" key={item.to} to={item.to} end={item.to === '/'}>
            <Icon className="nav-icon" aria-hidden="true" />
            <span>{t(item.labelKey)}</span>
          </NavLink>
        );
      })}
    </nav>
  );
});
