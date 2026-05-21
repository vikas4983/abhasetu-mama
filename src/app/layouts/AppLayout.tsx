import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppHeader } from '@components/navigation/AppHeader';
import { AppNavigation } from '@components/navigation/AppNavigation';
import { useAppSelector } from '@app/store/hooks';

export function AppLayout() {
  const themeMode = useAppSelector((state) => state.preferences.themeMode);
  const location = useLocation();

  useEffect(() => {
    document.body.dataset.theme = themeMode;
  }, [themeMode]);

  return (
    <div className="app">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <AppHeader />
      <main className={location.pathname === '/' ? 'home-shell' : 'route-shell'} id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <AppNavigation />
    </div>
  );
}
