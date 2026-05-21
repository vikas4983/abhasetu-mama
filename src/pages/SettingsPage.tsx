import { PageHeader } from '@components/ui/PageHeader';
import { setLanguage, toggleThemeMode } from '@app/store/preferencesSlice';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import type { AppLanguage } from '@/types/domain';

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const preferences = useAppSelector((state) => state.preferences);

  return (
    <>
      <PageHeader title="Settings" subtitle="Theme, language, account, and global preference controls." />
      <section className="route-grid service-grid">
        <article className="route-card"><h3>Theme Settings</h3><p>Current mode: {preferences.themeMode}</p><button className="primary-action" onClick={() => dispatch(toggleThemeMode())} type="button">Toggle Theme</button></article>
        <article className="route-card"><h3>Language Settings</h3><p>Current language: {preferences.language.toUpperCase()}</p><div className="pill-row"><button className="back-link" onClick={() => dispatch(setLanguage('en' as AppLanguage))} type="button">English</button><button className="back-link" onClick={() => dispatch(setLanguage('hi' as AppLanguage))} type="button">Hindi</button></div></article>
      </section>
    </>
  );
}
