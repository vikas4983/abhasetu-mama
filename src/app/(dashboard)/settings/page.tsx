'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage, LanguageCode } from '../../../providers/LanguageProvider';
import { useTheme, Theme } from '../../../providers/ThemeProvider';
import { useAccessibility } from '../../../providers/AccessibilityProvider';
import { useAuth } from '../../../providers/AuthProvider';
import { Palette, Languages, Accessibility, ArrowLeft, Plus, Image as ImageIcon } from 'lucide-react';
import { showToast } from '../../../utils/toast';

export default function SettingsPage() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useAccessibility();
  const { logSecurityEvent } = useAuth();
  
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedLogo, setSelectedLogo] = React.useState<string>('default');

  React.useEffect(() => {
    try {
      const state = JSON.parse(localStorage.getItem('setu_state') || '{}');
      if (state.selectedLogo) {
        setSelectedLogo(state.selectedLogo);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleLogoChange = (logoPath: string) => {
    setSelectedLogo(logoPath);
    try {
      const state = JSON.parse(localStorage.getItem('setu_state') || '{}');
      state.selectedLogo = logoPath;
      localStorage.setItem('setu_state', JSON.stringify(state));
      window.dispatchEvent(new Event('setu_state_update'));
      logSecurityEvent('Logo Selection Changed', `Switched app brand logo context to ${logoPath}`);
      showToast(t('Application brand logo updated successfully.'));
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

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

  if (isLoading) {
    return (
      <>
        {/* Shimmering settings skeleton on mount */}
        <section className="route-hero">
          <div className="setu-skeleton setu-skeleton-text" style={{ width: '80px', height: '14px', marginBottom: '8px' }}></div>
          <div className="setu-skeleton setu-skeleton-title" style={{ width: '180px', height: '24px', marginBottom: '8px' }}></div>
          <div className="setu-skeleton setu-skeleton-text" style={{ width: '280px', height: '14px' }}></div>
        </section>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginTop: '20px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="route-card" style={{ padding: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <div className="setu-skeleton" style={{ width: '24px', height: '24px', borderRadius: '50%' }}></div>
                <div className="setu-skeleton setu-skeleton-title" style={{ width: '140px', height: '18px' }}></div>
              </div>
              <div className="setu-skeleton setu-skeleton-text" style={{ width: '70%', height: '12px', marginBottom: '12px' }}></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                <div className="setu-skeleton setu-skeleton-button" style={{ height: '36px' }}></div>
                <div className="setu-skeleton setu-skeleton-button" style={{ height: '36px' }}></div>
                <div className="setu-skeleton setu-skeleton-button" style={{ height: '36px' }}></div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
            {[
              {
                id: 'dark-teal' as Theme,
                name: 'Dark Teal',
                gradient: 'linear-gradient(135deg, #00d4aa 0%, #00b4d8 100%)',
                desc: 'Deep Navy & Teal'
              },
              {
                id: 'slate-dark' as Theme,
                name: 'Slate Dark',
                gradient: 'linear-gradient(135deg, #38bdf8 0%, #1e293b 100%)',
                desc: 'Slate & Sky Blue'
              },
              {
                id: 'ocean-blue' as Theme,
                name: 'Ocean Blue',
                gradient: 'linear-gradient(135deg, #0077b6 0%, #03045e 100%)',
                desc: 'Deep Sea & Cyan'
              },
              {
                id: 'emerald-light' as Theme,
                name: 'Emerald Light',
                gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                desc: 'Crisp Mint & Forest'
              },
              {
                id: 'saffron-emerald' as Theme,
                name: 'Saffron Emerald',
                gradient: 'linear-gradient(135deg, #fa7a19 0%, #019443 100%)',
                desc: 'Saffron & Emerald'
              }
            ].map((tItem) => (
              <button
                key={tItem.id}
                className={`prefill-btn ${theme === tItem.id ? 'selected-card' : ''}`}
                onClick={() => handleThemeChange(tItem.id)}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '16px 12px', 
                  height: 'auto', 
                  minHeight: '120px',
                  borderRadius: '12px',
                  border: theme === tItem.id ? '2px solid var(--accent-teal)' : '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  boxShadow: theme === tItem.id ? '0 8px 24px rgba(0, 212, 170, 0.15)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                {/* Big Visual Color Box */}
                <div 
                  style={{ 
                    width: '52px', 
                    height: '52px', 
                    borderRadius: '12px', 
                    background: tItem.gradient, 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {/* Subtle glass overlay inside color block */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '50%',
                    background: 'rgba(255, 255, 255, 0.15)',
                    transform: 'skewY(-15deg)',
                    transformOrigin: 'top left'
                  }} />
                  {theme === tItem.id && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      boxShadow: '0 0 8px #fff'
                    }} />
                  )}
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 750, display: 'block', color: 'var(--text-primary)' }}>
                    {t(tItem.name)}
                  </span>
                  <span style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                    {t(tItem.desc)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </article>

        {/* Branding Logo Selector */}
        <article className="route-card">
          <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <ImageIcon style={{ color: 'var(--accent-teal)' }} />
            <h3 style={{ margin: 0 }}>App Branding & Logo Selector</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '16px', marginTop: 0 }}>
            Select your preferred application branding logo style. Prefills sync across dynamic headers.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
            {/* Default logo option */}
            <button
              className={`prefill-btn ${selectedLogo === 'default' ? 'selected-card' : ''}`}
              onClick={() => handleLogoChange('default')}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '10px', height: 'auto', minHeight: '100px' }}
            >
              <div style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-cyan))' }}>
                <Plus style={{ width: '18px', height: '18px', color: '#fff' }} />
              </div>
              <span style={{ fontSize: '10.5px', fontWeight: 650, marginTop: '4px' }}>Default Brand Icon</span>
            </button>

            {/* Custom logos options */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
              let label = `ABHA Logo ${num}`;
              if (num === 6) label = 'Circle Bridge (6)';
              if (num === 7) label = 'Pulse Heart (7)';
              if (num === 8) label = 'Minimal Check (8)';

              return (
                <button
                  key={num}
                  className={`prefill-btn ${selectedLogo === `/assets/logos/logo${num}.png` ? 'selected-card' : ''}`}
                  onClick={() => handleLogoChange(`/assets/logos/logo${num}.png`)}
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '8px', 
                    padding: '10px', 
                    height: 'auto', 
                    minHeight: '100px'
                  }}
                >
                  <div style={{
                    width: '38px', 
                    height: '38px', 
                    borderRadius: '50%', 
                    background: 'var(--bg-secondary)', 
                    border: '1px solid var(--border-color)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    overflow: 'hidden',
                    padding: num >= 6 ? '2px' : '0'
                  }}>
                    <img
                      src={`/assets/logos/logo${num}.png`}
                      alt={`Logo ${num}`}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '10.5px', fontWeight: 650, marginTop: '4px', textAlign: 'center' }}>{t(label)}</span>
                </button>
              );
            })}
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
