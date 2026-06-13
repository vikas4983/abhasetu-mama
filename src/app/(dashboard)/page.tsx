'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../providers/LanguageProvider';
import { useAuth } from '../../providers/AuthProvider';
import {
  Users,
  Monitor,
  Lock,
  Stethoscope,
  Pill,
  FlaskConical,
  ShieldCheck,
  GraduationCap,
  Building2,
  Droplet,
  HeartHandshake,
  QrCode,
  IdCard,
  Activity,
  HeartPulse,
  BrainCircuit,
  Smartphone,
  ChevronRight,
  Scale,
  FileCheck,
  FileText,
  FolderLock,
  Shield,
  Globe,
  Truck,
  Plane,
  Ambulance,
  TestTube
} from 'lucide-react';

export default function DashboardHome() {
  const router = useRouter();
  const { t } = useLanguage();
  const { records } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [iconStyle, setIconStyle] = useState<'glassmorphic' | '3d-gradient' | 'minimalist'>('glassmorphic');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  // Synchronize dynamic icon preferences
  useEffect(() => {
    const checkState = () => {
      try {
        const state = JSON.parse(localStorage.getItem('setu_state') || '{}');
        if (state.iconStyle) {
          setIconStyle(state.iconStyle);
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkState();
    window.addEventListener('storage', checkState);
    window.addEventListener('setu_state_update', checkState);
    return () => {
      window.removeEventListener('storage', checkState);
      window.removeEventListener('setu_state_update', checkState);
    };
  }, []);

  const getIconConfig = (style: string, color3d: string, shadow3d: string) => {
    if (style === '3d-gradient') {
      return {
        className: 'quick-icon-3d',
        style: {
          background: color3d,
          boxShadow: shadow3d
        }
      };
    } else if (style === 'minimalist') {
      return {
        className: 'quick-icon-minimal',
        style: {}
      };
    } else {
      return {
        className: 'quick-icon-glass',
        style: {}
      };
    }
  };

  // Load current BP from synced records or default
  const hasKioskRecord = records.some(r => r.name.includes("ATM") || r.source.includes("Kiosk"));
  const bpVal = hasKioskRecord ? "118/78" : "120/80";
  const spo2Val = "98%";
  const glucoseVal = "98";
  const heartVal = "72";

  const handleQuickClick = (route: string) => {
    router.push(route);
  };

  if (isLoading) {
    return (
      <>
        {/* Shimmering Hero Section */}
        <section className="hero setu-skeleton" style={{ minHeight: '228px', border: '1px solid rgba(36, 68, 95, 0.25)', borderRadius: '14px', margin: '16px 0 20px', backgroundSize: '200% 100% !important' }}>
          <div style={{ padding: '20px' }}>
            <div className="setu-skeleton setu-skeleton-title" style={{ width: '40%', height: '28px', marginBottom: '14px' }}></div>
            <div className="setu-skeleton setu-skeleton-text" style={{ width: '60%', height: '18px', marginBottom: '24px' }}></div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="setu-skeleton setu-skeleton-button" style={{ width: '130px', height: '40px' }}></div>
              <div className="setu-skeleton setu-skeleton-button" style={{ width: '130px', height: '40px' }}></div>
            </div>
          </div>
        </section>

        {/* Shimmering Quick Access */}
        <section className="section">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div className="setu-skeleton setu-skeleton-title" style={{ width: '120px' }}></div>
            <div className="setu-skeleton setu-skeleton-text" style={{ width: '60px' }}></div>
          </div>
          <div className="quick-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="quick-item" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                <div className="setu-skeleton" style={{ width: '32px', height: '32px', borderRadius: '50%', marginBottom: '6px' }}></div>
                <div className="setu-skeleton setu-skeleton-text" style={{ width: '70%', height: '10px' }}></div>
              </div>
            ))}
          </div>
        </section>

        {/* Shimmering Health Dashboard */}
        <section className="section">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div className="setu-skeleton setu-skeleton-title" style={{ width: '160px' }}></div>
            <div className="setu-skeleton setu-skeleton-text" style={{ width: '60px' }}></div>
          </div>
          <div className="health-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="health-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                <div className="setu-skeleton setu-skeleton-text" style={{ width: '40%', height: '10px', marginBottom: '8px' }}></div>
                <div className="setu-skeleton setu-skeleton-title" style={{ width: '70%', height: '24px', marginBottom: '8px' }}></div>
                <div className="setu-skeleton" style={{ width: '100%', height: '20px', borderRadius: '4px' }}></div>
              </div>
            ))}
          </div>
        </section>
      </>
    );
  }


  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <h2>
            {t('Your Digital')}{' '}
            <br className="hero-desktop-br" />
            <span className="gradient-text">{t('Healthcare Ecosystem')}</span>
          </h2>
        </div>
        <div className="hero-right">
          <div className="hero-ecg">
            <svg viewBox="0 0 300 60" className="ecg-line">
              <path
                d="M0,30 L40,30 L50,30 L55,15 L60,45 L65,10 L70,50 L75,30 L80,30 L120,30 L125,25 L130,35 L135,20 L140,40 L145,30 L150,30 L190,30 L195,20 L200,40 L205,15 L210,45 L215,30 L220,30 L260,30 L265,25 L270,35 L275,20 L280,40 L285,30 L300,30"
                fill="none"
                stroke="#00d4aa"
                strokeWidth="1.5"
              />
            </svg>
            <div className="ecg-grid"></div>
          </div>
          <div className="hero-actions">
            <button className="hero-btn consult-hero-btn" onClick={() => handleQuickClick('/appointments')}>
              <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #00d4aa 0%, #009688 100%)', '0 4px 14px color-mix(in srgb, var(--accent-teal) 40%, transparent)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #00d4aa 0%, #009688 100%)', '0 4px 14px color-mix(in srgb, var(--accent-teal) 40%, transparent)').style}>
                <Stethoscope />
              </div>
              <span>{t('Book Doctor').toUpperCase()}</span>
            </button>

            <button className="hero-btn atm-hero-btn" onClick={() => handleQuickClick('/more')}>
              <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #00f5d4 0%, #00bbf9 100%)', '0 4px 14px rgba(0, 245, 212, 0.4)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #00f5d4 0%, #00bbf9 100%)', '0 4px 14px rgba(0, 245, 212, 0.4)').style}>
                <HeartPulse />
              </div>
              <span>{t('Health ATM').toUpperCase()}</span>
            </button>

            <button className="hero-btn locker-hero-btn" onClick={() => handleQuickClick('/records')}>
              <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)', '0 4px 14px rgba(0, 180, 216, 0.4)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)', '0 4px 14px rgba(0, 180, 216, 0.4)').style}>
                <FolderLock />
              </div>
              <span>{t('Health Locker').toUpperCase()}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="section">
        <div className="section-header">
          <h3>{t('Quick Access')}</h3>
          <a href="#" onClick={(e) => { e.preventDefault(); handleQuickClick('/more'); }} className="view-all">
            {t('View All')} <ChevronRight className="view-icon" style={{ width: '14px', height: '14px' }} />
          </a>
        </div>
        <div className="quick-grid">
          <div className="quick-item" onClick={() => handleQuickClick('/appointments')}>
            <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)', '0 4px 14px rgba(0, 180, 216, 0.4)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)', '0 4px 14px rgba(0, 180, 216, 0.4)').style}><Stethoscope /></div>
            <span>{t('Consult Doctor')}</span>
          </div>
          <div className="quick-item" onClick={() => handleQuickClick('/pharmacy')}>
            <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #ff4d6d 0%, #c9184a 100%)', '0 4px 14px rgba(255, 77, 109, 0.4)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #ff4d6d 0%, #c9184a 100%)', '0 4px 14px rgba(255, 77, 109, 0.4)').style}><Pill /></div>
            <span>{t('Order Medicines')}</span>
          </div>
          <div className="quick-item" onClick={() => handleQuickClick('/lab-tests')}>
            <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #f77f00 0%, #d62828 100%)', '0 4px 14px rgba(247, 127, 0, 0.4)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #f77f00 0%, #d62828 100%)', '0 4px 14px rgba(247, 127, 0, 0.4)').style}><FlaskConical /></div>
            <span>{t('Book Lab Tests')}</span>
          </div>
          <div className="quick-item" onClick={() => handleQuickClick('/insurance')}>
            <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #4c9a2a 0%, #1e5a22 100%)', '0 4px 14px rgba(76, 154, 42, 0.4)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #4c9a2a 0%, #1e5a22 100%)', '0 4px 14px rgba(76, 154, 42, 0.4)').style}><ShieldCheck /></div>
            <span>{t('Manage Insurance')}</span>
          </div>
          <div className="quick-item" onClick={() => handleQuickClick('/courses')}>
            <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #8338ec 0%, #3a0ca3 100%)', '0 4px 14px rgba(131, 56, 236, 0.4)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #8338ec 0%, #3a0ca3 100%)', '0 4px 14px rgba(131, 56, 236, 0.4)').style}><GraduationCap /></div>
            <span>{t('Training & Courses')}</span>
          </div>
          <div className="quick-item" onClick={() => handleQuickClick('/connected')}>
            <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #00d4aa 0%, #009688 100%)', '0 4px 14px color-mix(in srgb, var(--accent-teal) 40%, transparent)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #00d4aa 0%, #009688 100%)', '0 4px 14px color-mix(in srgb, var(--accent-teal) 40%, transparent)').style}><Building2 /></div>
            <span>{t('Hospitals')}</span>
          </div>
          <div className="quick-item" onClick={() => handleQuickClick('/more')}>
            <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #ef233c 0%, #d90429 100%)', '0 4px 14px rgba(239, 35, 60, 0.4)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #ef233c 0%, #d90429 100%)', '0 4px 14px rgba(239, 35, 60, 0.4)').style}><Droplet style={{ color: iconStyle === '3d-gradient' ? '#fff' : 'var(--accent-teal)' }} /></div>
            <span>{t('Blood Bank')}</span>
          </div>
          <div className="quick-item" onClick={() => handleQuickClick('/more')}>
            <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #ff70a6 0%, #ff9770 100%)', '0 4px 14px rgba(255, 112, 166, 0.4)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #ff70a6 0%, #ff9770 100%)', '0 4px 14px rgba(255, 112, 166, 0.4)').style}><HeartHandshake /></div>
            <span>{t('Organ Donation')}</span>
          </div>
          <div className="quick-item" onClick={() => handleQuickClick('/qr-scanner')}>
            <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #00f5d4 0%, #00bbf9 100%)', '0 4px 14px rgba(0, 245, 212, 0.4)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #00f5d4 0%, #00bbf9 100%)', '0 4px 14px rgba(0, 245, 212, 0.4)').style}><QrCode /></div>
            <span>{t('QR Scanner')}</span>
          </div>
          <div className="quick-item" onClick={() => handleQuickClick('/abha')}>
            <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #7209b7 0%, #f72585 100%)', '0 4px 14px rgba(114, 9, 183, 0.4)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #7209b7 0%, #f72585 100%)', '0 4px 14px rgba(114, 9, 183, 0.4)').style}><IdCard /></div>
            <span>{t('Create ABHA Card')}</span>
          </div>
        </div>
      </section>

      {/* Live Health Dashboard */}
      <section className="section">
        <div className="section-header">
          <div className="section-title">
            <h3>{t('Live Health Dashboard')}</h3>
            <span className="live-badge"><span className="live-dot"></span> {t('Live')}</span>
          </div>
          <a href="#" onClick={(e) => { e.preventDefault(); handleQuickClick('/health'); }} className="view-all">
            {t('View All')} <ChevronRight className="view-icon" style={{ width: '14px', height: '14px' }} />
          </a>
        </div>
        <div className="health-grid">
          <div className="health-card" onClick={() => handleQuickClick('/health')} style={{ cursor: 'pointer' }}>
            <span className="health-label">BP</span>
            <span className="health-value">{bpVal}</span>
            <span className="health-unit">mmHg</span>
            <svg viewBox="0 0 100 30" className="health-chart">
              <path d="M0,20 Q10,15 20,18 T40,12 T60,20 T80,10 T100,18" fill="none" stroke="#00d4aa" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="health-card" onClick={() => handleQuickClick('/health')} style={{ cursor: 'pointer' }}>
            <span className="health-label">SpO2</span>
            <span className="health-value">{spo2Val}</span>
            <svg viewBox="0 0 100 30" className="health-chart">
              <path d="M0,22 Q10,18 20,20 T40,15 T60,22 T80,12 T100,20" fill="none" stroke="#00d4aa" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="health-card" onClick={() => handleQuickClick('/health')} style={{ cursor: 'pointer' }}>
            <span className="health-label">Glucose</span>
            <span className="health-value">{glucoseVal}</span>
            <span className="health-unit">mg/dL</span>
            <svg viewBox="0 0 100 30" className="health-chart">
              <path d="M0,18 Q10,22 20,15 T40,20 T60,12 T80,18 T100,15" fill="none" stroke="#00d4aa" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="health-card" onClick={() => handleQuickClick('/health')} style={{ cursor: 'pointer' }}>
            <span className="health-label">Heart Rate</span>
            <span className="health-value">{heartVal}</span>
            <span className="health-unit">BPM</span>
            <svg viewBox="0 0 100 30" className="health-chart">
              <path d="M0,20 Q10,15 20,18 T40,10 T60,22 T80,15 T100,20" fill="none" stroke="#00d4aa" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
        <div className="health-status">
          <div className="status-card" onClick={() => handleQuickClick('/health')} style={{ cursor: 'pointer' }}>
            <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #00d4aa 0%, #00b4d8 100%)', '0 4px 14px color-mix(in srgb, var(--accent-teal) 40%, transparent)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #00d4aa 0%, #00b4d8 100%)', '0 4px 14px color-mix(in srgb, var(--accent-teal) 40%, transparent)').style}><BrainCircuit /></div>
            <div className="status-info">
              <span className="status-title">{t('AI Alerts')}</span>
              <span className="status-value">2 New</span>
            </div>
          </div>
          <div className="status-card" onClick={() => handleQuickClick('/health')} style={{ cursor: 'pointer' }}>
            <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #8338ec 0%, #3a0ca3 100%)', '0 4px 14px rgba(131, 56, 236, 0.4)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #8338ec 0%, #3a0ca3 100%)', '0 4px 14px rgba(131, 56, 236, 0.4)').style}><Smartphone /></div>
            <div className="status-info">
              <span className="status-title">{t('Device Sync')}</span>
              <span className="status-value">4/4 Connected</span>
            </div>
          </div>
        </div>
      </section>

      {/* Telemedicine */}
      <section className="section">
        <div className="section-header">
          <h3>{t('Telemedicine')}</h3>
          <a href="#" onClick={(e) => { e.preventDefault(); handleQuickClick('/appointments'); }} className="view-all">
            {t('View All')} <ChevronRight className="view-icon" style={{ width: '14px', height: '14px' }} />
          </a>
        </div>
        <div className="tele-grid">
          <div className="tele-card tele-main">
            <div className="tele-info">
              <span className="tele-title">{t('Video / Audio Consultation')}</span>
              <span className="tele-subtitle">{t('Connect with doctors instantly')}</span>
              <div className="tele-doctor">
                <img
                  src="/assets/doctors/dr-ayesha-ali.jpeg"
                  alt="Dr. Ayesha Ali"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=100';
                  }}
                />
                <div>
                  <span className="doctor-name">Dr. Ayesha Ali</span>
                  <span className="doctor-role">Senior Homeopathy Consultant</span>
                </div>
              </div>
              <button className="join-btn" onClick={() => handleQuickClick('/appointments')}>{t('Join Now')}</button>
            </div>
            <img
              src="/assets/doctors/dr-ayesha-ali.jpeg"
              alt="Doctor"
              className="tele-img"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=300';
              }}
            />
          </div>
          <div className="tele-card">
            <span className="tele-title">{t('Waiting Room')}</span>
            <span className="tele-count">3 <span className="tele-count-label">{t('Patients Ahead')}</span></span>
            <span className="tele-wait">{t('Est. 8 mins wait')}</span>
            <div className="wait-bar"><div className="wait-progress" style={{ width: '45%' }}></div></div>
          </div>
          <div className="tele-card tele-conference" onClick={() => handleQuickClick('/appointments')} style={{ cursor: 'pointer' }}>
            <span className="tele-title">{t('Multi-Doctor')}<br />{t('Conference')}</span>
            <span className="tele-subtitle">{t('Connect with specialists')}</span>
            <div className="conference-avatars">
              <div className="c-avatar" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100')" }}></div>
              <div className="c-avatar" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=100')" }}></div>
              <div className="c-avatar" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=100')" }}></div>
              <div className="c-avatar c-avatar-more">+</div>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace */}
      <section className="section">
        <div className="section-header">
          <h3>{t('Marketplace')}</h3>
          <a href="#" onClick={(e) => { e.preventDefault(); handleQuickClick('/more'); }} className="view-all">
            {t('View All')} <ChevronRight className="view-icon" style={{ width: '14px', height: '14px' }} />
          </a>
        </div>
        <div className="market-scroll">
          <div className="market-item" onClick={() => handleQuickClick('/more')}>
            <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #f77f00 0%, #d62828 100%)', '0 4px 14px rgba(247, 127, 0, 0.4)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #f77f00 0%, #d62828 100%)', '0 4px 14px rgba(247, 127, 0, 0.4)').style}><Truck /></div>
            <span>{t('Medicine Delivery')}</span>
          </div>
          <div className="market-item" onClick={() => handleQuickClick('/more')}>
            <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #ff4d6d 0%, #c9184a 100%)', '0 4px 14px rgba(255, 77, 109, 0.4)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #ff4d6d 0%, #c9184a 100%)', '0 4px 14px rgba(255, 77, 109, 0.4)').style}><FlaskConical /></div>
            <span>{t('Lab Booking')}</span>
          </div>
          <div className="market-item" onClick={() => handleQuickClick('/more')}>
            <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #00f5d4 0%, #00bbf9 100%)', '0 4px 14px rgba(0, 245, 212, 0.4)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #00f5d4 0%, #00bbf9 100%)', '0 4px 14px rgba(0, 245, 212, 0.4)').style}><TestTube /></div>
            <span>{t('Home Sample Collection')}</span>
          </div>
          <div className="market-item" onClick={() => handleQuickClick('/more')}>
            <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)', '0 4px 14px rgba(0, 180, 216, 0.4)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)', '0 4px 14px rgba(0, 180, 216, 0.4)').style}><Stethoscope /></div>
            <span>{t('Medical Equipment')}</span>
          </div>
          <div className="market-item" onClick={() => handleQuickClick('/more')}>
            <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #ef233c 0%, #d90429 100%)', '0 4px 14px rgba(239, 35, 60, 0.4)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #ef233c 0%, #d90429 100%)', '0 4px 14px rgba(239, 35, 60, 0.4)').style}><Ambulance /></div>
            <span>{t('Ambulance Booking')}</span>
          </div>
          <div className="market-item market-soon">
            <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #6c757d 0%, #495057 100%)', '0 4px 14px rgba(108, 117, 125, 0.4)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #6c757d 0%, #495057 100%)', '0 4px 14px rgba(108, 117, 125, 0.4)').style}><Plane style={{ color: iconStyle === '3d-gradient' ? '#fff' : 'var(--text-muted)' }} /></div>
            <span>{t('Drone Delivery')}</span>
            <span className="soon-badge">{t('Coming Soon')}</span>
          </div>
        </div>
      </section>

      {/* Medicolegal & Compliance */}
      <section className="section">
        <div className="section-header">
          <h3>{t('Medicolegal & Compliance')}</h3>
          <a href="#" onClick={(e) => { e.preventDefault(); handleQuickClick('/more'); }} className="view-all">
            {t('View All')} <ChevronRight className="view-icon" style={{ width: '14px', height: '14px' }} />
          </a>
        </div>
        <div className="legal-grid">
          <div className="legal-item" onClick={() => handleQuickClick('/more')}>
            <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #7209b7 0%, #f72585 100%)', '0 4px 14px rgba(114, 9, 183, 0.4)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #7209b7 0%, #f72585 100%)', '0 4px 14px rgba(114, 9, 183, 0.4)').style}><Scale /></div>
            <span>{t('Medicolegal Support')}</span>
          </div>
          <div className="legal-item" onClick={() => handleQuickClick('/more')}>
            <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #00d4aa 0%, #009688 100%)', '0 4px 14px color-mix(in srgb, var(--accent-teal) 40%, transparent)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #00d4aa 0%, #009688 100%)', '0 4px 14px color-mix(in srgb, var(--accent-teal) 40%, transparent)').style}><FileCheck /></div>
            <span>{t('Digital Consent Forms')}</span>
          </div>
          <div className="legal-item" onClick={() => handleQuickClick('/more')}>
            <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)', '0 4px 14px rgba(0, 180, 216, 0.4)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)', '0 4px 14px rgba(0, 180, 216, 0.4)').style}><FileText /></div>
            <span>{t('Prescription Verification')}</span>
          </div>
          <div className="legal-item" onClick={() => handleQuickClick('/records')}>
            <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #f77f00 0%, #d62828 100%)', '0 4px 14px rgba(247, 127, 0, 0.4)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #f77f00 0%, #d62828 100%)', '0 4px 14px rgba(247, 127, 0, 0.4)').style}><FolderLock /></div>
            <span>{t('Secure Health Records')}</span>
          </div>
          <div className="legal-item" onClick={() => handleQuickClick('/more')}>
            <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #4c9a2a 0%, #1e5a22 100%)', '0 4px 14px rgba(76, 154, 42, 0.4)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #4c9a2a 0%, #1e5a22 100%)', '0 4px 14px rgba(76, 154, 42, 0.4)').style}><ShieldCheck /></div>
            <span>{t('Telemedicine Compliance')}</span>
          </div>
          <div className="legal-item" onClick={() => handleQuickClick('/more')}>
            <div className={getIconConfig(iconStyle, 'linear-gradient(135deg, #ef233c 0%, #d90429 100%)', '0 4px 14px rgba(239, 35, 60, 0.4)').className} style={getIconConfig(iconStyle, 'linear-gradient(135deg, #ef233c 0%, #d90429 100%)', '0 4px 14px rgba(239, 35, 60, 0.4)').style}><Lock /></div>
            <span>{t('Legal Docs Vault')}</span>
          </div>
        </div>
        <div className="compliance-badges">
          <div className="badge">
            <ShieldCheck style={{ width: '16px', height: '16px', color: 'var(--accent-teal)' }} />
            <span>ABDM<br />{t('Compliant')}</span>
          </div>
          <div className="badge">
            <Shield style={{ width: '16px', height: '16px', color: 'var(--accent-cyan)' }} />
            <span>HIPAA<br />Secure</span>
          </div>
          <div className="badge">
            <Globe style={{ width: '16px', height: '16px', color: 'var(--accent-blue)' }} />
            <span>GDPR<br />Ready</span>
          </div>
          <div className="badge">
            <Lock style={{ width: '16px', height: '16px', color: 'var(--accent-teal)' }} />
            <span>DPDP<br />{t('Compliant')}</span>
          </div>
        </div>
      </section>

      {/* Health Insights & Education */}
      <section className="section section-last">
        <div className="section-header">
          <h3>{t('Health Insights & Education')}</h3>
          <a href="#" onClick={(e) => { e.preventDefault(); handleQuickClick('/health'); }} className="view-all">
            {t('View All')} <ChevronRight className="view-icon" style={{ width: '14px', height: '14px' }} />
          </a>
        </div>
        <div className="insights-scroll">
          <div className="insight-card" onClick={() => handleQuickClick('/health')} style={{ cursor: 'pointer' }}>
            <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=300" alt="Health Tips" />
            <span className="insight-title">{t('Health Tips')}</span>
            <span className="insight-desc">{t('Daily tips for a healthy life')}</span>
          </div>
          <div className="insight-card" onClick={() => handleQuickClick('/appointments')} style={{ cursor: 'pointer' }}>
            <img src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=300" alt="Appointments" />
            <span className="insight-title">{t('Appointment Reminders')}</span>
            <span className="insight-desc">{t('Never miss your appointments')}</span>
          </div>
          <div className="insight-card" onClick={() => handleQuickClick('/health')} style={{ cursor: 'pointer' }}>
            <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=300" alt="Preventive Care" />
            <span className="insight-title">{t('Preventive Care')}</span>
            <span className="insight-desc">{t('Regular checkups for a better you')}</span>
          </div>
          <div className="insight-card" onClick={() => handleQuickClick('/health')} style={{ cursor: 'pointer' }}>
            <img src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=300" alt="Chronic Disease" />
            <span className="insight-title">{t('Chronic Disease Programs')}</span>
            <span className="insight-desc">{t('Specialized care for chronic conditions')}</span>
          </div>
          <div className="insight-card" onClick={() => handleQuickClick('/health')} style={{ cursor: 'pointer' }}>
            <img src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=300" alt="AI Health" />
            <span className="insight-title">{t('AI Health Assistant')}</span>
            <span className="insight-desc">{t('Your smart health companion')}</span>
          </div>
        </div>
      </section>
    </>
  );
}
