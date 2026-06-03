'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, User as UserType } from '../../providers/AuthProvider';
import { useLanguage, LanguageCode } from '../../providers/LanguageProvider';
import { useTheme } from '../../providers/ThemeProvider';
import { showToast } from '../../utils/toast';
import {
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  User,
  Palette,
  Languages,
  ShieldCheck,
  Accessibility,
  X,
  Code,
  Stethoscope,
  Pill,
  FlaskConical,
  Building,
  GraduationCap,
  HeartHandshake,
  Activity,
  HeartPulse,
  BrainCircuit,
  Ambulance,
  Droplet,
  QrCode,
  FolderLock,
  Video,
  UserRound,
  FileText
} from 'lucide-react';

interface SearchItem {
  type: string;
  title: string;
  route: string;
  icon: string;
  desc: string;
}

export default function Header() {
  const { currentUser, logout, notifications, records, appointments, clearNotifications, deleteNotification, markNotificationRead } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, cycleTheme } = useTheme();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchMatches, setSearchMatches] = useState<SearchItem[]>([]);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState<string>('default');

  // Synchronize logo changes in real-time
  useEffect(() => {
    const checkLogo = () => {
      try {
        const state = JSON.parse(localStorage.getItem('setu_state') || '{}');
        if (state.selectedLogo) {
          setSelectedLogo(state.selectedLogo);
        } else {
          setSelectedLogo('default');
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkLogo();
    window.addEventListener('storage', checkLogo);
    window.addEventListener('setu_state_update', checkLogo);
    return () => {
      window.removeEventListener('storage', checkLogo);
      window.removeEventListener('setu_state_update', checkLogo);
    };
  }, []);

  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchActive(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync state data for search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchMatches([]);
      return;
    }

    const q = query.toLowerCase();

    // Load custom records, appointments, and doctors dynamically
    let dynamicItems: SearchItem[] = [];
    if (records && Array.isArray(records)) {
      records.forEach((r: any) => {
        dynamicItems.push({
          type: "Health Records Locker",
          title: r.name || r.title,
          route: "records",
          icon: "file-text",
          desc: `Linked clinical record from ${r.source || 'Vault'} | Date: ${r.date || ''}`
        });
      });
    }
    if (appointments && Array.isArray(appointments)) {
      appointments.forEach((a: any) => {
        const docName = a.doctorName || a.doctor || 'Physician';
        dynamicItems.push({
          type: "Appointments Roster",
          title: `Consultation with ${docName}`,
          route: "appointments",
          icon: "video",
          desc: `Scheduled: ${a.meta || a.date || ''} at ${a.time || ''} | Status: ${a.status || 'Confirmed'}`
        });
      });
    }
    try {
      const storedHpr = localStorage.getItem('hpr_registered_doctors');
      if (storedHpr) {
        const hprList = JSON.parse(storedHpr);
        if (Array.isArray(hprList)) {
          hprList.forEach((doc: any) => {
            dynamicItems.push({
              type: "Doctors (HPR Verified)",
              title: doc.name || doc.doctorName,
              route: "appointments",
              icon: "user-round",
              desc: `${doc.specialization || doc.role || 'Practitioner'} | HPR ID: ${doc.hprId || doc.id || ''}`
            });
          });
        }
      }
    } catch (e) {
      console.error("Failed to read search dynamic elements:", e);
    }

    // Replicate original search matches database
    const searchableItems: SearchItem[] = [
      { type: "Services", title: "ABHA Card", route: "abha", icon: "id-card", desc: "Create, view, download or verify ABHA Card." },
      { type: "Services", title: "Digital Locker", route: "records", icon: "folder-lock", desc: "Access clinical records, consent history, and decrypted bundles." },
      { type: "Services", title: "Health Dashboard", route: "health", icon: "activity", desc: "Real-time vitals, SpO2, heart rate, blood pressure, and Health ATM metrics." },
      { type: "Services", title: "QR Code Scanner", route: "qr-scanner", icon: "qr-code", desc: "Scan HFR hospital QR codes for instant OPD registrations." },
      { type: "Services", title: "About Us", route: "about", icon: "graduation-cap", desc: "Learn about Abha Setu and ABDM integration mission." },
      { type: "Services", title: "Order Medicines", route: "more", icon: "pill", desc: "Browse OTC/Prescription medicines, add to cart." },
      { type: "Services", title: "Book Lab Tests", route: "more", icon: "flask-conical", desc: "Book NABL diagnostics, check slots, and sync ABHA." },
      { type: "Services", title: "Hospitals Registry", route: "connected", icon: "building-2", desc: "Verified HFR hospitals directory, check-in queues." },
      { type: "Services", title: "Blood Bank Directory", route: "more", icon: "droplet", desc: "Check blood units availability, request or donate blood." },
      { type: "Services", title: "Organ Donation Pledge", route: "more", icon: "heart-handshake", desc: "Submit organ transplant pledge, download NHA certificate." },
      { type: "Services", title: "Connected Facilities", route: "connected", icon: "building", desc: "Scan and share at active hospitals and diagnostics." },
      { type: "Services", title: "Security Dashboard", route: "security", icon: "shield-check", desc: "Check role permissions, token logs, security credentials." },
      { type: "Services", title: "ABDM Sandbox API Documentation", route: "sandbox", icon: "code", desc: "Interactive developer documentation, live playground network test runners." },
      { type: "Services", title: "Theme Switching", route: "settings", icon: "palette", desc: "Choose color themes." },
      { type: "Services", title: "Accessibility Settings", route: "settings", icon: "accessibility", desc: "Font sizes, screen reader, high contrast options." },
      { type: "Services", title: "Language Preferences", route: "settings", icon: "languages", desc: "Select multilingual preferences." },
      { type: "Services", title: "Telemedicine Room", route: "appointments", icon: "video", desc: "Enter private virtual health appointment room." },
      { type: "Hospitals", title: "Janki Raman Hospital & Critical Care Centre, Jabalpur", route: "connected", icon: "building-2", desc: "HFR: IN2310026968 | Gurudev Colony, Jabalpur" },
      { type: "Hospitals", title: "DR AYESHAH HOMEO HEALTH MALL, Bhopal", route: "connected", icon: "heart-pulse", desc: "HFR: IN2310026365 | Bhopal, Madhya Pradesh, India" },
      { type: "Doctors", title: "Dr. Ayesha Ali", route: "appointments", icon: "user-round", desc: "Senior Homeopathy Consultant & Telehealth Lead | 35 yrs exp" },
      { type: "Doctors", title: "Dr. Yogyata Mukhraiya", route: "appointments", icon: "user-round", desc: "Chronic Diseases and Female Problems Specialist | 12 yrs exp" },
      { type: "Doctors", title: "Amitendu Giradonia", route: "appointments", icon: "user-round", desc: "Homeopathy and Primary Care Specialist | 18 yrs exp" },
      { type: "Blood Donors", title: "Ashish Patel (B+)", route: "more", icon: "user-round", desc: "Age: 33 Years | Contact: 9981435702 | Last: 3 months ago" },
      { type: "Blood Donors", title: "Anant Agrahri (B+)", route: "more", icon: "user-round", desc: "Age: 32 Years | Contact: 9977756362 | Last: 3 months ago" },
      { type: "Medicines", title: "Paracetamol 650mg", route: "more", icon: "pill", desc: "Price: ₹40 | For relief of fever and mild to moderate pain." },
      { type: "Medicines", title: "Amoxicillin 500mg", route: "more", icon: "pill", desc: "Price: ₹120 | Broad-spectrum antibiotic for bacterial infections." },
      { type: "Courses", title: "First Aid Certification Course", route: "more", icon: "graduation-cap", desc: "CPR training and basic life support certificate." },
      { type: "Courses", title: "ABDM Integration Training", route: "more", icon: "graduation-cap", desc: "Training for health facilities to integrate under Ayushman Bharat." },
      { type: "Insurance", title: "Ayushman Bharat PM-JAY Policy", route: "records", icon: "shield-check", desc: "Verify eligibility and link PM-JAY insurance cards." },
      { type: "Labs", title: "ECG Diagnostic Screening", route: "more", icon: "activity", desc: "Diagnostic lab slot for heart screening scans." },
      { type: "Labs", title: "NABL Pathology Lab Tests", route: "more", icon: "flask-conical", desc: "NABL certified blood tests and sample collection." },
      { type: "Departments", title: "Cardiology Department", route: "connected", icon: "heart-pulse", desc: "Heart health specialist consultations, cardiology clinic." },
      { type: "Emergency Services", title: "Emergency Ambulance Booking", route: "more", icon: "ambulance", desc: "Simulated rapid ambulance dispatch and tracking." }
    ].concat(dynamicItems);

    const matches = searchableItems
      .filter((item) => `${item.title} ${item.desc} ${item.type}`.toLowerCase().includes(q))
      .slice(0, 10);

    setSearchMatches(matches);
  };

  const handleSuggestionClick = (route: string) => {
    setSearchQuery('');
    setSearchMatches([]);
    setIsSearchActive(false);
    router.push(`/${route}`);
  };

  const renderIcon = (name: string) => {
    switch (name) {
      case 'id-card': return <Plus className="small-icon" />;
      case 'pill': return <Pill className="small-icon" />;
      case 'flask-conical': return <FlaskConical className="small-icon" />;
      case 'building-2': return <Building className="small-icon" />;
      case 'droplet': return <Droplet className="small-icon" />;
      case 'heart-handshake': return <HeartHandshake className="small-icon" />;
      case 'building': return <Building className="small-icon" />;
      case 'shield-check': return <ShieldCheck className="small-icon" />;
      case 'palette': return <Palette className="small-icon" />;
      case 'accessibility': return <Accessibility className="small-icon" />;
      case 'languages': return <Languages className="small-icon" />;
      case 'graduation-cap': return <GraduationCap className="small-icon" />;
      case 'activity': return <Activity className="small-icon" />;
      case 'heart-pulse': return <HeartPulse className="small-icon" />;
      case 'brain-circuit': return <BrainCircuit className="small-icon" />;
      case 'ambulance': return <Ambulance className="small-icon" />;
      case 'qr-code': return <QrCode className="small-icon" />;
      case 'folder-lock': return <FolderLock className="small-icon" />;
      case 'video': return <Video className="small-icon" />;
      case 'user-round': return <UserRound className="small-icon" />;
      case 'file-text': return <FileText className="small-icon" />;
      default: return <Search className="small-icon" />;
    }
  };

  // Group search matches by type
  const searchGroups: Record<string, SearchItem[]> = {};
  searchMatches.forEach(item => {
    if (!searchGroups[item.type]) {
      searchGroups[item.type] = [];
    }
    searchGroups[item.type].push(item);
  });

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          <div 
            className="logo-icon"
            style={{ 
              overflow: 'hidden', 
              padding: 0, 
              background: selectedLogo !== 'default' ? 'transparent' : 'linear-gradient(135deg, var(--accent-teal), var(--accent-cyan))',
              boxShadow: selectedLogo !== 'default' ? 'none' : '0 12px 28px color-mix(in srgb, var(--accent-teal) 24%, transparent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '10px'
            }}
          >
            {selectedLogo === 'default' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px', color: 'var(--accent-teal)' }}>
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            ) : (
              <img
                src={selectedLogo}
                alt="Brand Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            )}
          </div>
          <div className="logo-text">
            <h1>{t('ABHA SETU')}</h1>
            <span>{t('Digital Health Bridge')}</span>
          </div>
        </div>

        {/* Global Search Input */}
        <div ref={searchRef} className={`global-search ${isSearchActive ? 'is-active' : ''}`} role="search">
          <Search className="search-icon" style={{ color: 'var(--text-muted)' }} />
          <input
            id="service-search"
            type="search"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchActive(true)}
            placeholder={t('Search services, records, doctors...')}
            autoComplete="off"
            aria-label="Search services"
          />
          {searchQuery && (
            <button
              className="search-close-btn"
              onClick={() => {
                setSearchQuery('');
                setSearchMatches([]);
              }}
              aria-label="Close search"
              type="button"
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          )}

          {/* Suggestions Dropdown */}
          {isSearchActive && (searchQuery.trim() !== '') && (
            <div className="search-suggestions is-open" role="listbox">
              {searchMatches.length === 0 ? (
                <div className="suggestion-empty">{t('No matching services found')}</div>
              ) : (
                Object.keys(searchGroups).map(type => (
                  <React.Fragment key={type}>
                    <div className="suggestion-group-header">{t(type)}</div>
                    {searchGroups[type].map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(item.route)}
                        role="option"
                        aria-selected="false"
                      >
                        {renderIcon(item.icon)}
                        <span>
                          <strong>{t(item.title)}</strong>
                          <small>{t(item.desc)}</small>
                        </span>
                      </button>
                    ))}
                  </React.Fragment>
                ))
              )}
            </div>
          )}
        </div>

        <div className="header-actions">
          {/* Language Selector */}
          <div
            ref={langRef}
            className="lang-selector-container"
            style={{ position: 'relative' }}
          >
            <div
              className="lang-selector"
              role="button"
              aria-label="Select Language"
              tabIndex={0}
              onClick={() => setIsLangOpen(!isLangOpen)}
            >
              <span>{language}</span>
              <ChevronDown className="chevron-icon" style={{ width: '14px', height: '14px' }} />
            </div>

            {isLangOpen && (
              <div
                className="profile-dropdown is-open"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  width: '160px',
                  zIndex: 1100,
                }}
              >
                {(['EN', 'HI', 'TA', 'TE', 'BN', 'MR', 'GU', 'KN'] as LanguageCode[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      setIsLangOpen(false);
                    }}
                    className={`dropdown-item ${language === lang ? 'active-lang' : ''}`}
                    style={{
                      border: 0,
                      background: 'transparent',
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                      padding: '10px 14px',
                      display: 'block',
                      color: language === lang ? 'var(--accent-teal)' : 'var(--text-primary)',
                      fontWeight: language === lang ? '700' : 'normal',
                    }}
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
            )}
          </div>

          {/* Notification Indicator */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <div
              className={`notification ${isNotifOpen ? 'selected-card' : ''}`}
              role="button"
              aria-label="Notifications"
              tabIndex={0}
              onClick={() => setIsNotifOpen(!isNotifOpen)}
            >
              <Bell className="bell-icon" style={{ width: '18px', height: '18px' }} />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </div>

            {/* Redesigned Floating Notification Drawer */}
            {isNotifOpen && (
              <div className="notif-drawer">
                <div className="notif-header">
                  <h3>
                    <Bell style={{ width: '16px', height: '16px', color: 'var(--accent-teal)' }} />
                    {t('Notifications')}
                  </h3>
                  {unreadCount > 0 && (
                    <button className="notif-btn" onClick={clearNotifications}>
                      {t('Mark all read')}
                    </button>
                  )}
                </div>

                <div className="notif-body">
                  {notifications.length === 0 ? (
                    <div className="notif-empty">
                      <Bell style={{ width: '32px', height: '32px', color: 'var(--text-muted)' }} />
                      <h4>{t('All caught up!')}</h4>
                      <p>{t('No new notifications or alerts.')}</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`notif-item ${notif.unread ? 'unread' : ''}`}
                        onClick={() => {
                          markNotificationRead(notif.id);
                          showToast(t('Notification marked as read'));
                        }}
                      >
                        <div
                          className="notif-item-icon"
                          style={{
                            background: notif.type === 'security' ? 'rgba(239, 68, 68, 0.12)' : 'color-mix(in srgb, var(--accent-teal) 12%, transparent)',
                            color: notif.type === 'security' ? 'var(--danger)' : 'var(--accent-teal)'
                          }}
                        >
                          {notif.type === 'security' ? <ShieldCheck className="small-icon" style={{ width: '15px', height: '15px' }} /> : <Bell className="small-icon" style={{ width: '15px', height: '15px' }} />}
                        </div>
                        <div className="notif-item-content">
                          <strong className="notif-item-title">{t(notif.title)}</strong>
                          <span className="notif-item-msg">{t(notif.message)}</span>
                          <span className="notif-item-time">{t(notif.time)}</span>
                        </div>
                        {notif.unread && <span className="notif-item-unread-dot" />}
                        <button
                          className="notif-item-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                            showToast(t('Notification deleted'));
                          }}
                          title="Delete Alert"
                        >
                          <X style={{ width: '12px', height: '12px' }} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="notif-footer">
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t('ABHA SECURE PANEL')}</span>
                  {notifications.length > 0 && (
                    <button className="notif-btn danger" onClick={() => {
                      notifications.forEach(n => deleteNotification(n.id));
                      showToast(t('Notifications cleared.'));
                    }}>
                      {t('Clear all')}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            className="theme-toggle-btn"
            onClick={cycleTheme}
            aria-label="Toggle Theme"
            type="button"
          >
            {theme === 'emerald-light' ? (
              <Moon className="moon-icon" style={{ width: '18px', height: '18px', display: 'block' }} />
            ) : (
              <Sun className="sun-icon" style={{ width: '18px', height: '18px', display: 'block' }} />
            )}
          </button>

          {/* Profile Menu */}
          {currentUser && (
            <div ref={profileRef} className="profile-menu-container">
              <div
                className="avatar"
                role="button"
                aria-label="User Menu"
                tabIndex={0}
                aria-haspopup="true"
                aria-expanded={isProfileOpen}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <img
                  src={currentUser.photo || '/assets/doctors/dr-ayesha-ali.jpeg'}
                  alt={currentUser.name}
                  id="header-avatar-img"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=100';
                  }}
                />
                <span className="avatar-status"></span>
              </div>

              {isProfileOpen && (
                <div className="profile-dropdown is-open" role="menu" id="profile-dropdown">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      router.push('/settings');
                    }}
                    className="dropdown-item"
                    role="menuitem"
                    style={{ border: 0, background: 'transparent', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <User className="small-icon" style={{ width: '14px', height: '14px' }} />
                    <span>{t('Profile Settings')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      router.push('/settings');
                    }}
                    className="dropdown-item"
                    role="menuitem"
                    style={{ border: 0, background: 'transparent', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <Palette className="small-icon" style={{ width: '14px', height: '14px' }} />
                    <span>{t('Theme Settings')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      router.push('/settings');
                    }}
                    className="dropdown-item"
                    role="menuitem"
                    style={{ border: 0, background: 'transparent', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <Languages className="small-icon" style={{ width: '14px', height: '14px' }} />
                    <span>{t('Language Preferences')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      router.push('/settings');
                    }}
                    className="dropdown-item"
                    role="menuitem"
                    style={{ border: 0, background: 'transparent', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <Accessibility className="small-icon" style={{ width: '14px', height: '14px' }} />
                    <span>{t('Accessibility Settings')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      router.push('/security');
                    }}
                    className="dropdown-item"
                    role="menuitem"
                    style={{ border: 0, background: 'transparent', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <ShieldCheck className="small-icon" style={{ width: '14px', height: '14px' }} />
                    <span>{t('Security Settings')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      router.push('/sandbox');
                    }}
                    className="dropdown-item"
                    role="menuitem"
                    style={{ border: 0, background: 'transparent', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <Code className="small-icon" style={{ width: '14px', height: '14px' }} />
                    <span>{t('Sandbox API Docs')}</span>
                  </button>

                  <hr className="dropdown-divider" />

                  <button
                    className="dropdown-item logout-btn"
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    role="menuitem"
                    style={{
                      border: 0,
                      background: 'transparent',
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <LogOut className="small-icon" style={{ color: 'var(--danger)', width: '14px', height: '14px' }} />
                    <span style={{ color: 'var(--danger)' }}>{t('Logout')}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
