'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage, LanguageCode } from '../../../providers/LanguageProvider';
import { useTheme, Theme } from '../../../providers/ThemeProvider';
import { useAccessibility } from '../../../providers/AccessibilityProvider';
import { useAuth } from '../../../providers/AuthProvider';
import { 
  Palette, 
  Languages, 
  Accessibility, 
  ArrowLeft, 
  Plus, 
  Image as ImageIcon, 
  Sparkles, 
  Eye, 
  Check, 
  X, 
  Stethoscope, 
  Pill, 
  FlaskConical, 
  Bell, 
  Volume2, 
  Smartphone,
  EyeOff
} from 'lucide-react';
import { showToast } from '../../../utils/toast';

type Category = 'visual' | 'branding' | 'homepage' | 'language' | 'accessibility' | 'notifications';

export default function SettingsPage() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useAccessibility();
  const { logSecurityEvent, currentUser } = useAuth();
  
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedLogo, setSelectedLogo] = React.useState<string>('default');
  const [iconStyle, setIconStyle] = React.useState<'glassmorphic' | '3d-gradient' | 'minimalist'>('glassmorphic');
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [previewSelection, setPreviewSelection] = React.useState<'glassmorphic' | '3d-gradient' | 'minimalist'>('glassmorphic');
  const [activeCategory, setActiveCategory] = React.useState<Category>('language');

  // Notification Toggles state
  const [notifPreferences, setNotifPreferences] = React.useState({
    push: true,
    email: true,
    sms: false,
    sound: true,
    toastStyle: 'glassmorphic'
  });

  const saveBrandingToServer = async (updates: Partial<{ selectedLogo: string; theme: string; iconStyle: string }>) => {
    try {
      await fetch('/api/abdm/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (e) {
      console.error('Failed to save branding updates to database:', e);
    }
  };

  React.useEffect(() => {
    try {
      const state = JSON.parse(localStorage.getItem('setu_state') || '{}');
      if (state.selectedLogo) {
        setSelectedLogo(state.selectedLogo);
      }
      if (state.iconStyle) {
        setIconStyle(state.iconStyle);
        setPreviewSelection(state.iconStyle);
      }
      if (state.notifications_pref) {
        setNotifPreferences(state.notifications_pref);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validCategories: Category[] = ['visual', 'branding', 'homepage', 'language', 'accessibility', 'notifications'];
      if (hash && validCategories.includes(hash as Category)) {
        const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'master_admin';
        if (['visual', 'branding', 'homepage'].includes(hash) && !isAdmin) {
          setActiveCategory('language');
          window.location.hash = 'language';
        } else {
          setActiveCategory(hash as Category);
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [currentUser]);

  React.useEffect(() => {
    if (currentUser) {
      const isAdmin = currentUser.role === 'admin' || currentUser.role === 'master_admin';
      if (!isAdmin && ['visual', 'branding', 'homepage'].includes(activeCategory)) {
        setActiveCategory('language');
        window.location.hash = 'language';
      } else if (isAdmin && activeCategory === 'language' && !window.location.hash) {
        // Default admin to visual if no hash
        setActiveCategory('visual');
      }
    }
  }, [currentUser, activeCategory]);

  const handleLogoChange = (logoPath: string) => {
    setSelectedLogo(logoPath);
    try {
      const state = JSON.parse(localStorage.getItem('setu_state') || '{}');
      state.selectedLogo = logoPath;
      localStorage.setItem('setu_state', JSON.stringify(state));
      window.dispatchEvent(new Event('setu_state_update'));
      logSecurityEvent('Logo Selection Changed', `Switched app brand logo context to ${logoPath}`);
      showToast(t('Application brand logo updated successfully.'));
      saveBrandingToServer({ selectedLogo: logoPath });
    } catch (e) {
      console.error(e);
    }
  };

  const handleIconStyleChange = (style: 'glassmorphic' | '3d-gradient' | 'minimalist') => {
    setIconStyle(style);
    try {
      const state = JSON.parse(localStorage.getItem('setu_state') || '{}');
      state.iconStyle = style;
      localStorage.setItem('setu_state', JSON.stringify(state));
      window.dispatchEvent(new Event('setu_state_update'));
      logSecurityEvent('Icon Style Changed', `Switched homepage icon style preference to ${style}`);
      showToast(t('Homepage quick-access icon style updated successfully.'));
      saveBrandingToServer({ iconStyle: style });
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
    saveBrandingToServer({ theme: newTheme });
  };

  const handleLanguageChange = (lang: LanguageCode) => {
    setLanguage(lang);
    logSecurityEvent('Language Switched', `Changed dynamic dictionary mapping to ${lang}`);
    showToast(t(`Language set to ${lang}`));
  };

  const toggleAccessibility = (key: 'highContrast' | 'largeFont' | 'screenReader' | 'motionReduction') => {
    updateSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      logSecurityEvent('Accessibility Changed', `Set accessibility ${key} to ${next[key]}`);
      showToast(t('Accessibility settings updated.'));
      return next;
    });
  };

  const updateNotifPref = (key: string, value: any) => {
    setNotifPreferences(prev => {
      const next = { ...prev, [key]: value };
      try {
        const state = JSON.parse(localStorage.getItem('setu_state') || '{}');
        state.notifications_pref = next;
        localStorage.setItem('setu_state', JSON.stringify(state));
        logSecurityEvent('Notification Pref Changed', `Updated notification ${key} to ${value}`);
        showToast(t('Notification preferences updated.'));
      } catch (e) {
        console.error(e);
      }
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
          <div className="route-card" style={{ padding: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <div className="setu-skeleton" style={{ width: '24px', height: '24px', borderRadius: '50%' }}></div>
              <div className="setu-skeleton setu-skeleton-title" style={{ width: '140px', height: '18px' }}></div>
            </div>
            <div className="setu-skeleton setu-skeleton-text" style={{ width: '70%', height: '12px', marginBottom: '12px' }}></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
              <div className="setu-skeleton setu-skeleton-button" style={{ height: '36px' }}></div>
              <div className="setu-skeleton setu-skeleton-button" style={{ height: '36px' }}></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const categories = [
    { id: 'visual' as Category, name: 'Visual Themes', icon: <Palette style={{ width: '16px', height: '16px' }} /> },
    { id: 'branding' as Category, name: 'App Branding', icon: <ImageIcon style={{ width: '16px', height: '16px' }} /> },
    { id: 'homepage' as Category, name: 'Homepage Preferences', icon: <Sparkles style={{ width: '16px', height: '16px' }} /> },
    { id: 'language' as Category, name: 'Languages Settings', icon: <Languages style={{ width: '16px', height: '16px' }} /> },
    { id: 'accessibility' as Category, name: 'Accessibility Helpers', icon: <Accessibility style={{ width: '16px', height: '16px' }} /> },
    { id: 'notifications' as Category, name: 'Notifications Channel', icon: <Bell style={{ width: '16px', height: '16px' }} /> }
  ].filter(cat => !['visual', 'branding', 'homepage'].includes(cat.id) || (currentUser?.role === 'admin' || currentUser?.role === 'master_admin'));

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
          <p>{t('Manage branding configurations, visual color themes, accessibilities, and notification preferences.')}</p>
        </div>
      </section>

      {/* Main Settings Wrapper Layout - Decoupled Sidebar / Content panels */}
      <div className="settings-modular-container" style={{ marginTop: '20px' }}>
        
        {/* Horizontal Navigation Tab-Bar scrollable for Mobile, Sidebar layout for desktop */}
        <nav className="settings-nav-bar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`settings-nav-item ${activeCategory === cat.id ? 'active-item' : ''}`}
            >
              {cat.icon}
              <span>{t(cat.name)}</span>
            </button>
          ))}
        </nav>

        {/* Content Section Panel */}
        <div className="settings-content-panel">
          
          {/* SECTION 1: VISUAL SETTINGS */}
          {activeCategory === 'visual' && (currentUser?.role === 'admin' || currentUser?.role === 'master_admin') && (
            <article className="route-card" style={{ animation: 'setu-fade-in 0.25s ease-in-out' }}>
              <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Palette style={{ color: 'var(--accent-teal)' }} />
                <h3 style={{ margin: 0 }}>{t('Visual Color Themes')}</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '16px', marginTop: 0 }}>
                {t('Choose an app theme. Your color variables preference is stored locally.')}
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                {[
                  {
                    id: 'dark-teal' as Theme,
                    name: 'Initial Theme (Default)',
                    gradient: 'linear-gradient(135deg, #00d4aa 0%, #00b4d8 100%)',
                    desc: 'Classic Deep Navy & Teal'
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
                  },
                  {
                    id: 'abdm-sandbox' as Theme,
                    name: 'ABDM Sandbox (Corporate)',
                    gradient: 'linear-gradient(135deg, #264488 0%, #d66025 100%)',
                    desc: 'NHA Blue & Saffron Orange'
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
                      boxShadow: theme === tItem.id ? '0 8px 24px color-mix(in srgb, var(--accent-teal) 15%, transparent)' : 'none',
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

              {/* Theme Preview details panel */}
              <div style={{ padding: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 750, color: 'var(--accent-teal)', display: 'block', marginBottom: '4px' }}>
                  {t('Live Theme Variable Specs:')}
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <div>Background Primary: <strong style={{ color: 'var(--text-primary)' }}>{theme === 'emerald-light' ? '#f8fafc' : '#071521'}</strong></div>
                  <div>Accent Highlight: <strong style={{ color: 'var(--accent-teal)' }}>var(--accent-teal)</strong></div>
                  <div>Container border: <strong style={{ color: 'var(--text-primary)' }}>var(--border-color)</strong></div>
                  <div>Selected Color Preset: <strong style={{ color: 'var(--accent-cyan)' }}>{theme.toUpperCase()}</strong></div>
                </div>
              </div>
            </article>
          )}

          {/* SECTION 2: BRANDING SETTINGS */}
          {activeCategory === 'branding' && (currentUser?.role === 'admin' || currentUser?.role === 'master_admin') && (
            <article className="route-card" style={{ animation: 'setu-fade-in 0.25s ease-in-out' }}>
              <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <ImageIcon style={{ color: 'var(--accent-teal)' }} />
                <h3 style={{ margin: 0 }}>{t('App Branding & Logos')}</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '16px', marginTop: 0 }}>
                {t('Configure global logo preferences and brand assets for the Ayushman Bharat Digital Bridge.')}
              </p>

              {/* Static Brand Info panel */}
              <div style={{ padding: '12px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', marginBottom: '16px', display: 'grid', gap: '4px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Product Name: <strong style={{ color: 'var(--text-primary)' }}>ABHA SETU</strong></div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Tag Line Heading: <strong style={{ color: 'var(--accent-teal)' }}>Digital Health Bridge</strong></div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Status: <strong style={{ color: 'var(--success)' }}>ABDM Landmark Verified</strong></div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                {/* Default logo option */}
                <button
                  className={`prefill-btn logo-select-card ${selectedLogo === 'default' ? 'selected-card' : ''}`}
                  onClick={() => handleLogoChange('default')}
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '10px', 
                    padding: '16px', 
                    height: 'auto', 
                    minHeight: '140px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                  }}
                >
                  <div className="logo-img-container" style={{ 
                    width: '72px', 
                    height: '72px', 
                    borderRadius: '12px', 
                    background: 'var(--bg-secondary)', 
                    border: '1.5px solid var(--border-color)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    overflow: 'hidden', 
                    padding: '2px',
                    transition: 'transform 0.3s ease, border-color 0.3s ease',
                  }}>
                    <img
                      src="/assets/logos/logo7.png"
                      alt="Default Pulse Heart Logo"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, marginTop: '4px', textAlign: 'center', color: 'var(--text-primary)' }}>Default (Pulse Heart 7)</span>
                </button>

                {/* Custom logos options */}
                {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((num) => {
                  let label = `ABHA Logo ${num}`;
                  if (num === 6) label = 'Circle Bridge (6)';
                  if (num === 7) label = 'Pulse Heart (7)';
                  if (num === 8) label = 'Minimal Check (8)';
                  if (num === 9) label = 'National Emblem Shield (9)';
                  if (num === 10) label = 'Tri-Color Gate (10)';
                  if (num === 11) label = 'Gold Crest Setu (11)';
                  if (num === 12) label = 'Secure India Shield (12)';
                  if (num === 13) label = 'Digital Setu Emblem (13)';

                  return (
                    <button
                      key={num}
                      className={`prefill-btn logo-select-card ${selectedLogo === `/assets/logos/logo${num}.png` ? 'selected-card' : ''}`}
                      onClick={() => handleLogoChange(`/assets/logos/logo${num}.png`)}
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: '10px', 
                        padding: '16px', 
                        height: 'auto', 
                        minHeight: '140px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                      }}
                    >
                      <div className="logo-img-container" style={{
                        width: '72px', 
                        height: '72px', 
                        borderRadius: '12px', 
                        background: 'var(--bg-secondary)', 
                        border: '1.5px solid var(--border-color)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        overflow: 'hidden',
                        padding: num >= 6 ? '6px' : '2px',
                        transition: 'transform 0.3s ease, border-color 0.3s ease',
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
                      <span style={{ fontSize: '11px', fontWeight: 700, marginTop: '4px', textAlign: 'center', color: 'var(--text-primary)' }}>{t(label)}</span>
                    </button>
                  );
                })}
              </div>
            </article>
          )}

          {/* SECTION 3: HOMEPAGE CUSTOMIZATION */}
          {activeCategory === 'homepage' && (currentUser?.role === 'admin' || currentUser?.role === 'master_admin') && (
            <article className="route-card" style={{ animation: 'setu-fade-in 0.25s ease-in-out' }}>
              <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles style={{ color: 'var(--accent-teal)' }} />
                  <h3 style={{ margin: 0 }}>{t('Homepage Preferences')}</h3>
                </div>
                <button
                  onClick={() => {
                    setPreviewSelection(iconStyle);
                    setIsPreviewOpen(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '8px',
                    background: 'color-mix(in srgb, var(--accent-teal) 12%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--accent-teal) 20%, transparent)',
                    color: 'var(--accent-teal)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  className="hover-glow"
                >
                  <Eye style={{ width: '13px', height: '13px' }} />
                  {t('Interactive Preview')}
                </button>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '16px', marginTop: 0 }}>
                {t('Choose a visual presentation style for the home screen quick action tiles. Double rotating rings, 3D split-gradients, or clinic minimalist templates are supported.')}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                {[
                  {
                    id: 'glassmorphic' as const,
                    name: 'Premium Glassmorphism',
                    desc: 'Frosted blur overlay with fine glowing neon borders.'
                  },
                  {
                    id: '3d-gradient' as const,
                    name: '3D Vivid Gradients',
                    desc: 'Vivid color-coded split gradient spheres.'
                  },
                  {
                    id: 'minimalist' as const,
                    name: 'Clinical Minimalist',
                    desc: 'Clean flat cards, highly clinical and clear contrast.'
                  }
                ].map((styleItem) => (
                  <button
                    key={styleItem.id}
                    className={`prefill-btn ${iconStyle === styleItem.id ? 'selected-card' : ''}`}
                    onClick={() => handleIconStyleChange(styleItem.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '16px 12px',
                      height: 'auto',
                      minHeight: '120px',
                      borderRadius: '12px',
                      border: iconStyle === styleItem.id ? '2px solid var(--accent-teal)' : '1px solid var(--border-color)',
                      background: 'var(--bg-secondary)',
                      boxShadow: iconStyle === styleItem.id ? '0 8px 24px color-mix(in srgb, var(--accent-teal) 15%, transparent)' : 'none',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    {/* Visual Representation of the Icon style inside Settings */}
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: styleItem.id === '3d-gradient' ? 'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)' : styleItem.id === 'minimalist' ? 'var(--bg-secondary)' : 'rgba(255, 255, 255, 0.03)',
                        border: styleItem.id === 'minimalist' ? '1px solid var(--border-color)' : styleItem.id === 'glassmorphic' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255,255,255,0.15)',
                        boxShadow: styleItem.id === '3d-gradient' ? '0 4px 10px rgba(0, 180, 216, 0.3)' : 'none',
                        backdropFilter: styleItem.id === 'glassmorphic' ? 'blur(6px)' : 'none',
                        color: styleItem.id === '3d-gradient' ? '#fff' : 'var(--accent-teal)'
                      }}
                    >
                      <Stethoscope style={{ width: '18px', height: '18px' }} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 750, display: 'block', color: 'var(--text-primary)' }}>{t(styleItem.name)}</span>
                      <span style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px', lineHeight: '1.2' }}>{t(styleItem.desc)}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Layout options preference grid */}
              <div style={{ padding: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 750, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                  {t('Homepage Grid Columns Layout:')}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="prefill-btn active" style={{ flex: 1, padding: '8px' }}>Compact Grid (Auto-Fit)</button>
                  <button className="prefill-btn" style={{ flex: 1, padding: '8px' }} onClick={() => showToast(t('Layout mode saved.'))}>Comfortable Cards (List)</button>
                </div>
              </div>
            </article>
          )}

          {/* SECTION 4: LANGUAGE SETTINGS */}
          {activeCategory === 'language' && (
            <article className="route-card" style={{ animation: 'setu-fade-in 0.25s ease-in-out' }}>
              <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Languages style={{ color: 'var(--accent-cyan)' }} />
                <h3 style={{ margin: 0 }}>{t('Language Preferences')}</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '12px', marginTop: 0 }}>
                {t('Translate the complete dashboard, forms, and clinical workflows instantly.')}
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
          )}

          {/* SECTION 5: ACCESSIBILITY SETTINGS */}
          {activeCategory === 'accessibility' && (
            <article className="route-card" style={{ animation: 'setu-fade-in 0.25s ease-in-out' }}>
              <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Accessibility style={{ color: 'var(--accent-teal)' }} />
                <h3 style={{ margin: 0 }}>{t('Accessibility Helpers')}</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '12px', marginTop: 0 }}>
                {t('Enable accessibility helpers for visual screen readers or high contrast variables preferences.')}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', cursor: 'pointer' }}>
                  <span>{t('High Contrast Layout')}</span>
                  <input
                    type="checkbox"
                    checked={settings.highContrast}
                    onChange={() => toggleAccessibility('highContrast')}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-teal)' }}
                  />
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', cursor: 'pointer' }}>
                  <span>{t('Enlarge Relative Typography Font')}</span>
                  <input
                    type="checkbox"
                    checked={settings.largeFont}
                    onChange={() => toggleAccessibility('largeFont')}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-teal)' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', cursor: 'pointer' }}>
                  <span>{t('Reduce Keyframes Motion & Sweeps')}</span>
                  <input
                    type="checkbox"
                    checked={!!settings.motionReduction}
                    onChange={() => toggleAccessibility('motionReduction')}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-teal)' }}
                  />
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <span>{t('Simulate Screen Reader Voice Announcements')}</span>
                  <input
                    type="checkbox"
                    checked={settings.screenReader}
                    onChange={() => toggleAccessibility('screenReader')}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-teal)' }}
                  />
                </label>
              </div>

              {/* Dynamic Font Family Picker */}
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1.5px dashed var(--border-color)' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  {t('Visual Brand Typography (Font Family)')}
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '11px', marginBottom: '12px', marginTop: 0 }}>
                  {t('Select a dynamic font typeface to customize readability. Roboto matches the ABDM Sandbox style.')}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'inter', name: 'Inter', desc: 'Modern Clean' },
                    { id: 'roboto', name: 'Roboto', desc: 'ABDM Corporate' },
                    { id: 'system', name: 'System Sans', desc: 'Classic Utility' }
                  ].map((fontItem) => (
                    <button
                      key={fontItem.id}
                      type="button"
                      onClick={() => {
                        updateSettings(prev => {
                          const next = { ...prev, fontFamily: fontItem.id as any };
                          logSecurityEvent('Font Family Changed', `Set visual font typeface family preference to ${fontItem.id}`);
                          showToast(t(`Typography set to ${fontItem.name}`));
                          return next;
                        });
                      }}
                      className={`prefill-btn ${settings.fontFamily === fontItem.id ? 'selected-card' : ''}`}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '10px 8px',
                        borderRadius: '8px',
                        border: settings.fontFamily === fontItem.id ? '2px solid var(--accent-teal)' : '1px solid var(--border-color)',
                        background: settings.fontFamily === fontItem.id ? 'color-mix(in srgb, var(--accent-teal) 5%, transparent)' : 'transparent',
                        cursor: 'pointer',
                        gap: '2px',
                        fontFamily: fontItem.id === 'roboto' ? 'Roboto, sans-serif' : fontItem.id === 'inter' ? 'Inter, sans-serif' : 'inherit'
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>{fontItem.name}</span>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{fontItem.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </article>
          )}

          {/* SECTION 6: NOTIFICATION SETTINGS */}
          {activeCategory === 'notifications' && (
            <article className="route-card" style={{ animation: 'setu-fade-in 0.25s ease-in-out' }}>
              <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Bell style={{ color: 'var(--accent-teal)' }} />
                <h3 style={{ margin: 0 }}>{t('Notification Preferences')}</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '16px', marginTop: 0 }}>
                {t('Configure dynamic toast notification visual designs, sound triggers, and push dispatch alerts.')}
              </p>

              <div style={{ display: 'grid', gap: '14px', marginBottom: '20px' }}>
                {/* Channels toggles */}
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', cursor: 'pointer' }}>
                  <span style={{ fontSize: '12px' }}>{t('Allow App Push Notifications')}</span>
                  <input
                    type="checkbox"
                    checked={notifPreferences.push}
                    onChange={(e) => updateNotifPref('push', e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-teal)' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', cursor: 'pointer' }}>
                  <span style={{ fontSize: '12px' }}>{t('Email Notifications')}</span>
                  <input
                    type="checkbox"
                    checked={notifPreferences.email}
                    onChange={(e) => updateNotifPref('email', e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-teal)' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', cursor: 'pointer' }}>
                  <span style={{ fontSize: '12px' }}>{t('SMS Alerts Integration')}</span>
                  <input
                    type="checkbox"
                    checked={notifPreferences.sms}
                    onChange={(e) => updateNotifPref('sms', e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-teal)' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', cursor: 'pointer' }}>
                  <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Volume2 style={{ width: '15px', height: '15px', color: 'var(--accent-teal)' }} />
                    {t('Sound & Vibration Feedback')}
                  </span>
                  <input
                    type="checkbox"
                    checked={notifPreferences.sound}
                    onChange={(e) => updateNotifPref('sound', e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-teal)' }}
                  />
                </label>
              </div>

              {/* Toast Style selection */}
              <div style={{ padding: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                <label style={{ display: 'grid', gap: '6px', fontSize: '12px' }}>
                  <strong>{t('System Toast Notification Design Style:')}</strong>
                  <select
                    value={notifPreferences.toastStyle}
                    onChange={(e) => updateNotifPref('toastStyle', e.target.value)}
                    style={{
                      padding: '8px 12px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="glassmorphic">Glassmorphic Glow (Premium)</option>
                    <option value="flat-minimal">Flat Minimalist (Classic)</option>
                    <option value="neon-glowing">Neon Border outline (Vivid)</option>
                  </select>
                </label>
              </div>
            </article>
          )}

        </div>

      </div>

      {/* Interactive Icon Preview Modal */}
      {isPreviewOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 7, 10, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            zIndex: 99999,
            display: 'grid',
            placeItems: 'center',
            padding: '20px',
            animation: 'setu-fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 24px 50px rgba(0,0,0,0.4)',
              position: 'relative',
              animation: 'modal-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsPreviewOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              className="hover-btn"
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>

            <h3 style={{ fontSize: '18px', margin: '0 0 4px 0', fontWeight: 800 }}>{t('Icon Presentation Style Preview')}</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 20px 0', lineHeight: 1.4 }}>
              {t('Interactive preview of how the tiles will look and interact directly on your dashboard homepage.')}
            </p>

            {/* Selector Tabs in Modal */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '20px', padding: '3px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              {(['glassmorphic', '3d-gradient', 'minimalist'] as const).map((styleOpt) => (
                <button
                  key={styleOpt}
                  onClick={() => setPreviewSelection(styleOpt)}
                  style={{
                    padding: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '8px',
                    border: 'none',
                    background: previewSelection === styleOpt ? 'var(--bg-card)' : 'transparent',
                    color: previewSelection === styleOpt ? 'var(--accent-teal)' : 'var(--text-secondary)',
                    boxShadow: previewSelection === styleOpt ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    height: 'auto',
                    minHeight: '34px'
                  }}
                >
                  {styleOpt === 'glassmorphic' && t('Glassmorphic')}
                  {styleOpt === '3d-gradient' && t('3D Gradient')}
                  {styleOpt === 'minimalist' && t('Minimalist')}
                </button>
              ))}
            </div>

            {/* Live Interactive Grid Examples */}
            <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', display: 'block', marginBottom: '12px', textAlign: 'center' }}>
                {t('Hover or Touch Tiles to test animations')}
              </span>
              
              <div className="quick-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {/* Tile 1 */}
                <div className="quick-item" style={{ minHeight: '94px', pointerEvents: 'auto' }}>
                  <div
                    className={
                      previewSelection === '3d-gradient' ? 'quick-icon-3d' :
                      previewSelection === 'minimalist' ? 'quick-icon-minimal' : 'quick-icon-glass'
                    }
                    style={
                      previewSelection === '3d-gradient' ? {
                        background: 'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)',
                        boxShadow: '0 4px 14px rgba(0, 180, 216, 0.4)'
                      } : {}
                    }
                  >
                    <Stethoscope />
                  </div>
                  <span style={{ fontSize: '9px', fontWeight: 650 }}>{t('Consult Doctor')}</span>
                </div>

                {/* Tile 2 */}
                <div className="quick-item" style={{ minHeight: '94px', pointerEvents: 'auto' }}>
                  <div
                    className={
                      previewSelection === '3d-gradient' ? 'quick-icon-3d' :
                      previewSelection === 'minimalist' ? 'quick-icon-minimal' : 'quick-icon-glass'
                    }
                    style={
                      previewSelection === '3d-gradient' ? {
                        background: 'linear-gradient(135deg, #ff4d6d 0%, #c9184a 100%)',
                        boxShadow: '0 4px 14px rgba(255, 77, 109, 0.4)'
                      } : {}
                    }
                  >
                    <Pill />
                  </div>
                  <span style={{ fontSize: '9px', fontWeight: 650 }}>{t('Order Meds')}</span>
                </div>

                {/* Tile 3 */}
                <div className="quick-item" style={{ minHeight: '94px', pointerEvents: 'auto' }}>
                  <div
                    className={
                      previewSelection === '3d-gradient' ? 'quick-icon-3d' :
                      previewSelection === 'minimalist' ? 'quick-icon-minimal' : 'quick-icon-glass'
                    }
                    style={
                      previewSelection === '3d-gradient' ? {
                        background: 'linear-gradient(135deg, #f77f00 0%, #d62828 100%)',
                        boxShadow: '0 4px 14px rgba(247, 127, 0, 0.4)'
                      } : {}
                    }
                  >
                    <FlaskConical />
                  </div>
                  <span style={{ fontSize: '9px', fontWeight: 650 }}>{t('Book Labs')}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setIsPreviewOpen(false)}
                style={{
                  padding: '10px 16px',
                  fontSize: '12px',
                  fontWeight: 700,
                  borderRadius: '8px',
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  height: 'auto',
                  minHeight: '38px'
                }}
              >
                {t('Cancel')}
              </button>
              <button
                onClick={() => {
                  handleIconStyleChange(previewSelection);
                  setIsPreviewOpen(false);
                }}
                style={{
                  padding: '10px 16px',
                  fontSize: '12px',
                  fontWeight: 700,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-cyan))',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px color-mix(in srgb, var(--accent-teal) 20%, transparent)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: 'auto',
                  minHeight: '38px'
                }}
              >
                <Check style={{ width: '14px', height: '14px' }} />
                {t('Apply Selection')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings layout styled in globals.css */}
    </>
  );
}
