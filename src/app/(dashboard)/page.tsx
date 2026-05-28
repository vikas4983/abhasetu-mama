'use client';

import React from 'react';
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

  // Load current BP from synced records or default
  const hasKioskRecord = records.some(r => r.name.includes("ATM") || r.source.includes("Kiosk"));
  const bpVal = hasKioskRecord ? "118/78" : "120/80";
  const spo2Val = "98%";
  const glucoseVal = "98";
  const heartVal = "72";

  const handleQuickClick = (route: string) => {
    router.push(route);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h2>
            {t('Your Digital')}<br />
            <span className="gradient-text">{t('Healthcare Ecosystem')}</span>
          </h2>
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
        </div>
        <div className="hero-actions">
          <button className="hero-btn" onClick={() => handleQuickClick('/appointments')}>
            <Users className="btn-icon" style={{ width: '18px', height: '18px' }} />
            <span>{t('Book Consultation')}</span>
          </button>
          <button className="hero-btn" onClick={() => handleQuickClick('/more')}>
            <Monitor className="btn-icon" style={{ width: '18px', height: '18px' }} />
            <span>{t('Health ATM')}</span>
          </button>
          <button className="hero-btn" onClick={() => handleQuickClick('/records')}>
            <Lock className="btn-icon" style={{ width: '18px', height: '18px' }} />
            <span>{t('Digital Locker')}</span>
          </button>
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
            <div className="quick-icon"><Stethoscope /></div>
            <span>{t('Consult Doctor')}</span>
          </div>
          <div className="quick-item" onClick={() => handleQuickClick('/more')}>
            <div className="quick-icon"><Pill /></div>
            <span>{t('Order Medicines')}</span>
          </div>
          <div className="quick-item" onClick={() => handleQuickClick('/more')}>
            <div className="quick-icon"><FlaskConical /></div>
            <span>{t('Book Lab Tests')}</span>
          </div>
          <div className="quick-item" onClick={() => handleQuickClick('/records')}>
            <div className="quick-icon"><ShieldCheck /></div>
            <span>{t('Manage Insurance')}</span>
          </div>
          <div className="quick-item" onClick={() => handleQuickClick('/about')}>
            <div className="quick-icon"><GraduationCap /></div>
            <span>{t('Training & Courses')}</span>
          </div>
          <div className="quick-item" onClick={() => handleQuickClick('/connected')}>
            <div className="quick-icon"><Building2 /></div>
            <span>{t('Hospitals')}</span>
          </div>
          <div className="quick-item" onClick={() => handleQuickClick('/more')}>
            <div className="quick-icon"><Droplet style={{ color: '#ef4444' }} /></div>
            <span>{t('Blood Bank')}</span>
          </div>
          <div className="quick-item" onClick={() => handleQuickClick('/more')}>
            <div className="quick-icon"><HeartHandshake /></div>
            <span>{t('Organ Donation')}</span>
          </div>
          <div className="quick-item" onClick={() => handleQuickClick('/qr-scanner')}>
            <div className="quick-icon"><QrCode /></div>
            <span>{t('QR Scanner')}</span>
          </div>
          <div className="quick-item" onClick={() => handleQuickClick('/abha')}>
            <div className="quick-icon"><IdCard /></div>
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
            <div className="status-icon"><BrainCircuit /></div>
            <div className="status-info">
              <span className="status-title">{t('AI Alerts')}</span>
              <span className="status-value">2 New</span>
            </div>
          </div>
          <div className="status-card" onClick={() => handleQuickClick('/health')} style={{ cursor: 'pointer' }}>
            <div className="status-icon"><Smartphone /></div>
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
            <div className="market-icon"><Truck /></div>
            <span>{t('Medicine Delivery')}</span>
          </div>
          <div className="market-item" onClick={() => handleQuickClick('/more')}>
            <div className="market-icon"><FlaskConical /></div>
            <span>{t('Lab Booking')}</span>
          </div>
          <div className="market-item" onClick={() => handleQuickClick('/more')}>
            <div className="market-icon"><TestTube /></div>
            <span>{t('Home Sample Collection')}</span>
          </div>
          <div className="market-item" onClick={() => handleQuickClick('/more')}>
            <div className="market-icon"><Stethoscope /></div>
            <span>{t('Medical Equipment')}</span>
          </div>
          <div className="market-item" onClick={() => handleQuickClick('/more')}>
            <div className="market-icon"><Ambulance /></div>
            <span>{t('Ambulance Booking')}</span>
          </div>
          <div className="market-item market-soon">
            <div className="market-icon"><Plane style={{ color: 'var(--text-muted)' }} /></div>
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
            <div className="legal-icon"><Scale /></div>
            <span>{t('Medicolegal Support')}</span>
          </div>
          <div className="legal-item" onClick={() => handleQuickClick('/more')}>
            <div className="legal-icon"><FileCheck /></div>
            <span>{t('Digital Consent Forms')}</span>
          </div>
          <div className="legal-item" onClick={() => handleQuickClick('/more')}>
            <div className="legal-icon"><FileText /></div>
            <span>{t('Prescription Verification')}</span>
          </div>
          <div className="legal-item" onClick={() => handleQuickClick('/records')}>
            <div className="legal-icon"><FolderLock /></div>
            <span>{t('Secure Health Records')}</span>
          </div>
          <div className="legal-item" onClick={() => handleQuickClick('/more')}>
            <div className="legal-icon"><ShieldCheck /></div>
            <span>{t('Telemedicine Compliance')}</span>
          </div>
          <div className="legal-item" onClick={() => handleQuickClick('/more')}>
            <div className="legal-icon"><Lock /></div>
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
