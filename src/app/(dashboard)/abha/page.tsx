'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';
import { useLanguage } from '../../../providers/LanguageProvider';
import { ArrowLeft, Download, ShieldCheck, Calendar, FolderLock } from 'lucide-react';
import { showToast } from '../../../utils/toast';

export default function AbhaPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { addRecord, logSecurityEvent } = useAuth();

  const name = "Dr. Ayesha Ali";
  const mobile = "9981057765";
  const abhaId = "ayesha.ali.9981057765@abdm";
  const abhaNumber = "91-9981-0577-6582";

  const handleSaveToLocker = () => {
    // Add card to locker records
    const newRecord = {
      name: 'ABHA_Smart_Card.pdf',
      type: 'ID Card',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      source: 'National Health Authority',
    };
    addRecord(newRecord);
    logSecurityEvent('ABHA Card Saved', 'User clicked Save to Health Locker on replica ABHA Card screen.');
    showToast(t('ABHA ID Card successfully synced and saved inside secure Health Locker.'));
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
          <h2>{t('My ABHA Card')}</h2>
          <p>{t('Authorized Digital Health Card issued under Ayushman Bharat Digital Mission.')}</p>
        </div>
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '600px', margin: '20px auto 0' }}>
        {/* Replica ABHA Card */}
        <article className="setu-abha-card" style={{ width: '100%' }}>
          {/* Banner Header (Dark Blue) */}
          <div className="setu-abha-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#0a1e36', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: '#ffffff', borderRadius: '4px', padding: '2px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src="https://dashboard.abdm.gov.in/uploads/nha_logo_dcf106b16e.png"
                  alt="NHA Logo"
                  style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div style={{ color: '#ffffff', lineHeight: '1.2' }}>
                <h4 style={{ margin: 0, fontSize: '9px', fontWeight: 800, letterSpacing: '0.5px', color: '#ffffff', textTransform: 'uppercase' }}>national health authority</h4>
                <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.75)', display: 'block' }}>Government of India</span>
              </div>
            </div>
            <div style={{ textAlign: 'center', color: '#ffffff', flex: 1, padding: '0 6px' }}>
              <div style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.3px', color: '#fff', textTransform: 'uppercase' }}>Ayushman Bharat Health Account</div>
              <div style={{ fontSize: '9px', opacity: 0.85, marginTop: '1px', color: '#fff' }}>आयुष्मान भारत स्वास्थ्य खाता (आभा)</div>
            </div>
            <div style={{ background: '#ffffff', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', flexShrink: 0 }}>
              <img
                src="https://dashboard.abdm.gov.in/uploads/abdm_logo_1d3e8ad9c8.png"
                alt="ABDM Logo"
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
          
          {/* Card Body Content */}
          <div className="setu-abha-card-body" style={{ position: 'relative', display: 'flex', gap: '14px', padding: '16px', background: 'radial-gradient(circle, #f8fafc 0%, #e2e8f0 100%)', color: '#0f172a' }}>
            <div className="setu-abha-card-seal" style={{ position: 'absolute', top: '10px', right: '140px', padding: '2px 8px', border: '2px solid rgba(16, 185, 129, 0.4)', borderRadius: '4px', color: '#10b981', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', transform: 'rotate(-8deg)', letterSpacing: '0.5px' }}>VERIFIED</div>
            
            {/* Left Column Profile Pic */}
            <div className="setu-abha-card-avatar-wrapper" style={{ flexShrink: 0 }}>
              <div className="setu-abha-card-avatar" style={{ width: '90px', height: '110px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #94a3b8' }}>
                <img
                  src="/assets/doctors/dr-ayesha-ali.jpeg"
                  alt="Dr. Ayesha Ali"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=150';
                  }}
                />
              </div>
            </div>
            
            {/* Center Column Details */}
            <div className="setu-abha-card-details" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
              <div className="setu-abha-card-field">
                <span className="setu-abha-card-label" style={{ fontSize: '8px', color: '#64748b', display: 'block' }}>Name/नाम</span>
                <strong className="setu-abha-card-value" style={{ fontSize: '13px', color: '#0f172a', fontWeight: '800' }}>{name}</strong>
              </div>
              
              <div className="setu-abha-card-field">
                <span className="setu-abha-card-label" style={{ fontSize: '8px', color: '#64748b', display: 'block' }}>ABHA Number/आभा-संख्या</span>
                <strong className="setu-abha-card-value token-num" style={{ fontSize: '13px', color: 'var(--accent-blue)', fontFamily: 'monospace' }}>{abhaNumber}</strong>
              </div>
              
              <div className="setu-abha-card-field">
                <span className="setu-abha-card-label" style={{ fontSize: '8px', color: '#64748b', display: 'block' }}>ABHA Address/आभा पता</span>
                <strong className="setu-abha-card-value token-num" style={{ color: '#0f172a', fontSize: '11px', fontFamily: 'monospace' }}>{abhaId}</strong>
              </div>
              
              <div className="setu-abha-card-row" style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <div className="setu-abha-card-field">
                  <span className="setu-abha-card-label" style={{ fontSize: '8px', color: '#64748b' }}>Gender/लिंग</span>
                  <span className="setu-abha-card-value" style={{ display: 'block', fontSize: '10px', fontWeight: 600 }}>Female</span>
                </div>
                <div className="setu-abha-card-field">
                  <span className="setu-abha-card-label" style={{ fontSize: '8px', color: '#64748b' }}>DOB/जन्मतारीख</span>
                  <span className="setu-abha-card-value" style={{ display: 'block', fontSize: '10px', fontWeight: 600 }}>15-08-1980</span>
                </div>
                <div className="setu-abha-card-field">
                  <span className="setu-abha-card-label" style={{ fontSize: '8px', color: '#64748b' }}>Mobile/मोबाइल</span>
                  <span className="setu-abha-card-value" style={{ display: 'block', fontSize: '10px', fontWeight: 600 }}>{mobile}</span>
                </div>
              </div>
            </div>
            
            {/* Right Column QR Code */}
            <div className="setu-abha-card-qr-wrapper" style={{ flexShrink: 0, alignSelf: 'center' }}>
              <div className="setu-abha-card-qr" style={{ padding: '6px', background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=ABHA:${abhaNumber};${abhaId}`}
                  alt="ABHA QR"
                  style={{ width: '80px', height: '80px' }}
                />
              </div>
            </div>
          </div>
        </article>
        
        {/* Save to Health Locker Button */}
        <button
          onClick={handleSaveToLocker}
          style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(90deg, #1f3a60, #10b981)', color: '#ffffff', fontWeight: 800, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.25)', transition: 'all 0.2s ease' }}
        >
          <Download className="small-icon" style={{ width: '16px', height: '16px' }} />
          <span>Save to Health Locker</span>
        </button>

        {/* Sub tabs for appointments & history */}
        <div style={{ width: '100%', display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button className="join-btn" onClick={() => router.push('/appointments')} style={{ flex: 1, margin: 0 }}>OPD Queue Registry</button>
          <button className="join-btn" onClick={() => router.push('/records')} style={{ flex: 1, margin: 0, background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>Linked Health Records</button>
        </div>
      </div>
    </>
  );
}
