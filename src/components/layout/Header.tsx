'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, User as UserType } from '../../providers/AuthProvider';
import { useLanguage, LanguageCode } from '../../providers/LanguageProvider';
import { useTheme } from '../../providers/ThemeProvider';
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
  Droplet
} from 'lucide-react';

interface SearchItem {
  type: string;
  title: string;
  route: string;
  icon: string;
  desc: string;
}

export default function Header() {
  const { currentUser, logout, notifications, records } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, cycleTheme } = useTheme();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchMatches, setSearchMatches] = useState<SearchItem[]>([]);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

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

    // Replicate original search matches database
    const searchableItems: SearchItem[] = [
      { type: "Services", title: "ABHA Card", route: "abha", icon: "id-card", desc: "Create, view, download or verify ABHA Card." },
      { type: "Services", title: "Order Medicines", route: "more", icon: "pill", desc: "Browse OTC/Prescription medicines, add to cart." },
      { type: "Services", title: "Book Lab Tests", route: "more", icon: "flask-conical", desc: "Book NABL diagnostics, check slots, and sync ABHA." },
      { type: "Services", title: "Hospitals Registry", route: "connected", icon: "building-2", desc: "Verified HFR hospitals directory, check-in queues." },
      { type: "Services", title: "Blood Bank Directory", route: "more", icon: "droplet", desc: "Check blood units availability, request or donate blood." },
      { type: "Services", title: "Organ Donation Pledge", route: "more", icon: "heart-handshake", desc: "Submit organ transplant pledge, download NHA certificate." },
      { type: "Services", title: "Connected Facilities", route: "connected", icon: "building", desc: "Scan and share at active hospitals and diagnostics." },
      { type: "Services", title: "Security Dashboard", route: "security", icon: "shield-check", desc: "Check role permissions, token logs, security credentials." },
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
    ];

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
          <div className="logo-icon">
            <Plus className="logo-plus" style={{ width: '20px', height: '20px', color: 'var(--accent-teal)' }} />
          </div>
          <div className="logo-text">
            <h1>{t('ABHA SETU')}</h1>
            <span>{t('National Digital Health Bridge')}</span>
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
          <div
            className="notification"
            role="button"
            aria-label="Notifications"
            tabIndex={0}
            onClick={() => router.push('/security')}
          >
            <Bell className="bell-icon" style={{ width: '18px', height: '18px' }} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
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
