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
  FileText,
  ImageIcon,
  Sparkles,
  Download,
  Send,
  Database
} from 'lucide-react';
import html2canvas from 'html2canvas';

interface SearchItem {
  type: string;
  title: string;
  route: string;
  icon: string;
  desc: string;
}

/**
 * Normalizes and returns the base64 source or static path of a profile image.
 * @param {string} photo - base64 string or image path
 * @returns {string} parsed image source
 */
const getPhotoSrc = (photo: string | undefined): string => {
  if (!photo) return '';
  if (photo.startsWith('data:') || photo.startsWith('http')) {
    return photo;
  }
  if (photo.startsWith('/9j/')) {
    return `data:image/jpeg;base64,${photo}`;
  }
  if (photo.startsWith('/')) {
    return photo;
  }
  return `data:image/jpeg;base64,${photo}`;
};

/**
 * Maps gender letters/words to bilingual English/Hindi output.
 * @param {string} gender - gender string
 * @returns {string} bilingual gender description
 */
const getGenderDisplay = (gender: string | undefined): string => {
  if (!gender) return '';
  const g = gender.toLowerCase();
  if (g === 'male' || g === 'm') return 'Male / पुरुष';
  if (g === 'female' || g === 'f') return 'Female / महिला';
  return `${gender} / अन्य`;
};

