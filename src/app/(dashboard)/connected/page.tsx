'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';
import { useLanguage } from '../../../providers/LanguageProvider';
import {
  Building,
  Building2,
  QrCode,
  ArrowLeft,
  HeartPulse,
  Heart,
  Users,
  ClipboardCheck,
  CheckCircle
} from 'lucide-react';
import { showToast } from '../../../utils/toast';

interface Facility {
  title: string;
  route: string;
  icon: string;
  desc: string;
  hfrId: string;
  type: string;
  services: string;
}

const connectedFacilities: Facility[] = [
  {
    title: "Janki Raman Hospital & Critical Care Centre, Jabalpur",
    route: "facility-jankiraman",
    icon: "building-2",
    desc: "HFR-ready OPD registrations, critical care facility, emergency routing, Scan and Share active.",
    hfrId: "IN2310026968",
    type: "Hospital",
    services: "Critical Care, OPD, Emergency, General Medicine"
  },
  {
    title: "DR AYESHAH HOMEO HEALTH MALL, Bhopal",
    route: "facility-homeohealth",
    icon: "heart-pulse",
    desc: "ABHA verification desk, homeopathic care, digital prescriptions, wellness consultation.",
    hfrId: "IN2310026365",
    type: "Wellness Center",
    services: "Homeopathy, Primary Care, Wellness, Consultation"
  }
];

