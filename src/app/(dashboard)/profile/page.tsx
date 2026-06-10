/**
 * @file        page.tsx
 * @description Profile page displaying user's ABHA card and providing tabs to update mobile number and verify email.
 * @module      profile
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-10
 * @modified    2026-06-10
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';
import { useLanguage } from '../../../providers/LanguageProvider';
import { showToast } from '../../../utils/toast';
import {
  User,
  ShieldCheck,
  Download,
  Database,
  Send,
  ArrowLeft,
  Phone,
  Mail,
  X,
  Lock,
  Unlock,
  Key
} from 'lucide-react';


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

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { currentUser, updateCurrentUser, addRecord } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'mobile' | 'email'>('mobile');

  // Update Mobile States
  const [newMobile, setNewMobile] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [mobileTxnId, setMobileTxnId] = useState('');
  const [mobileOtpModal, setMobileOtpModal] = useState(false);
  const [mobileTimer, setMobileTimer] = useState(60);
  const [mobileLoading, setMobileLoading] = useState(false);
  const [mobileError, setMobileError] = useState('');

  // Update Email States
  const [newEmail, setNewEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpModal, setEmailOtpModal] = useState(false);
  const [emailTimer, setEmailTimer] = useState(60);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Timer Countdown Handlers
  useEffect(() => {
    let timerId: any;
    if (mobileOtpModal && mobileTimer > 0) {
      timerId = setInterval(() => {
        setMobileTimer(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [mobileOtpModal, mobileTimer]);

  useEffect(() => {
    let timerId: any;
    if (emailOtpModal && emailTimer > 0) {
      timerId = setInterval(() => {
        setEmailTimer(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [emailOtpModal, emailTimer]);

  if (!currentUser || !currentUser.abhaProfile) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-primary)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{t('Access Denied')}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px' }}>
          {t('Please verify or link your ABHA card first to view this profile dashboard.')}
        </p>
        <button
          onClick={() => router.push('/abha')}
          style={{
            marginTop: '16px',
            padding: '10px 20px',
            background: 'var(--accent-teal)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {t('Go to ABHA Onboarding')}
        </button>
      </div>
    );
  }

  const abhaProfile = currentUser.abhaProfile;

  // Actions for Card
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
    try {
      showToast(t('Downloading official ABHA Card image...'));
      const res = await fetch('/api/abdm/v3/profile/account/abha-card');
      if (!res.ok) {
        const errData = await res.json();
        const msg = errData.description || errData.message || t('Failed to download ABHA card');
        showToast(t('Error: ') + msg);
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `ABHA_Smart_Card_${abhaProfile.ABHANumber || abhaProfile.abhaNumber || 'Verified'}.png`;
      link.href = url;
      link.click();
      window.URL.revokeObjectURL(url);
      showToast(t('ABHA Card downloaded successfully!'));
    } catch (err: any) {
      console.error(err);
      showToast(t('Failed to download card.'));
    }
  };

  const handleShareCard = async () => {
    try {
      showToast(t('Requesting shareable ABHA Card image...'));
      const res = await fetch('/api/abdm/v3/profile/account/abha-card');
      if (!res.ok) {
        const errData = await res.json();
        const msg = errData.description || errData.message || t('Failed to retrieve ABHA card');
        showToast(t('Error: ') + msg);
        return;
      }
      const blob = await res.blob();
      const file = new File([blob], `ABHA_Smart_Card_${abhaProfile.ABHANumber || abhaProfile.abhaNumber || 'Verified'}.png`, { type: 'image/png' });
      
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
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `ABHA_Smart_Card_${abhaProfile.ABHANumber || abhaProfile.abhaNumber || 'Verified'}.png`;
          link.href = url;
          link.click();
          window.URL.revokeObjectURL(url);
          showToast(t('Web Share not supported. Downloaded instead.'));
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast(t('Failed to share card.'));
    }
  };

  // Mobile Update Actions
  const handleRequestMobileOtp = async () => {
    if (newMobile.length !== 10) return;
    setMobileLoading(true);
    setMobileError('');
    try {
      const res = await fetch('/api/abdm/v3/enrollment/request/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginHint: 'mobile',
          loginId: newMobile
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setMobileTxnId(data.txnId);
        setMobileOtpModal(true);
        setMobileTimer(60);
        showToast(t('OTP code sent successfully.'));
      } else {
        setMobileError(data.message || 'Failed to request OTP');
      }
    } catch (e: any) {
      setMobileError(e.message || 'Network error requesting OTP');
    } finally {
      setMobileLoading(false);
    }
  };

  const handleVerifyMobileOtp = async () => {
    if (mobileOtp.length !== 6) return;
    setMobileLoading(true);
    setMobileError('');
    try {
      const res = await fetch('/api/abdm/v3/enrollment/auth/byAbdm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txnId: mobileTxnId,
          authData: {
            authMethods: ['otp'],
            otp: {
              txnId: mobileTxnId,
              otpValue: mobileOtp
            }
          }
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const updatedProfile = { ...abhaProfile, mobile: newMobile };
        
        const state = JSON.parse(localStorage.getItem('setu_state') || '{}');
        if (state.currentUser) {
          state.currentUser.abhaProfile = updatedProfile;
          localStorage.setItem('setu_state', JSON.stringify(state));
        }
        
        updateCurrentUser({
          abhaProfile: updatedProfile
        });

        showToast(t('Mobile number updated successfully!'));
        setMobileOtpModal(false);
        setNewMobile('');
        setMobileOtp('');
      } else {
        setMobileError(data.message || 'Invalid OTP code');
      }
    } catch (e: any) {
      setMobileError(e.message || 'Network error verifying OTP');
    } finally {
      setMobileLoading(false);
    }
  };

  // Email Verification Actions
  const handleRequestEmailOtp = async () => {
    if (!newEmail.includes('@')) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailLoading(true);
    setEmailError('');
    try {
      // Simulate NHA Sandbox email request
      await new Promise(r => setTimeout(r, 600));
      setEmailOtpModal(true);
      setEmailTimer(60);
      showToast(t('Verification OTP sent to your email.'));
    } catch (e: any) {
      setEmailError(e.message || 'Failed to send OTP.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (emailOtp.length !== 6) return;
    setEmailLoading(true);
    setEmailError('');
    try {
      // Simulate verification (Accepts 123456 as valid test code)
      await new Promise(r => setTimeout(r, 600));
      if (emailOtp === '123456') {
        const updatedProfile = { ...abhaProfile, email: newEmail };
        const state = JSON.parse(localStorage.getItem('setu_state') || '{}');
        if (state.currentUser) {
          state.currentUser.abhaProfile = updatedProfile;
          localStorage.setItem('setu_state', JSON.stringify(state));
        }
        updateCurrentUser({
          abhaProfile: updatedProfile
        });
        showToast(t('Email address verified successfully!'));
        setEmailOtpModal(false);
        setNewEmail('');
        setEmailOtp('');
      } else {
        setEmailError('Invalid OTP code. Enter 123456 for sandbox testing.');
      }
    } catch (e: any) {
      setEmailError('Failed to verify OTP.');
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px 16px', maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Back button and title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => router.push('/abha')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '4px'
          }}
          aria-label="Back"
        >
          <ArrowLeft style={{ width: '20px', height: '20px' }} />
        </button>
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {t('My ABHA Profile')}
          </h2>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Manage secure demographics, linked mobile and email address verification
          </span>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '24px',
        width: '100%',
        alignItems: 'start'
      }} className="profile-grid">
        
        {/* CSS grid media query support for desktop layout */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media (min-width: 900px) {
            .profile-grid {
              grid-template-columns: 460px 1fr !important;
            }
          }
        `}} />

        {/* Left Side: ABHA Card representation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
          <article 
            id="abha-card-capture-profile"
            className="setu-abha-card" 
            style={{ 
              width: '100%',
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
                    src={getPhotoSrc(abhaProfile.photo)}
                    alt={abhaProfile.firstName}
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
                    {[abhaProfile.firstName, abhaProfile.middleName, abhaProfile.lastName].filter(Boolean).join(' ')}
                  </strong>
                </div>
                
                <div className="setu-abha-card-field">
                  <span className="setu-abha-card-label" style={{ fontSize: '7px', color: '#64748b', display: 'block', fontWeight: 700 }}>ABHA Number / आभा संख्या</span>
                  <strong className="setu-abha-card-value token-num" style={{ fontSize: '11px', color: 'var(--accent-blue)', fontFamily: 'monospace', fontWeight: 800 }}>
                    {abhaProfile.ABHANumber || abhaProfile.abhaNumber}
                  </strong>
                </div>
                
                <div className="setu-abha-card-field">
                  <span className="setu-abha-card-label" style={{ fontSize: '7px', color: '#64748b', display: 'block', fontWeight: 700 }}>ABHA Address / आभा पता</span>
                  <strong className="setu-abha-card-value token-num" style={{ color: '#0f172a', fontSize: '9px', fontFamily: 'monospace', fontWeight: 700, wordBreak: 'break-all' }}>
                    {abhaProfile.preferredAddress || abhaProfile.abhaAddress}
                  </strong>
                </div>
                
                <div className="setu-abha-card-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px', marginTop: '2px' }}>
                  <div className="setu-abha-card-field">
                    <span className="setu-abha-card-label" style={{ fontSize: '7px', color: '#64748b', display: 'block', fontWeight: 700 }}>Gender / लिंग</span>
                    <span className="setu-abha-card-value" style={{ fontSize: '9px', fontWeight: 600 }}>
                      {getGenderDisplay(abhaProfile.gender)}
                    </span>
                  </div>
                  <div className="setu-abha-card-field">
                    <span className="setu-abha-card-label" style={{ fontSize: '7px', color: '#64748b', display: 'block', fontWeight: 700 }}>DOB / जन्म तिथि</span>
                    <span className="setu-abha-card-value" style={{ fontSize: '9px', fontWeight: 600 }}>{abhaProfile.dob}</span>
                  </div>
                  <div className="setu-abha-card-field" style={{ gridColumn: 'span 2' }}>
                    <span className="setu-abha-card-label" style={{ fontSize: '7px', color: '#64748b', display: 'block', fontWeight: 700 }}>Mobile / मोबाइल</span>
                    <span className="setu-abha-card-value" style={{ fontSize: '9px', fontWeight: 600 }}>{abhaProfile.mobile}</span>
                  </div>
                </div>
              </div>
              
              <div className="setu-abha-card-qr-wrapper" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="setu-abha-card-qr" style={{ padding: '4px', background: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=ABHA:${abhaProfile.ABHANumber || abhaProfile.abhaNumber};${abhaProfile.preferredAddress || abhaProfile.abhaAddress}`}
                    alt="ABHA QR"
                    style={{ width: '68px', height: '68px', display: 'block' }}
                  />
                </div>
              </div>
            </div>
          </article>

          {/* Action Buttons */}
          <div style={{ width: '100%', display: 'flex', gap: '8px' }}>
            <button
              onClick={handleDownloadCard}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: '10px',
                border: 'none',
                background: 'var(--accent-teal)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
              }}
            >
              <Download style={{ width: '12px', height: '12px' }} />
              <span>Download PNG</span>
            </button>

            <button
              onClick={() => handleSaveToLocker(`ABHA_Smart_Card_${abhaProfile.ABHANumber || abhaProfile.abhaNumber}.pdf`)}
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
                gap: '6px'
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
                gap: '6px'
              }}
            >
              <Send style={{ width: '12px', height: '12px', color: 'var(--accent-blue)' }} />
              <span>Share Card</span>
            </button>
          </div>

          {/* Demographics Display */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '11px', textAlign: 'left', width: '100%' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>Mobile Number</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{abhaProfile.mobile || 'N/A'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>Email Address</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{abhaProfile.email || 'Not verified'}</span>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>Street Address</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{abhaProfile.address || 'N/A'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>District & State</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{abhaProfile.districtName}, {abhaProfile.stateName}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>Pin Code</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{abhaProfile.pinCode || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Tabbed panel (Update Mobile & Verify Email) */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          
          {/* Sub Tab Headers */}
          <div style={{ display: 'flex', background: 'var(--bg-primary)', borderRadius: '10px', padding: '4px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setActiveSubTab('mobile')}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: 'none',
                borderRadius: '8px',
                background: activeSubTab === 'mobile' ? 'var(--accent-teal)' : 'transparent',
                color: activeSubTab === 'mobile' ? '#ffffff' : 'var(--text-secondary)',
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
              <Phone style={{ width: '14px', height: '14px' }} />
              <span>Update Mobile Number / मोबाइल नंबर बदलें</span>
            </button>
            
            <button
              onClick={() => setActiveSubTab('email')}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: 'none',
                borderRadius: '8px',
                background: activeSubTab === 'email' ? 'var(--accent-teal)' : 'transparent',
                color: activeSubTab === 'email' ? '#ffffff' : 'var(--text-secondary)',
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
              <Mail style={{ width: '14px', height: '14px' }} />
              <span>Email Verification / ईमेल सत्यापन</span>
            </button>
          </div>

          {/* Tab Content: Mobile Form */}
          {activeSubTab === 'mobile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Update Verified Mobile / मोबाइल नंबर अद्यतन
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                  Provide a new 10-digit mobile number. We will send a secure OTP to verify the device.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Current Mobile Number</label>
                <input
                  type="text"
                  value={abhaProfile.mobile || 'N/A'}
                  disabled
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-muted)',
                    fontSize: '13px',
                    width: '100%',
                    cursor: 'not-allowed'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>New Mobile Number / नया मोबाइल नंबर</label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="Enter 10-digit mobile number"
                  value={newMobile}
                  onChange={(e) => setNewMobile(e.target.value.replace(/\D/g, ''))}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    width: '100%'
                  }}
                />
              </div>

              {mobileError && (
                <div style={{ color: 'var(--danger)', fontSize: '11px' }}>
                  {mobileError}
                </div>
              )}

              <button
                onClick={handleRequestMobileOtp}
                disabled={mobileLoading || newMobile.length !== 10}
                style={{
                  padding: '12px',
                  border: 'none',
                  borderRadius: '10px',
                  background: 'var(--accent-teal)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  opacity: (mobileLoading || newMobile.length !== 10) ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                  marginTop: '8px'
                }}
              >
                {mobileLoading ? 'Sending...' : 'Request OTP / ओटीपी प्राप्त करें'}
              </button>
            </div>
          )}

          {/* Tab Content: Email Form */}
          {activeSubTab === 'email' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Email Verification / ईमेल सत्यापन
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                  Link a verified email address to your ABHA profile to receive diagnostic records and secure health communications.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Current Email Address</label>
                <input
                  type="text"
                  value={abhaProfile.email || 'Not verified'}
                  disabled
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-muted)',
                    fontSize: '13px',
                    width: '100%',
                    cursor: 'not-allowed'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>New Email Address / नया ईमेल पता</label>
                <input
                  type="email"
                  placeholder="Enter email address (e.g. name@domain.com)"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    width: '100%'
                  }}
                />
              </div>

              {emailError && (
                <div style={{ color: 'var(--danger)', fontSize: '11px' }}>
                  {emailError}
                </div>
              )}

              <button
                onClick={handleRequestEmailOtp}
                disabled={emailLoading || !newEmail.includes('@')}
                style={{
                  padding: '12px',
                  border: 'none',
                  borderRadius: '10px',
                  background: 'var(--accent-teal)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  opacity: (emailLoading || !newEmail.includes('@')) ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                  marginTop: '8px'
                }}
              >
                {emailLoading ? 'Sending...' : 'Verify Email / ईमेल सत्यापित करें'}
              </button>
            </div>
          )}

        </div>
      </div>

      {/* ==================== MODALS ==================== */}

      {/* Mobile OTP Verification Modal Overlay */}
      {mobileOtpModal && (
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
        }} onClick={() => setMobileOtpModal(false)}>
          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '440px',
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
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <Phone style={{ color: 'var(--accent-teal)' }} />
                <span>Mobile OTP Verification</span>
              </h3>
              <button 
                onClick={() => setMobileOtpModal(false)}
                style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '4px' }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Enter 6-Digit OTP / ओटीपी दर्ज करें
                </label>
                <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)' }}>
                  OTP sent to mobile ending with ******{newMobile.slice(-4)}
                </p>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={mobileOtp}
                  onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, ''))}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    width: '100%',
                    textAlign: 'center',
                    letterSpacing: '4px',
                    fontWeight: 'bold'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', marginTop: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Resend OTP in / दोबारा भेजें:</span>
                <strong style={{ color: 'var(--accent-teal)' }}>
                  {mobileTimer > 0 ? `00:${String(mobileTimer).padStart(2, '0')}` : '00:00'}
                </strong>
              </div>

              {mobileError && (
                <div style={{ color: 'var(--danger)', fontSize: '11px', textAlign: 'left' }}>
                  {mobileError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  onClick={() => setMobileOtpModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyMobileOtp}
                  disabled={mobileLoading || mobileOtp.length !== 6}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: 'none',
                    borderRadius: '8px',
                    background: 'var(--accent-teal)',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    opacity: (mobileLoading || mobileOtp.length !== 6) ? 0.6 : 1
                  }}
                >
                  {mobileLoading ? 'Verifying...' : 'Verify & Update'}
                </button>
              </div>

              {mobileTimer === 0 && (
                <button
                  onClick={handleRequestMobileOtp}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent-blue)',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    marginTop: '6px',
                    textAlign: 'left'
                  }}
                >
                  Resend OTP / ओटीपी दोबारा भेजें
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Email OTP Verification Modal Overlay */}
      {emailOtpModal && (
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
        }} onClick={() => setEmailOtpModal(false)}>
          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '440px',
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
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <Mail style={{ color: 'var(--accent-teal)' }} />
                <span>Email OTP Verification</span>
              </h3>
              <button 
                onClick={() => setEmailOtpModal(false)}
                style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '4px' }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Enter 6-Digit Email OTP / ओटीपी दर्ज करें
                </label>
                <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)' }}>
                  Enter the verification code sent to {newEmail} (Sandbox test code is <strong>123456</strong>)
                </p>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    width: '100%',
                    textAlign: 'center',
                    letterSpacing: '4px',
                    fontWeight: 'bold'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', marginTop: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Resend OTP in / दोबारा भेजें:</span>
                <strong style={{ color: 'var(--accent-teal)' }}>
                  {emailTimer > 0 ? `00:${String(emailTimer).padStart(2, '0')}` : '00:00'}
                </strong>
              </div>

              {emailError && (
                <div style={{ color: 'var(--danger)', fontSize: '11px', textAlign: 'left' }}>
                  {emailError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  onClick={() => setEmailOtpModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyEmailOtp}
                  disabled={emailLoading || emailOtp.length !== 6}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: 'none',
                    borderRadius: '8px',
                    background: 'var(--accent-teal)',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    opacity: (emailLoading || emailOtp.length !== 6) ? 0.6 : 1
                  }}
                >
                  {emailLoading ? 'Verifying...' : 'Verify & Link'}
                </button>
              </div>

              {emailTimer === 0 && (
                <button
                  onClick={handleRequestEmailOtp}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent-blue)',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    marginTop: '6px',
                    textAlign: 'left'
                  }}
                >
                  Resend OTP / ओटीपी दोबारा भेजें
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