export default function Header() {
  const { currentUser, logout, notifications, records, appointments, clearNotifications, deleteNotification, markNotificationRead, addRecord } = useAuth();
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
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Timer States
  const [sessionTimerStr, setSessionTimerStr] = useState('30:00');
  const [keyTimerStr, setKeyTimerStr] = useState('60:00');
  const [sessionExpired, setSessionExpired] = useState(false);
  const [keyExpired, setKeyExpired] = useState(false);

  const handleSaveToLocker = (cardName = 'ABHA_Smart_Card.pdf') => {
    if (!addRecord) return;
    const newRecord = {
      name: cardName,
      type: 'ID Card',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      source: 'National Health Authority',
    };
    addRecord(newRecord);
    showToast(t('ABHA ID Card successfully synced and saved inside secure Health Locker.'));
  };

  const handleDownloadCard = async () => {
    const cardEl = document.getElementById('abha-card-capture-header');
    if (!cardEl) {
      showToast(t('Error finding ABHA Card element.'));
      return;
    }
    try {
      showToast(t('Generating high-quality image...'));
      const canvas = await html2canvas(cardEl, {
        useCORS: true,
        scale: 2,
        backgroundColor: null
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `ABHA_Smart_Card_${currentUser?.abhaProfile?.ABHANumber || currentUser?.abhaProfile?.abhaNumber || 'Verified'}.png`;
      link.href = dataUrl;
      link.click();
      showToast(t('ABHA Card downloaded successfully!'));
    } catch (err: any) {
      console.error(err);
      showToast(t('Failed to generate card download.'));
    }
  };

  const handleShareCard = async () => {
    const cardEl = document.getElementById('abha-card-capture-header');
    if (!cardEl) {
      showToast(t('Error finding ABHA Card element.'));
      return;
    }
    try {
      showToast(t('Generating shareable image...'));
      const canvas = await html2canvas(cardEl, {
        useCORS: true,
        scale: 2,
        backgroundColor: null
      });
      canvas.toBlob(async (blob) => {
        if (!blob) {
          showToast(t('Failed to create image blob.'));
          return;
        }
        const file = new File([blob], `ABHA_Smart_Card_${currentUser?.abhaProfile?.ABHANumber || currentUser?.abhaProfile?.abhaNumber || 'Verified'}.png`, { type: 'image/png' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'My ABHA Card',
              text: 'Here is my Ayushman Bharat Health Account (ABHA) Card.'
            });
          } catch (e: any) {
            if (e.name !== 'AbortError') {
              showToast(t('Share canceled or failed.'));
            }
          }
        } else {
          try {
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            showToast(t('Card image copied to clipboard! You can paste and share it.'));
          } catch (clipErr) {
            const link = document.createElement('a');
            link.download = `ABHA_Smart_Card_${currentUser?.abhaProfile?.ABHANumber || currentUser?.abhaProfile?.abhaNumber || 'Verified'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            showToast(t('Web Share not supported. Downloaded instead.'));
          }
        }
      }, 'image/png');
    } catch (err: any) {
      console.error(err);
      showToast(t('Failed to share card.'));
    }
  };

  useEffect(() => {
    const updateTimers = () => {
      // 1. Session Expiry
      const sessionExpiryVal = localStorage.getItem('abha_session_expiry');
      if (sessionExpiryVal) {
        const expiry = Number(sessionExpiryVal);
        const diff = expiry - Date.now();
        if (diff <= 0) {
          setSessionExpired(true);
          setSessionTimerStr('00:00');
        } else {
          setSessionExpired(false);
          const mins = Math.floor(diff / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          setSessionTimerStr(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
        }
      } else {
        setSessionExpired(true);
        setSessionTimerStr('N/A (Not Verified)');
      }

      // 2. Public Key Expiry
      const keyExpiryVal = localStorage.getItem('public_key_expiry');
      if (keyExpiryVal) {
        const expiry = Number(keyExpiryVal);
        const diff = expiry - Date.now();
        if (diff <= 0) {
          setKeyExpired(true);
          setKeyTimerStr('00:00');
        } else {
          setKeyExpired(false);
          const mins = Math.floor(diff / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          setKeyTimerStr(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
        }
      } else {
        setKeyExpired(true);
        setKeyTimerStr('N/A (Not Synced)');
      }
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    window.addEventListener('storage', updateTimers);
    window.addEventListener('setu_state_update', updateTimers);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', updateTimers);
      window.removeEventListener('setu_state_update', updateTimers);
    };
  }, []);

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

  const navigateToSettings = (hash: string) => {
    setIsProfileOpen(false);
    if (typeof window !== 'undefined') {
      const isSettings = window.location.pathname === '/settings' || window.location.pathname.endsWith('/settings');
      if (isSettings) {
        window.location.hash = hash;
      } else {
        router.push(`/settings#${hash}`);
      }
    }
  };

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
      { type: "Services", title: "Order Medicines", route: "pharmacy", icon: "pill", desc: "Browse OTC/Prescription medicines, add to cart." },
      { type: "Services", title: "Book Lab Tests", route: "lab-tests", icon: "flask-conical", desc: "Book NABL diagnostics, check slots, and sync ABHA." },
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
      { type: "Medicines", title: "Paracetamol 650mg", route: "pharmacy", icon: "pill", desc: "Price: ₹40 | For relief of fever and mild to moderate pain." },
      { type: "Medicines", title: "Amoxicillin 500mg", route: "pharmacy", icon: "pill", desc: "Price: ₹120 | Broad-spectrum antibiotic for bacterial infections." },
      { type: "Courses", title: "First Aid Certification Course", route: "courses", icon: "graduation-cap", desc: "CPR training and basic life support certificate." },
      { type: "Courses", title: "ABDM Integration Training", route: "courses", icon: "graduation-cap", desc: "Training for health facilities to integrate under Ayushman Bharat." },
      { type: "Insurance", title: "Ayushman Bharat PM-JAY Policy", route: "insurance", icon: "shield-check", desc: "Verify eligibility and link PM-JAY insurance cards." },
      { type: "Labs", title: "ECG Diagnostic Screening", route: "lab-tests", icon: "activity", desc: "Diagnostic lab slot for heart screening scans." },
      { type: "Labs", title: "NABL Pathology Lab Tests", route: "lab-tests", icon: "flask-conical", desc: "NABL certified blood tests and sample collection." },
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
          {(isSearchActive || searchQuery) && (
            <button
              className="search-close-btn"
              onClick={() => {
                setSearchQuery('');
                setSearchMatches([]);
                setIsSearchActive(false);
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
                    className={`dropdown-item ${language === lang ? 'active' : ''}`}
                    style={{
                      border: 0,
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                      padding: '10px 14px',
                      display: 'block',
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
                  src={getPhotoSrc(currentUser.abhaProfile?.photo || currentUser.photo || '') || '/assets/doctors/dr-ayesha-ali.jpeg'}
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
                  {/* Active Timers Panel */}
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-color)', fontSize: '10px', color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: '12px 12px 0 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span>Session Expiry:</span>
                      <span style={{ fontWeight: 'bold', color: sessionExpired ? 'var(--danger)' : 'var(--accent-teal)' }}>
                        {sessionExpired ? 'EXPIRED' : sessionTimerStr}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Key Expiry:</span>
                      <span style={{ fontWeight: 'bold', color: keyExpired ? 'var(--danger)' : 'var(--accent-blue)' }}>
                        {keyExpired ? 'EXPIRED' : keyTimerStr}
                      </span>
                    </div>
                  </div>

                  {currentUser?.abhaProfile && (
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setShowProfileModal(true);
                      }}
                      className="dropdown-item"
                      role="menuitem"
                      style={{ border: 0, background: 'transparent', width: '100%', textAlign: 'left', cursor: 'pointer', color: 'var(--accent-teal)', fontWeight: 'bold' }}
                    >
                      <User className="small-icon" style={{ width: '14px', height: '14px', color: 'var(--accent-teal)' }} />
                      <span>{t('View ABHA Profile')}</span>
                    </button>
                  )}

                  <button
                    onClick={() => navigateToSettings('visual')}
                    className="dropdown-item"
                    role="menuitem"
                    style={{ border: 0, background: 'transparent', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <Palette className="small-icon" style={{ width: '14px', height: '14px' }} />
                    <span>{t('Visual Theme')}</span>
                  </button>

                  <button
                    onClick={() => navigateToSettings('branding')}
                    className="dropdown-item"
                    role="menuitem"
                    style={{ border: 0, background: 'transparent', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <ImageIcon className="small-icon" style={{ width: '14px', height: '14px' }} />
                    <span>{t('App Branding & Logos')}</span>
                  </button>

                  <button
                    onClick={() => navigateToSettings('homepage')}
                    className="dropdown-item"
                    role="menuitem"
                    style={{ border: 0, background: 'transparent', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <Sparkles className="small-icon" style={{ width: '14px', height: '14px' }} />
                    <span>{t('Homepage Preferences')}</span>
                  </button>

                  <button
                    onClick={() => navigateToSettings('language')}
                    className="dropdown-item"
                    role="menuitem"
                    style={{ border: 0, background: 'transparent', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <Languages className="small-icon" style={{ width: '14px', height: '14px' }} />
                    <span>{t('Language Preferences')}</span>
                  </button>

                  <button
                    onClick={() => navigateToSettings('accessibility')}
                    className="dropdown-item"
                    role="menuitem"
                    style={{ border: 0, background: 'transparent', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <Accessibility className="small-icon" style={{ width: '14px', height: '14px' }} />
                    <span>{t('Accessibility Settings')}</span>
                  </button>

                  <button
                    onClick={() => navigateToSettings('notifications')}
                    className="dropdown-item"
                    role="menuitem"
                    style={{ border: 0, background: 'transparent', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <Bell className="small-icon" style={{ width: '14px', height: '14px' }} />
                    <span>{t('Notification Preferences')}</span>
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
      
      {/* Premium Profile Modal Overlay */}
      {showProfileModal && currentUser?.abhaProfile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }} onClick={() => setShowProfileModal(false)}>
          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: 'fadeIn 0.3s ease-out'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)'
            }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <ShieldCheck style={{ color: 'var(--accent-teal)' }} />
                <span>Verified ABHA Profile</span>
              </h3>
              <button 
                onClick={() => setShowProfileModal(false)}
                style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '4px' }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '20px', overflowY: 'auto', maxHeight: '75vh', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Smart Card representation */}
              <article 
                id="abha-card-capture-header"
                className="setu-abha-card" 
                style={{ 
                  width: '100%',
                  margin: 0,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid #cbd5e1',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                <div 
                  className="setu-abha-card-header" 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '10px 14px', 
                    background: '#273890', 
                    borderBottom: '2px solid #10b981' 
                  }}
                >
                  <div style={{ height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <img
                      src="/nha.png"
                      alt="NHA Logo"
                      style={{ height: '100%', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                    />
                  </div>
                  <div style={{ textAlign: 'center', color: '#ffffff', flex: 1, padding: '0 6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.3px', textTransform: 'uppercase' }}>Ayushman Bharat Health Account</span>
                    <span style={{ fontSize: '9px', opacity: 0.9, fontWeight: 600 }}>आयुष्मान भारत स्वास्थ्य खाता (आभा)</span>
                  </div>
                  <div style={{ height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <img
                      src="/abdm_new.png"
                      alt="ABDM Logo"
                      style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
                    />
                  </div>
                </div>
                
                <div 
                  className="setu-abha-card-body" 
                  style={{ 
                    position: 'relative', 
                    display: 'flex', 
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'stretch',
                    gap: '12px', 
                    padding: '14px', 
                    background: 'radial-gradient(circle, #ffffff 0%, #f1f5f9 100%)', 
                    color: '#0f172a' 
                  }}
                >
                  
                  <div className="setu-abha-card-avatar-wrapper" style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                    <div className="setu-abha-card-avatar" style={{ width: '75px', height: '95px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #94a3b8', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                      <img
                        src={getPhotoSrc(currentUser.abhaProfile.photo)}
                        alt={currentUser.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=150';
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="setu-abha-card-details" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'left', minWidth: 0 }}>
                    <div className="setu-abha-card-field">
                      <span className="setu-abha-card-label" style={{ fontSize: '7px', color: '#64748b', display: 'block', fontWeight: 700 }}>Name / नाम</span>
                      <strong className="setu-abha-card-value" style={{ fontSize: '11px', color: '#0f172a', fontWeight: '800', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {[currentUser.abhaProfile.firstName, currentUser.abhaProfile.middleName, currentUser.abhaProfile.lastName].filter(Boolean).join(' ')}
                      </strong>
                    </div>
                    
                    <div className="setu-abha-card-field">
                      <span className="setu-abha-card-label" style={{ fontSize: '7px', color: '#64748b', display: 'block', fontWeight: 700 }}>ABHA Number / आभा संख्या</span>
                      <strong className="setu-abha-card-value token-num" style={{ fontSize: '11px', color: 'var(--accent-blue)', fontFamily: 'monospace', fontWeight: 800 }}>
                        {currentUser.abhaProfile.ABHANumber || currentUser.abhaProfile.abhaNumber}
                      </strong>
                    </div>
                    
                    <div className="setu-abha-card-field">
                      <span className="setu-abha-card-label" style={{ fontSize: '7px', color: '#64748b', display: 'block', fontWeight: 700 }}>ABHA Address / आभा पता</span>
                      <strong className="setu-abha-card-value token-num" style={{ color: '#0f172a', fontSize: '9px', fontFamily: 'monospace', fontWeight: 700, wordBreak: 'break-all' }}>
                        {currentUser.abhaProfile.preferredAddress || currentUser.abhaProfile.abhaAddress}
                      </strong>
                    </div>
                    
                    <div className="setu-abha-card-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px', marginTop: '2px' }}>
                      <div className="setu-abha-card-field">
                        <span className="setu-abha-card-label" style={{ fontSize: '7px', color: '#64748b', display: 'block', fontWeight: 700 }}>Gender / लिंग</span>
                        <span className="setu-abha-card-value" style={{ fontSize: '9px', fontWeight: 600 }}>
                          {getGenderDisplay(currentUser.abhaProfile.gender)}
                        </span>
                      </div>
                      <div className="setu-abha-card-field">
                        <span className="setu-abha-card-label" style={{ fontSize: '7px', color: '#64748b', display: 'block', fontWeight: 700 }}>DOB / जन्म तिथि</span>
                        <span className="setu-abha-card-value" style={{ fontSize: '9px', fontWeight: 600 }}>{currentUser.abhaProfile.dob}</span>
                      </div>
                      <div className="setu-abha-card-field" style={{ gridColumn: 'span 2' }}>
                        <span className="setu-abha-card-label" style={{ fontSize: '7px', color: '#64748b', display: 'block', fontWeight: 700 }}>Mobile / मोबाइल</span>
                        <span className="setu-abha-card-value" style={{ fontSize: '9px', fontWeight: 600 }}>{currentUser.abhaProfile.mobile}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="setu-abha-card-qr-wrapper" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="setu-abha-card-qr" style={{ padding: '4px', background: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=ABHA:${currentUser.abhaProfile.ABHANumber || currentUser.abhaProfile.abhaNumber};${currentUser.abhaProfile.preferredAddress || currentUser.abhaProfile.abhaAddress}`}
                        alt="ABHA QR"
                        style={{ width: '68px', height: '68px', display: 'block' }}
                      />
                    </div>
                  </div>
                </div>
              </article>

              {/* Action Buttons: Download, Locker, Share inside modal */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                <button
                  onClick={handleDownloadCard}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'var(--accent-teal)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Download style={{ width: '14px', height: '14px' }} />
                  <span>Download ABHA Card (PNG)</span>
                </button>

                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <button
                    onClick={() => handleSaveToLocker(`ABHA_Smart_Card_${currentUser.abhaProfile.ABHANumber || currentUser.abhaProfile.abhaNumber}.pdf`)}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Database style={{ width: '12px', height: '12px', color: 'var(--accent-teal)' }} />
                    <span>Save to Locker</span>
                  </button>

                  <button
                    onClick={handleShareCard}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Send style={{ width: '12px', height: '12px', color: 'var(--accent-blue)' }} />
                    <span>Share Card</span>
                  </button>
                </div>
              </div>

              {/* Extended Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '11px', textAlign: 'left' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>Mobile Number</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{currentUser.abhaProfile.mobile || 'N/A'}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>Status</span>
                  <span style={{ fontWeight: 800, color: 'var(--success)' }}>{currentUser.abhaProfile.abhaStatus || 'ACTIVE'}</span>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>Street Address</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{currentUser.abhaProfile.address || 'N/A'}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>District & State</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{currentUser.abhaProfile.districtName}, {currentUser.abhaProfile.stateName}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>Pin Code</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{currentUser.abhaProfile.pinCode || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', gap: '8px', padding: '14px 20px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
              <button 
                onClick={() => setShowProfileModal(false)}
                style={{ flex: 1, padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
