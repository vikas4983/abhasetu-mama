'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage, LanguageCode } from '../../../providers/LanguageProvider';
import { useTheme, Theme } from '../../../providers/ThemeProvider';
import { useAccessibility } from '../../../providers/AccessibilityProvider';
import { useAuth } from '../../../providers/AuthProvider';
import { Palette, Languages, Accessibility, ArrowLeft } from 'lucide-react';
import { showToast } from '../../../utils/toast';

export default function SettingsPage() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useAccessibility();
  const { logSecurityEvent } = useAuth();

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    logSecurityEvent('Theme Changed', `Switched visual layout theme to ${newTheme}`);
    showToast(t(`Switched theme to ${newTheme.replace('-', ' ').toUpperCase()}`));
  };

  const handleLanguageChange = (lang: LanguageCode) => {
    setLanguage(lang);
    logSecurityEvent('Language Switched', `Changed dynamic dictionary mapping to ${lang}`);
    showToast(t(`Language set to ${lang}`));
  };

  const toggleAccessibility = (key: 'highContrast' | 'largeFont' | 'screenReader') => {
    updateSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      logSecurityEvent('Accessibility Changed', `Set accessibility ${key} to ${next[key]}`);
      showToast(t('Accessibility settings updated.'));
      return next;
    });
  };

  return (
    <>
      {/* Route Hero Header */}
      <section className="route-hero">
        <a href="#" onClick={(e) => { e.preventDefault(); router.push('/'); }} className="back-link">
          <ArrowLeft className="small-icon" style={{ width: '14px', height: '14px', marginRight: '4px' }} />
          {t('Home')}
        </a>
        <div>
          <p className="eyebrow">ABHA SETU</p>
          <h2>{t('Settings')}</h2>
          <p>{t('Manage themes, translation languages, and access controls.')}</p>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginTop: '20px' }}>
        {/* Visual Color Themes */}
        <article className="route-card">
          <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Palette style={{ color: 'var(--accent-teal)' }} />
            <h3 style={{ margin: 0 }}>Visual Color Themes</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '12px', marginTop: 0 }}>
            Choose an app theme. Your color variables preference is stored locally.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
            <button
              className={`prefill-btn ${theme === 'dark-teal' ? 'selected-card' : ''}`}
              onClick={() => handleThemeChange('dark-teal')}
            >
              <span style={{ color: '#00d4aa', marginRight: '6px' }}>●</span> Dark Teal (Default)
            </button>
            <button
              className={`prefill-btn ${theme === 'slate-dark' ? 'selected-card' : ''}`}
              onClick={() => handleThemeChange('slate-dark')}
            >
              <span style={{ color: '#38bdf8', marginRight: '6px' }}>●</span> Slate Dark
            </button>
            <button
              className={`prefill-btn ${theme === 'ocean-blue' ? 'selected-card' : ''}`}
              onClick={() => handleThemeChange('ocean-blue')}
            >
              <span style={{ color: '#0077b6', marginRight: '6px' }}>●</span> Ocean Blue
            </button>
            <button
              className={`prefill-btn ${theme === 'emerald-light' ? 'selected-card' : ''}`}
              onClick={() => handleThemeChange('emerald-light')}
            >
              <span style={{ color: '#059669', marginRight: '6px' }}>●</span> Emerald Light
            </button>
          </div>
        </article>

        {/* Language Preferences */}
        <article className="route-card">
          <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Languages style={{ color: 'var(--accent-cyan)' }} />
            <h3 style={{ margin: 0 }}>Language Preferences</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '12px', marginTop: 0 }}>
            Translate the complete dashboard, forms, and clinical workflows instantly.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
            {(['EN', 'HI', 'TA', 'TE', 'BN', 'MR', 'GU', 'KN'] as LanguageCode[]).map((lang) => (
              <button
                key={lang}
                className={`prefill-btn ${language === lang ? 'selected-card' : ''}`}
                onClick={() => handleLanguageChange(lang)}
              >
                {lang === 'EN' && 'English (EN)'}
                {lang === 'HI' && 'हिन्दी (HI)'}
                {lang === 'TA' && 'தமிழ் (TA)'}
                {lang === 'TE' && 'తెలుగు (TE)'}
                {lang === 'BN' && 'বাংলা (BN)'}
                {lang === 'MR' && 'मराठी (MR)'}
                {lang === 'GU' && 'ગુજરાતી (GU)'}
                {lang === 'KN' && 'ಕನ್ನಡ (KN)'}
              </button>
            ))}
          </div>
        </article>

        {/* Accessibility Configurations */}
        <article className="route-card">
          <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Accessibility style={{ color: 'var(--accent-teal)' }} />
            <h3 style={{ margin: 0 }}>Accessibility Configurations</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '12px', marginTop: 0 }}>
            Enable accessibility helpers for visual screen readers or contrast preferences.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', cursor: 'pointer' }}>
              <span>High Contrast Layout</span>
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={() => toggleAccessibility('highContrast')}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-teal)' }}
              />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', cursor: 'pointer' }}>
              <span>Enlarge Relative Typography Font</span>
              <input
                type="checkbox"
                checked={settings.largeFont}
                onChange={() => toggleAccessibility('largeFont')}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-teal)' }}
              />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <span>Simulate Screen Reader Voice Announcements</span>
              <input
                type="checkbox"
                checked={settings.screenReader}
                onChange={() => toggleAccessibility('screenReader')}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-teal)' }}
              />
            </label>
          </div>
        </article>
      </div>
    </>
  );
}
