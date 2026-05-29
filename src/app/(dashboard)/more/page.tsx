'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';
import { useLanguage } from '../../../providers/LanguageProvider';
import {
  Grid3X3,
  IdCard,
  Building2,
  ShieldCheck,
  Settings as SettingsIcon,
  FlaskConical,
  Stethoscope,
  Ambulance,
  Plane,
  Scale,
  ArrowLeft,
  CheckCircle,
  Truck,
  AlertOctagon,
  Play,
  Navigation,
  CheckSquare,
  Loader2
} from 'lucide-react';
import { showToast } from '../../../utils/toast';

interface OperationalGridItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  desc: string;
}

export default function MoreServicesPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { addRecord, logSecurityEvent, addNotification } = useAuth();
  
  const [activePanel, setActivePanel] = useState<string | null>(null);
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

  const getMoreIconStyle = (itemId: string) => {
    switch (itemId) {
      case 'abdm':
        return getIconConfig(iconStyle, 'linear-gradient(135deg, #7209b7 0%, #f72585 100%)', '0 4px 14px rgba(114, 9, 183, 0.4)');
      case 'connected':
        return getIconConfig(iconStyle, 'linear-gradient(135deg, #00d4aa 0%, #009688 100%)', '0 4px 14px color-mix(in srgb, var(--accent-teal) 40%, transparent)');
      case 'security':
        return getIconConfig(iconStyle, 'linear-gradient(135deg, #4c9a2a 0%, #1e5a22 100%)', '0 4px 14px rgba(76, 154, 42, 0.4)');
      case 'settings':
        return getIconConfig(iconStyle, 'linear-gradient(135deg, #8338ec 0%, #3a0ca3 100%)', '0 4px 14px rgba(131, 56, 236, 0.4)');
      case 'sample':
        return getIconConfig(iconStyle, 'linear-gradient(135deg, #f77f00 0%, #d62828 100%)', '0 4px 14px rgba(247, 127, 0, 0.4)');
      case 'equipment':
        return getIconConfig(iconStyle, 'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)', '0 4px 14px rgba(0, 180, 216, 0.4)');
      case 'ambulance':
        return getIconConfig(iconStyle, 'linear-gradient(135deg, #ef233c 0%, #d90429 100%)', '0 4px 14px rgba(239, 35, 60, 0.4)');
      case 'drone':
        return getIconConfig(iconStyle, 'linear-gradient(135deg, #00f5d4 0%, #00bbf9 100%)', '0 4px 14px rgba(0, 245, 212, 0.4)');
      case 'medicolegal':
        return getIconConfig(iconStyle, 'linear-gradient(135deg, #ff70a6 0%, #ff9770 100%)', '0 4px 14px rgba(255, 112, 166, 0.4)');
      default:
        return getIconConfig(iconStyle, 'linear-gradient(135deg, #00d4aa 0%, #00b4d8 100%)', '0 4px 14px color-mix(in srgb, var(--accent-teal) 40%, transparent)');
    }
  };

  // Micro-SaaS Panel states
  const [sampleLab, setSampleLab] = useState('DR AYESHAH HOMEO LAB, Bhopal');
  const [sampleTest, setSampleTest] = useState('Lipid Profile & Glucose Fasting (₹490)');
  const [sampleDate, setSampleDate] = useState('');
  
  const [ambulanceType, setAmbulanceType] = useState('ALS (Advanced Life Support)');
  const [ambulanceDestination, setAmbulanceDestination] = useState('Janki Raman Hospital, Jabalpur');
  const [isAmbulanceActive, setIsAmbulanceActive] = useState(false);
  const [ambulanceTimeLeft, setAmbulanceTimeLeft] = useState(4);

  const [droneChecklist, setDroneChecklist] = useState({
    gpsLock: false,
    cargoTemp: false,
    nhaAuth: false,
    battery: false
  });
  const [isDroneFlying, setIsDroneFlying] = useState(false);
  const [droneTelemetry, setDroneTelemetry] = useState({ alt: 0, speed: 0 });

  const gridItems: OperationalGridItem[] = [
    { id: 'abdm', title: 'ABDM Sandbox Services', icon: <IdCard />, desc: 'ABHA generation, Aadhaar gateway, and secure profile linking sandboxes.' },
    { id: 'connected', title: 'Connected Facilities', icon: <Building2 />, desc: 'Register OPD tokens and Scan & Share at linked smart hospitals instantly.' },
    { id: 'security', title: 'Security Audit Logs', icon: <ShieldCheck />, desc: 'Review HIPAA audit trails, masked credential logs, and JWT tokens.' },
    { id: 'settings', title: 'Preferences Settings', icon: <SettingsIcon />, desc: 'Accessibility font sizes, high contrast layout, and multilingual preferences.' },
    { id: 'sample', title: 'Home Sample Collection', icon: <FlaskConical />, desc: 'Schedule certified phlebotomists for blood, urine, or lipid extractions.' },
    { id: 'equipment', title: 'Medical Equipment Store', icon: <Stethoscope />, desc: 'Buy or rent verified BP cuffs, smart glucometers, and pulse oximeters.' },
    { id: 'ambulance', title: 'Ambulance Booking SOS', icon: <Ambulance style={{ color: 'var(--danger)' }} />, desc: 'Simulate rapid emergency dispatch, ALS/BLS triage, and real-time GPS routes.' },
    { id: 'drone', title: 'Drone Delivery Simulator', icon: <Plane />, desc: 'Pre-flight NHA compliance checklists and medical cargo telemetry.' },
    { id: 'medicolegal', title: 'Medicolegal Grievances', icon: <Scale />, desc: 'DPDP consent artifacts, HIPAA guidelines, and digital secure records vault.' }
  ];

  const handleCardClick = (id: string) => {
    if (id === 'connected') router.push('/connected');
    else if (id === 'security') router.push('/security');
    else if (id === 'settings') router.push('/settings');
    else setActivePanel(id);
  };

  // 1. Book Lab Sample Callback
  const handleSampleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sampleDate) {
      showToast(t('Please select a preferred date.'));
      return;
    }

    const testName = sampleTest.split(' (')[0];
    const priceVal = sampleTest.split('₹')[1]?.replace(')', '') || '290';

    addRecord({
      name: `Pending Lab Test - ${testName}.pdf`,
      type: 'Lab Invoice',
      date: new Date(sampleDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      source: sampleLab
    });

    logSecurityEvent('Sample Scheduled', `Phlebotomy appointment booked for ${testName} with ${sampleLab}`);
    showToast(t('Home Sample Collection Scheduled! Phlebotomist dispatched.'));
    setActivePanel(null);
  };

  // 2. Buy Equipment Callback
  const handleBuyEquipment = (name: string, price: number) => {
    addRecord({
      name: `Equipment Order - ${name}.pdf`,
      type: 'Receipt',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      source: 'ABHA SETU Store'
    });

    logSecurityEvent('Order Placed', `Ordered ${name} for ₹${price} successfully.`);
    showToast(t(`${name} ordered successfully! Recipt saved in Locker.`));
  };

  // 3. SOS Ambulance Simulation
  const triggerAmbulanceSOS = () => {
    setIsAmbulanceActive(true);
    setAmbulanceTimeLeft(4);
    logSecurityEvent('SOS Triggered', `Simulated SOS dispatch for ${ambulanceType} to ${ambulanceDestination}`);
    showToast(t('SOS Dispatch Active! Siren active, tracking GPS.'));

    const timer = setInterval(() => {
      setAmbulanceTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsAmbulanceActive(false);
          showToast(t('Ambulance arrived at destination! Patient triaged.'));
          return 0;
        }
        return prev - 1;
      });
    }, 2000);
  };

  // 4. Drone Delivery Clearance
  const launchDrone = () => {
    if (!droneChecklist.gpsLock || !droneChecklist.cargoTemp || !droneChecklist.nhaAuth || !droneChecklist.battery) {
      showToast(t('Pre-flight checklist incomplete! Clearance denied.'));
      return;
    }

    setIsDroneFlying(true);
    logSecurityEvent('Drone Launched', 'Cleared NHA medical drone cargo takeoff.');
    showToast(t('Takeoff cleared! Drone launched successfully.'));

    let altVal = 0;
    let speedVal = 0;
    const interval = setInterval(() => {
      altVal += 15;
      speedVal += 22;
      setDroneTelemetry({ alt: altVal, speed: speedVal });

      if (altVal >= 120) {
        clearInterval(interval);
        setTimeout(() => {
          setIsDroneFlying(false);
          setDroneTelemetry({ alt: 0, speed: 0 });
          showToast(t('Cargo delivered! Drone returned safely.'));
        }, 1500);
      }
    }, 400);
  };

  if (activePanel) {
    return (
      <>
        <section className="route-hero">
          <a href="#" onClick={(e) => { e.preventDefault(); setActivePanel(null); }} className="back-link">
            <ArrowLeft className="small-icon" style={{ width: '14px', height: '14px', marginRight: '4px' }} />
            Back to Directory
          </a>
          <div>
            <p className="eyebrow">ABHA SETU</p>
            <h2>{t(gridItems.find(g => g.id === activePanel)?.title || 'Operations')}</h2>
            <p>{t(gridItems.find(g => g.id === activePanel)?.desc || '')}</p>
          </div>
        </section>

        <div style={{ marginTop: '20px' }}>
          {/* A. ABDM Sandbox Panel */}
          {activePanel === 'abdm' && (
            <article className="route-card" style={{ padding: '24px' }}>
              <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <IdCard style={{ color: 'var(--accent-teal)' }} />
                <h3 style={{ margin: 0 }}>ABDM Gateway Gate Sandbox</h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px', marginTop: 0 }}>
                This simulated testing portal is linked to the <strong>Ayushman Bharat Sandbox Gateway</strong>. Develop, link, and test mock verification credentials, demographic registries, and secure FHIR pipelines instantly.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <button className="prefill-btn" onClick={() => router.push('/abha')}>Create ABHA Card</button>
                <button className="prefill-btn" onClick={() => router.push('/qr-scanner')}>Open Video QR Scanner</button>
                <button className="prefill-btn" onClick={() => { showToast(t('Checking ABDM Sandbox Gateway status... Online')); }}>Check Gateway Status (Online)</button>
              </div>
            </article>
          )}

          {/* B. Sample Collection Panel */}
          {activePanel === 'sample' && (
            <article className="route-card" style={{ padding: '24px' }}>
              <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <FlaskConical style={{ color: 'var(--accent-teal)' }} />
                <h3 style={{ margin: 0 }}>Certified NABL Laboratory Network</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '14px', marginTop: 0 }}>
                Select diagnostic profiles for home sample extraction. Secure phlebotomist tracking is verified under ABDM facilities credentials.
              </p>
              <form className="form-grid" onSubmit={handleSampleSubmit} style={{ display: 'grid', gap: '12px' }}>
                <label style={{ display: 'grid', gap: '4px' }}>Choose Laboratory Partner
                  <select value={sampleLab} onChange={(e) => setSampleLab(e.target.value)}>
                    <option value="DR AYESHAH HOMEO HEALTH MALL, Bhopal">DR AYESHAH HOMEO LAB, Bhopal</option>
                    <option value="Janki Raman Diagnostic Lab, Jabalpur">Janki Raman Diagnostic Lab, Jabalpur</option>
                    <option value="Metro Diagnostics NHA Partner">Metro Diagnostics NHA Partner</option>
                  </select>
                </label>
                <label style={{ display: 'grid', gap: '4px' }}>Diagnostic Test Profile
                  <select value={sampleTest} onChange={(e) => setSampleTest(e.target.value)}>
                    <option value="Complete Hemoglobin & White Cell Count (₹290)">Complete Hemoglobin & White Cell Count (₹290)</option>
                    <option value="Lipid Profile & Glucose Fasting (₹490)">Lipid Profile & Glucose Fasting (₹490)</option>
                    <option value="Thyroid Profile T3/T4/TSH (₹590)">Thyroid Profile T3/T4/TSH (₹590)</option>
                  </select>
                </label>
                <label style={{ display: 'grid', gap: '4px' }}>Schedule Extraction Date
                  <input type="date" required value={sampleDate} onChange={(e) => setSampleDate(e.target.value)} />
                </label>
                <button type="submit" className="join-btn" style={{ marginTop: '12px' }}>Confirm Phlebotomy Schedule</button>
              </form>
            </article>
          )}

          {/* C. Equipment Store Panel */}
          {activePanel === 'equipment' && (
            <div style={{ display: 'grid', gap: '16px' }}>
              <article className="route-card" style={{ padding: '24px' }}>
                <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Stethoscope style={{ color: 'var(--accent-teal)' }} />
                  <h3 style={{ margin: 0 }}>Smart Vitals Hardware Hub</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '16px', marginTop: 0 }}>
                  Order verified smart health cuffs, glucometers, and oximeters. Sync results automatically into your Secure Locker.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  <div className="route-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <strong>GlucoSetu Wireless Glucometer</strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Includes 50 diagnostic strips. Fasting glucose uploads automatically.</span>
                    <strong style={{ color: 'var(--accent-teal)' }}>₹1,199</strong>
                    <button className="join-btn" onClick={() => handleBuyEquipment('GlucoSetu Glucometer', 1199)} style={{ padding: '6px 12px', fontSize: '11px', marginTop: '8px' }}>Order Device</button>
                  </div>
                  <div className="route-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <strong>DialBP Smart Cuff</strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Fitted oximeter sync. Dual-user memory slots, certified NHA device.</span>
                    <strong style={{ color: 'var(--accent-teal)' }}>₹1,899</strong>
                    <button className="join-btn" onClick={() => handleBuyEquipment('DialBP Smart Cuff', 1899)} style={{ padding: '6px 12px', fontSize: '11px', marginTop: '8px' }}>Order Device</button>
                  </div>
                </div>
              </article>
            </div>
          )}

          {/* D. SOS Ambulance Panel */}
          {activePanel === 'ambulance' && (
            <article className="route-card" style={{ padding: '24px' }}>
              <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Ambulance style={{ color: 'var(--danger)' }} />
                <h3 style={{ margin: 0 }}>Rapid Ambulance SOS Booking</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '16px', marginTop: 0 }}>
                Book an emergency response team instantly. Simulated GPS routes and real-time NHA medical dispatch checklists.
              </p>
              {isAmbulanceActive ? (
                <div style={{ textAlign: 'center', padding: '24px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--danger)' }}>
                  <div className="pulse-dot" style={{ width: '16px', height: '16px', background: 'var(--danger)', margin: '0 auto 12px' }}></div>
                  <h4 style={{ color: 'var(--danger)', margin: '0 0 8px' }}>Emergency Sirens Active</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 12px' }}>
                    Ambulance ({ambulanceType}) dispatched to <strong>{ambulanceDestination}</strong>.
                  </p>
                  <strong style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Arriving in {ambulanceTimeLeft} mins...</strong>
                </div>
              ) : (
                <form className="form-grid" onSubmit={(e) => { e.preventDefault(); triggerAmbulanceSOS(); }} style={{ display: 'grid', gap: '12px' }}>
                  <label style={{ display: 'grid', gap: '4px' }}>Ambulance Dispatch Category
                    <select value={ambulanceType} onChange={(e) => setAmbulanceType(e.target.value)}>
                      <option value="ALS (Advanced Life Support)">ALS (Advanced Life Support)</option>
                      <option value="BLS (Basic Life Support)">BLS (Basic Life Support)</option>
                      <option value="Neonatal Critical Care Triage">Neonatal Critical Care Triage</option>
                    </select>
                  </label>
                  <label style={{ display: 'grid', gap: '4px' }}>Preferred Destination
                    <select value={ambulanceDestination} onChange={(e) => setAmbulanceDestination(e.target.value)}>
                      <option value="Janki Raman Hospital, Jabalpur">Janki Raman Hospital, Jabalpur</option>
                      <option value="DR AYESHAH HOMEO HEALTH MALL, Bhopal">DR AYESHAH HOMEO HEALTH MALL, Bhopal</option>
                    </select>
                  </label>
                  <button type="submit" className="join-btn" style={{ background: 'var(--danger)', border: 'none', color: '#fff', marginTop: '12px' }}>
                    Trigger SOS Emergency Dispatch
                  </button>
                </form>
              )}
            </article>
          )}

          {/* E. Drone Flight Panel */}
          {activePanel === 'drone' && (
            <article className="route-card" style={{ padding: '24px' }}>
              <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Plane style={{ color: 'var(--accent-teal)' }} />
                <h3 style={{ margin: 0 }}>NHA Medical Cargo Drone Simulator</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '16px', marginTop: 0 }}>
                Test and execute pre-flight checks, clear airway clearances, and dispatch medical supply drone flights.
              </p>
              {isDroneFlying ? (
                <div style={{ textAlign: 'center', padding: '24px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--accent-teal)' }}>
                  <Loader2 className="animate-spin" style={{ width: '32px', height: '32px', color: 'var(--accent-teal)', margin: '0 auto 12px' }} />
                  <h4 style={{ color: 'var(--accent-teal)', margin: '0 0 8px' }}>Drone In Flight Telemetry</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>ALTITUDE</span>
                      <strong style={{ fontSize: '16px' }}>{droneTelemetry.alt} ft</strong>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>SPEED</span>
                      <strong style={{ fontSize: '16px' }}>{droneTelemetry.speed} km/h</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 style={{ fontSize: '13px', marginBottom: '12px', marginTop: 0 }}>Pre-Flight Telemetry Check-list</h4>
                  <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={droneChecklist.gpsLock} onChange={(e) => setDroneChecklist(prev => ({ ...prev, gpsLock: e.target.checked }))} />
                      <span>GPS Satellite Link Locked</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={droneChecklist.cargoTemp} onChange={(e) => setDroneChecklist(prev => ({ ...prev, cargoTemp: e.target.checked }))} />
                      <span>Cargo Cold-chain Temp Stabilized (+4°C)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={droneChecklist.nhaAuth} onChange={(e) => setDroneChecklist(prev => ({ ...prev, nhaAuth: e.target.checked }))} />
                      <span>NHA Airway Authorization Token Signed</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={droneChecklist.battery} onChange={(e) => setDroneChecklist(prev => ({ ...prev, battery: e.target.checked }))} />
                      <span>Pre-flight Battery Checked (100% capacity)</span>
                    </label>
                  </div>
                  <button className="join-btn" style={{ width: '100%', margin: 0 }} onClick={launchDrone}>
                    Launch Medical supply Flight
                  </button>
                </div>
              )}
            </article>
          )}

          {/* F. Medicolegal Panel */}
          {activePanel === 'medicolegal' && (
            <article className="route-card" style={{ padding: '24px' }}>
              <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Scale style={{ color: 'var(--accent-teal)' }} />
                <h3 style={{ margin: 0 }}>Medicolegal & Secure Consent Vault</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: '1.6', marginBottom: '20px', marginTop: 0 }}>
                Healthcare operations are linked to the <strong>Digital Personal Data Protection (DPDP) Act</strong> guidelines. Patient data exchanges are strictly consent-based, protected by public key cryptography, and recorded securely in local audit logs.
              </p>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '14px', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <AlertOctagon style={{ color: '#f59e0b', flexShrink: 0, width: '18px', height: '18px' }} />
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    <strong>DPDP Guidelines:</strong> You can download or review consent registry status logs, revoke active clinical sharing permissions, and download clinical logs inside locker.
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                  <button className="prefill-btn" onClick={() => router.push('/security')}>Verify Security Audit logs</button>
                  <button className="prefill-btn" onClick={() => router.push('/records')}>Retrieve Linked Records Locker</button>
                </div>
              </div>
            </article>
          )}
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
          <h2>{t('More Services')}</h2>
          <p>{t('Navigate compliant healthcare SaaS workflows.')}</p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="route-grid service-grid" style={{ gap: '16px', marginTop: '20px' }}>
        {gridItems.map((item) => (
          <article
            key={item.id}
            className="route-card"
            onClick={() => handleCardClick(item.id)}
            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '6px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div 
                className={getMoreIconStyle(item.id).className} 
                style={getMoreIconStyle(item.id).style}
              >
                {item.icon}
              </div>
              <h3 style={{ fontSize: '14px', margin: 0 }}>{t(item.title)}</h3>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5', flex: 1 }}>
              {t(item.desc)}
            </p>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCardClick(item.id); }}
              style={{ fontSize: '12px', color: 'var(--accent-teal)', fontWeight: 'bold', marginTop: '8px', display: 'inline-block' }}
            >
              Open Flow
            </a>
          </article>
        ))}
      </section>
    </>
  );
}
