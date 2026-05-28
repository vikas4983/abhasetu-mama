'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';
import { useLanguage } from '../../../providers/LanguageProvider';
import { ArrowLeft, Download, ShieldCheck, Calendar, FolderLock, KeyRound, Sparkles, CheckCircle2, AlertCircle, Terminal } from 'lucide-react';
import { showToast } from '../../../utils/toast';

export default function AbhaPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { addRecord, logSecurityEvent } = useAuth();

  // Wizard Steps: 'aadhaar' | 'otp' | 'register' | 'card'
  const [step, setStep] = useState<'aadhaar' | 'otp' | 'register' | 'card'>('aadhaar');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Input states
  const [aadhaar, setAadhaar] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [otp, setOtp] = useState('');
  
  // Registration Profile states
  const [fullName, setFullName] = useState('Dr. Ayesha Ali');
  const [gender, setGender] = useState('Female');
  const [dateOfBirth, setDateOfBirth] = useState('1980-08-15');
  const [mobile, setMobile] = useState('9981057765');
  const [abhaNumber, setAbhaNumber] = useState('91-9981-0577-6582');
  const [abhaAddress, setAbhaAddress] = useState('ayesha.ali');
  const [password, setPassword] = useState('SecurePassword1!');
  const [email, setEmail] = useState('ayesha.ali@gmail.com');
  const [drivingLicense, setDrivingLicense] = useState('DL-14201100682');

  const API_BASE = 'http://localhost:4000/api/v1';

  // 1. Generate Aadhaar OTP Handshake
  const handleGenerateOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!/^\d{12}$/.test(aadhaar)) {
      setValidationError(t('Aadhaar number must be exactly 12 numeric digits.'));
      return;
    }

    setLoading(true);
    showToast(t('Encrypting Aadhaar credentials via RSA Version 3...'));

    try {
      const res = await fetch(`${API_BASE}/abha/otp/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaar }),
      });

      const data = await res.json();
      if (res.ok) {
        setTransactionId(data.transactionId);
        logSecurityEvent('ABDM OTP Generated', `Requested secure OTP dispatch. Masked Aadhaar: XXXX-XXXX-${aadhaar.slice(8)}`);
        showToast(t('Aadhaar OTP generated and sent successfully!'));
        setStep('otp');
      } else {
        setValidationError(data.message?.[0] || data.message || t('OTP generation failed.'));
      }
    } catch (err) {
      setValidationError(t('Network connection to NestJS backend failed. Ensure server is active.'));
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify Aadhaar OTP Handshake
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!/^[0-9]{6}$/.test(otp)) {
      setValidationError(t('OTP must be exactly 6 numeric digits.'));
      return;
    }

    setLoading(true);
    showToast(t('Encrypting verification credentials via RSA...'));

    try {
      const res = await fetch(`${API_BASE}/abha/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, otp }),
      });

      const data = await res.json();
      if (res.ok) {
        logSecurityEvent('ABDM OTP Verified', `Aadhaar OTP validated successfully for transaction: ${transactionId}`);
        showToast(t('OTP verified successfully! Please confirm your profile details.'));
        
        // Prefill profile values returned by gateway
        setFullName(data.profile.fullName);
        setGender(data.profile.gender);
        setDateOfBirth(data.profile.dateOfBirth);
        setMobile(data.profile.mobile);
        setAbhaNumber(data.abhaNumber);
        setAbhaAddress(data.abhaAddress.split('@')[0]); // pull local address prefix
        
        setStep('register');
      } else {
        setValidationError(data.message?.[0] || data.message || t('OTP verification failed.'));
      }
    } catch (err) {
      setValidationError(t('Connection failed. Verify NestJS backend state.'));
    } finally {
      setLoading(false);
    }
  };

  // 3. Register ABHA Profile
  const handleRegisterProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Pre-validate password on client-side matching M1 requirements
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*-])[A-Za-z\d!@#$%^&*-]{8,}$/;
    if (!passwordPattern.test(password)) {
      setValidationError(t('Password must contain at least 8 chars, 1 uppercase, 1 digit, and 1 special symbol.'));
      return;
    }

    setLoading(true);
    showToast(t('Submitting secure registry registration...'));

    try {
      const payload = {
        abhaNumber,
        abhaAddress,
        fullName,
        gender,
        dateOfBirth,
        mobile,
        password,
        email,
        drivingLicense,
      };

      const res = await fetch(`${API_BASE}/abha/profile/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        logSecurityEvent('ABHA Profile Registered', `Created and linked new ABHA Address: ${abhaAddress}@abdm`);
        showToast(t('Congratulations! Your official ABHA Card has been generated!'));
        setStep('card');
      } else {
        setValidationError(data.message?.[0] || data.message || t('ABHA profile registration failed.'));
      }
    } catch (err) {
      setValidationError(t('Registration failed. Ensure NestJS server is running.'));
    } finally {
      setLoading(false);
    }
  };

  // 4. Add smart replica card to Locker
  const handleSaveToLocker = () => {
    const newRecord = {
      name: 'ABHA_Smart_Card.pdf',
      type: 'ID Card',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      source: 'National Health Authority',
    };
    addRecord(newRecord);
    logSecurityEvent('ABHA Card Saved', `Saved certified replica ABHA Card (${abhaNumber}) securely in Health Locker.`);
    showToast(t('ABHA ID Card successfully synced and saved inside secure Health Locker.'));
  };

  return (
    <>
      {/* Route Hero Header */}
      <section className="route-hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <a href="#" onClick={(e) => { e.preventDefault(); router.push('/'); }} className="back-link">
            <ArrowLeft className="small-icon" style={{ width: '14px', height: '14px', marginRight: '4px' }} />
            {t('Home')}
          </a>
          <div>
            <p className="eyebrow">ABHA SETU</p>
            <h2>{t('ABHA Onboarding Portal')}</h2>
            <p>{t('Create or retrieve your digital health identity linked with ABDM.')}</p>
          </div>
        </div>
        <button 
          onClick={() => router.push('/admin/docs')} 
          className="join-btn animate-glow" 
          style={{ margin: 0, padding: '8px 16px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', minHeight: '36px' }}
        >
          <Terminal style={{ width: '12px', height: '12px' }} />
          <span>Interactive Developer API Docs & Sandbox</span>
        </button>
      </section>


      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '600px', margin: '20px auto 0' }}>
        
        {/* Validation Error Alert */}
        {validationError && (
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px', color: '#ef4444', fontSize: '13px' }}>
            <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            <span>{validationError}</span>
          </div>
        )}

        {/* STEP 1: Aadhaar Onboarding Card */}
        {step === 'aadhaar' && (
          <article className="route-card" style={{ width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0, 212, 170, 0.1)', color: 'var(--accent-teal)', display: 'grid', placeItems: 'center' }}>
                <FolderLock style={{ width: '18px', height: '18px' }} />
              </div>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>Step 1: Verify Aadhaar Identity</h4>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              Enter your 12-digit Aadhaar number to verify your demographic identity. This triggers a secure dual-OTP handshake compliant with HIPAA/DPDP Act standards.
            </p>
            <form onSubmit={handleGenerateOtp} style={{ display: 'grid', gap: '14px' }}>
              <label style={{ display: 'grid', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Aadhaar Number (12 digits)
                <input
                  type="text"
                  required
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  placeholder="998105776582"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '14px', letterSpacing: '2px', fontFamily: 'monospace' }}
                />
              </label>
              <button
                type="submit"
                className="join-btn"
                disabled={loading}
                style={{ width: '100%', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {loading ? (
                  <>
                    <Sparkles className="pulse-dot" style={{ width: '16px', height: '16px' }} />
                    <span>Sending Secure OTP...</span>
                  </>
                ) : (
                  <>
                    <KeyRound style={{ width: '16px', height: '16px' }} />
                    <span>Generate OTP Handshake</span>
                  </>
                )}
              </button>
            </form>
          </article>
        )}

        {/* STEP 2: OTP Verification Card */}
        {step === 'otp' && (
          <article className="route-card" style={{ width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0, 212, 170, 0.1)', color: 'var(--accent-teal)', display: 'grid', placeItems: 'center' }}>
                <KeyRound style={{ width: '18px', height: '18px' }} />
              </div>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>Step 2: Enter NHA Verification OTP</h4>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid var(--accent-teal)', marginBottom: '16px', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <strong>Transaction ID:</strong> <span style={{ fontFamily: 'monospace' }}>{transactionId}</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              A 6-digit verification code has been pushed to your Aadhaar-registered mobile number. Sensitive parameters are encrypted under Version 3 standards.
            </p>
            <form onSubmit={handleVerifyOtp} style={{ display: 'grid', gap: '14px' }}>
              <label style={{ display: 'grid', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Enter OTP (6 digits)
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '15px', letterSpacing: '6px', fontFamily: 'monospace', textAlign: 'center' }}
                />
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setStep('aadhaar')}
                  className="join-btn"
                  style={{ flex: 1, margin: 0, background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="join-btn"
                  disabled={loading}
                  style={{ flex: 2, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {loading ? (
                    <span>Verifying OTP...</span>
                  ) : (
                    <>
                      <CheckCircle2 style={{ width: '16px', height: '16px' }} />
                      <span>Verify and Proceed</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </article>
        )}

        {/* STEP 3: Account Creation Registry Form */}
        {step === 'register' && (
          <article className="route-card" style={{ width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0, 212, 170, 0.1)', color: 'var(--accent-teal)', display: 'grid', placeItems: 'center' }}>
                <CheckCircle2 style={{ width: '18px', height: '18px' }} />
              </div>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>Step 3: Setup ABDM Health Account Profile</h4>
            </div>
            <form onSubmit={handleRegisterProfile} style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Full Name
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px' }}
                  />
                </label>
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Gender
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px' }}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Date of Birth (YYYY-MM-DD)
                  <input
                    type="text"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    placeholder="1980-08-15"
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px' }}
                  />
                </label>
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Mobile Number
                  <input
                    type="text"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px' }}
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  ABHA Number
                  <input
                    type="text"
                    required
                    value={abhaNumber}
                    onChange={(e) => setAbhaNumber(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', fontFamily: 'monospace' }}
                  />
                </label>
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  ABHA Address (Suffix: @abdm)
                  <input
                    type="text"
                    required
                    value={abhaAddress}
                    onChange={(e) => setAbhaAddress(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', fontFamily: 'monospace' }}
                  />
                </label>
              </div>

              <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                Locker Login Password
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px' }}
                />
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>At least 8 chars, 1 uppercase, 1 digit, 1 special character.</span>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Email Address
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px' }}
                  />
                </label>
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Driving License
                  <input
                    type="text"
                    value={drivingLicense}
                    onChange={(e) => setDrivingLicense(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px' }}
                  />
                </label>
              </div>

              <button
                type="submit"
                className="join-btn"
                disabled={loading}
                style={{ width: '100%', minHeight: '42px', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {loading ? (
                  <span>Registering Account...</span>
                ) : (
                  <>
                    <Sparkles style={{ width: '16px', height: '16px' }} />
                    <span>Create & Generate ABHA Card</span>
                  </>
                )}
              </button>
            </form>
          </article>
        )}

        {/* STEP 4: Certified Smart Card Replica (Guilloche Print Pattern) */}
        {step === 'card' && (
          <>
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
                      alt={fullName}
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
                    <strong className="setu-abha-card-value" style={{ fontSize: '13px', color: '#0f172a', fontWeight: '800' }}>{fullName}</strong>
                  </div>
                  
                  <div className="setu-abha-card-field">
                    <span className="setu-abha-card-label" style={{ fontSize: '8px', color: '#64748b', display: 'block' }}>ABHA Number/आभा-संख्या</span>
                    <strong className="setu-abha-card-value token-num" style={{ fontSize: '13px', color: 'var(--accent-blue)', fontFamily: 'monospace' }}>{abhaNumber}</strong>
                  </div>
                  
                  <div className="setu-abha-card-field">
                    <span className="setu-abha-card-label" style={{ fontSize: '8px', color: '#64748b', display: 'block' }}>ABHA Address/आभा पता</span>
                    <strong className="setu-abha-card-value token-num" style={{ color: '#0f172a', fontSize: '11px', fontFamily: 'monospace' }}>{abhaAddress}@abdm</strong>
                  </div>
                  
                  <div className="setu-abha-card-row" style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <div className="setu-abha-card-field">
                      <span className="setu-abha-card-label" style={{ fontSize: '8px', color: '#64748b' }}>Gender/लिंग</span>
                      <span className="setu-abha-card-value" style={{ display: 'block', fontSize: '10px', fontWeight: 600 }}>{gender}</span>
                    </div>
                    <div className="setu-abha-card-field">
                      <span className="setu-abha-card-label" style={{ fontSize: '8px', color: '#64748b' }}>DOB/जन्मतारीख</span>
                      <span className="setu-abha-card-value" style={{ display: 'block', fontSize: '10px', fontWeight: 600 }}>{dateOfBirth}</span>
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
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=ABHA:${abhaNumber};${abhaAddress}@abdm`}
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
          </>
        )}
      </div>
    </>
  );
}