export default function ConnectedFacilitiesPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { setActiveToken, addAppointment, addNotification, logSecurityEvent } = useAuth();
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [iconStyle, setIconStyle] = useState<'glassmorphic' | '3d-gradient' | 'minimalist'>('glassmorphic');

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

  const handleFacilityCheckin = (facility: Facility) => {
    setIsCheckingIn(true);
    showToast(t('Syncing ABHA data with gateway...'));

    setTimeout(() => {
      const tokenNum = `SETU-OPD-${Math.floor(100 + Math.random() * 900)}`;
      const now = Date.now();
      const expiresAt = now + 15 * 60 * 1000;
      const timeStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setActiveToken({
        tokenNum,
        facilityName: facility.title,
        expiresAt
      });

      addAppointment({
        title: 'OPD Check-In Queue ticket',
        doctor: `${facility.title} - General OPD`,
        meta: `Checked In at ${timeStr}`,
        status: 'Active Ticket',
        token: tokenNum
      });

      addNotification(
        'OPD Ticket Created',
        `Successfully checked in at ${facility.title}. Queue Token: ${tokenNum}`,
        'abdm'
      );

      logSecurityEvent('OPD Checked-In', `Facility Scan Share check-in ticket: ${tokenNum} at ${facility.title}`);
      setIsCheckingIn(false);
      showToast(t('OPD Ticket Active! Go to Appointments to view ticket.'));
      router.push('/appointments');
    }, 1500);
  };

  if (selectedFacility) {
    return (
      <>
        {/* Route Hero Header */}
        <section className="route-hero">
          <a href="#" onClick={(e) => { e.preventDefault(); setSelectedFacility(null); }} className="back-link">
            <ArrowLeft className="small-icon" style={{ width: '14px', height: '14px', marginRight: '4px' }} />
            Back to Network
          </a>
          <div>
            <p className="eyebrow">ABHA SETU</p>
            <h2>{t(selectedFacility.title)}</h2>
            <p>{t('AYUSHMAN BHARAT verified network clinic.')}</p>
          </div>
        </section>

        {/* Facility Details Page */}
        <div style={{ marginTop: '20px' }}>
          <section className="route-grid metrics-grid">
            <article className="metric-card">
              <Building className="card-icon" style={{ color: 'var(--accent-teal)' }} />
              <span>HFR Register ID</span>
              <strong style={{ fontSize: '14px' }}>{selectedFacility.hfrId}</strong>
              <small>National Registry Valid</small>
            </article>
            <article className="metric-card">
              <Heart className="card-icon" style={{ color: 'var(--danger)' }} />
              <span>Connected Pipeline</span>
              <strong>ABDM V3 Ready</strong>
              <small>Encrypted FHIR logs</small>
            </article>
            <article className="metric-card">
              <Users className="card-icon" style={{ color: 'var(--accent-cyan)' }} />
              <span>OPD Desk queues</span>
              <strong>Active</strong>
              <small>Generate instant ticket</small>
            </article>
          </section>

          <section className="route-grid two-col" style={{ marginTop: '16px', gap: '20px' }}>
            <article className="route-card">
              <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <ClipboardCheck style={{ color: 'var(--accent-teal)' }} />
                <h3 style={{ margin: 0 }}>Connected Services</h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                This facility is integrated with the Ayushman Bharat Digital Mission. You can check in automatically, retrieve prescriptions digitally in your locker, and verify laboratory diagnostics:
                <br /><br />
                <strong>Specialities:</strong> {t(selectedFacility.services)}
              </p>
            </article>
            <article className="route-card">
              <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <QrCode style={{ color: 'var(--accent-cyan)' }} />
                <h3 style={{ margin: 0 }}>Scan & Share Check-In</h3>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px', marginTop: 0 }}>
                Present your ABHA card details instantly via scanning or pre-register OPD tickets digitally to bypass physical reception desks.
              </p>
              <button
                className="join-btn"
                style={{ margin: 0 }}
                onClick={() => handleFacilityCheckin(selectedFacility)}
                disabled={isCheckingIn}
              >
                {isCheckingIn ? 'Sharing Credentials...' : 'Share Profile & Check In'}
              </button>
            </article>
          </section>
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
          <h2>{t('Connected Facilities')}</h2>
          <p>{t('AYUSHMAN BHARAT Health Facility Registry (HFR) network.')}</p>
        </div>
      </section>

      {/* Main Connected Facilities List */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px', marginBottom: '22px', marginTop: '20px' }}>
        <article className="route-card">
          <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <QrCode style={{ color: 'var(--accent-teal)' }} />
            <h3 style={{ margin: 0 }}>Scan Facility Check-In</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '12px', marginTop: 0 }}>
            Arrived at a network facility? Click below to launch the scanner HUD and generate a rapid OPD Queue Ticket.
          </p>
          <button className="join-btn" style={{ margin: 0 }} onClick={() => router.push('/qr-scanner')}>Open ABDM QR Scanner</button>
        </article>
      </div>

      <section className="route-grid service-grid" style={{ gap: '16px' }}>
        {connectedFacilities.map((f, index) => (
          <article key={index} className="route-card" style={{ cursor: 'pointer' }} onClick={() => setSelectedFacility(f)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div
                className={f.icon === 'building-2'
                  ? getIconConfig(iconStyle, 'linear-gradient(135deg, #00d4aa 0%, #009688 100%)', '0 4px 14px color-mix(in srgb, var(--accent-teal) 40%, transparent)').className
                  : getIconConfig(iconStyle, 'linear-gradient(135deg, #ef233c 0%, #d90429 100%)', '0 4px 14px rgba(239, 35, 60, 0.4)').className
                }
                style={f.icon === 'building-2'
                  ? getIconConfig(iconStyle, 'linear-gradient(135deg, #00d4aa 0%, #009688 100%)', '0 4px 14px color-mix(in srgb, var(--accent-teal) 40%, transparent)').style
                  : getIconConfig(iconStyle, 'linear-gradient(135deg, #ef233c 0%, #d90429 100%)', '0 4px 14px rgba(239, 35, 60, 0.4)').style
                }
              >
                {f.icon === 'building-2' ? <Building2 style={{ width: '20px', height: '20px' }} /> : <HeartPulse style={{ width: '20px', height: '20px' }} />}
              </div>
              <h3 style={{ fontSize: '14px', margin: 0, flex: 1 }}>{t(f.title)}</h3>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px', height: '48px', overflow: 'hidden' }}>{t(f.desc)}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="live-badge" style={{ padding: '2px 8px', fontSize: '9px', background: 'color-mix(in srgb, var(--accent-teal) 15%, transparent)', color: 'var(--accent-teal)' }}>HFR Verified</span>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedFacility(f); }}
                style={{ fontSize: '12px', color: 'var(--accent-teal)', fontWeight: 'bold' }}
              >
                Open Details
              </a>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
