'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';
import { useLanguage } from '../../../providers/LanguageProvider';
import { 
  UserRound, 
  Stethoscope, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  Loader2, 
  Phone, 
  CreditCard, 
  Heart, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Smartphone,
  Lock,
  ArrowLeft,
  Fingerprint
} from 'lucide-react';
import { showToast } from '../../../utils/toast';
import LogoLoader from '../../../components/common/LogoLoader';
import { DRIVING_LICENSE_REGEX } from '../../../constants/regex.constants';

/**
 * Normalizes and returns the base64 source or static path of a profile image.
 * @param {string} photo - base64 string or image path
 * @returns {string} parsed image source
 */
const getPhotoSrc = (photo: string): string => {
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

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { loginWithOtp, loginWithDl, loginWithAbhaAccount } = useAuth();

  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | 'operator'>('patient');
  const [activeTab, setActiveTab] = useState<'mobile' | 'aadhaar' | 'abha' | 'dl'>('mobile');
  const [identifier, setIdentifier] = useState('');
  const [aadhaarMobile, setAadhaarMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSelectModal, setShowSelectModal] = useState(true);
  const otpInputRef = React.useRef<HTMLInputElement>(null);

  // Profile Login States (Mobile/ABHA Number login)
  const [mobileTxnId, setMobileTxnId] = useState('');
  const [linkedAccounts, setLinkedAccounts] = useState<any[]>([]);
  const [showAccountSelectModal, setShowAccountSelectModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);

  React.useEffect(() => {
    if (otpSent) {
      const t = setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(t);
    }
  }, [otpSent]);

  // DL Specific States
  const [dlNumber, setDlNumber] = useState('');
  const [dlMobile, setDlMobile] = useState('');
  const [showDlModal, setShowDlModal] = useState(false);
  const [dlFirstName, setDlFirstName] = useState('');
  const [dlMiddleName, setDlMiddleName] = useState('');
  const [dlLastName, setDlLastName] = useState('');
  const [dlDob, setDlDob] = useState('1994-04-26');
  const [dlGender, setDlGender] = useState('M');
  const [dlFrontPhoto, setDlFrontPhoto] = useState('');
  const [dlBackPhoto, setDlBackPhoto] = useState('');

  // Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      showToast(t('Please enter a valid identifier.'));
      return;
    }
    
    setIsSendingOtp(true);
    setErrorMsg('');

    if (activeTab === 'mobile' || activeTab === 'abha') {
      try {
        const cleanedId = identifier.replace(/[-\s]/g, '').trim();
        const hint = activeTab === 'mobile' ? 'mobile' : 'abha-number';
        
        const res = await fetch('/api/abdm/v3/profile/login/request/otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scope: ['abha-login', 'mobile-verify'],
            loginHint: hint,
            loginId: cleanedId,
            otpSystem: 'abdm'
          })
        });
        const data = await res.json();
        setIsSendingOtp(false);

        if (res.ok && data.txnId) {
          setMobileTxnId(data.txnId);
          setOtpSent(true);
          showToast(t(data.message || 'OTP sent successfully!'));
        } else {
          const msg = data.description || data.message || data.loginId || data.scope || data.loginHint || t('Failed to send OTP.');
          setErrorMsg(msg);
          showToast(t('Failed to send OTP.'));
        }
      } catch (err: any) {
        setIsSendingOtp(false);
        setErrorMsg(err.message || t('Gateway connection failed.'));
        showToast(t('Network error.'));
      }
    } else if (activeTab === 'aadhaar') {
      try {
        const cleanedId = identifier.replace(/[-\s]/g, '').trim();
        const res = await fetch('/api/abdm/v3/enrollment/request/otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            loginHint: 'aadhaar',
            loginId: cleanedId
          })
        });
        const data = await res.json();
        setIsSendingOtp(false);

        if (res.ok && data.txnId) {
          setMobileTxnId(data.txnId);
          setOtpSent(true);
          showToast(t(data.message || 'OTP sent to Aadhaar-linked mobile!'));
        } else {
          setErrorMsg(data.message || t('Failed to send Aadhaar OTP.'));
          showToast(t('Failed to send OTP.'));
        }
      } catch (err: any) {
        setIsSendingOtp(false);
        setErrorMsg(err.message || t('Gateway connection failed.'));
        showToast(t('Network error.'));
      }
    }
  };

  // DL OTP Request Flow
  const handleSendDlOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dlMobile || dlMobile.length !== 10) {
      showToast(t('Please enter a valid 10-digit mobile number.'));
      return;
    }

    setIsSendingOtp(true);
    setErrorMsg('');

    try {
      const sessionRes = await fetch('/api/abdm/v3/enrollment/dl/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const sessionData = await sessionRes.json();
      if (sessionData.status !== 'success') {
        throw new Error(sessionData.message || 'Failed to establish DL session');
      }

      const otpRes = await fetch('/api/abdm/v3/enrollment/dl/request/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: dlMobile, dlNumber: '' })
      });
      const otpData = await otpRes.json();
      setIsSendingOtp(false);

      if (otpRes.ok && otpData.status === 'success') {
        setOtpSent(true);
        showToast(t('OTP sent successfully to DL linked mobile!'));
      } else {
        setErrorMsg(otpData.message || t('Failed to send DL OTP.'));
        showToast(t('Failed to send OTP.'));
      }
    } catch (err: any) {
      setIsSendingOtp(false);
      setErrorMsg(err.message || t('DL Gateway connection failed.'));
      showToast(t('Network error.'));
    }
  };

  // Verify and login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      showToast(t('Please enter the verification OTP.'));
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    if (activeTab === 'mobile' || activeTab === 'abha') {
      try {
        const res = await fetch('/api/abdm/v3/profile/login/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scope: ['abha-login', 'mobile-verify'],
            authData: {
              authMethods: ['otp'],
              otp: {
                txnId: mobileTxnId,
                otpValue: otp
              }
            }
          })
        });
        const data = await res.json();
        setIsVerifying(false);

        if (res.ok && data.authResult === 'success') {
          showToast(t('OTP verified successfully!'));
          if (data.accounts && data.accounts.length > 0) {
            setLinkedAccounts(data.accounts);
            setSelectedAccount(data.accounts[0]);
            if (data.accounts.length === 1) {
              handleSelectAbhaAccount(data.accounts[0], data.accounts);
            } else {
              setShowAccountSelectModal(true);
            }
          } else {
            setErrorMsg(t('No linked accounts found.'));
          }
        } else {
          const msg = data.description || data.message || data.otpValue || data.txnId || data.authMethods || data.scope || t('Verification failed.');
          setErrorMsg(msg);
          showToast(t('Verification failed.'));
        }
      } catch (err: any) {
        setIsVerifying(false);
        setErrorMsg(err.message || t('Gateway connection failed.'));
        showToast(t('Network error.'));
      }
    } else if (activeTab === 'aadhaar') {
      try {
        const res = await fetch('/api/abdm/v3/enrollment/enrol/byAadhaar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            txnId: mobileTxnId,
            authData: {
              otp: {
                otpValue: otp,
                mobile: aadhaarMobile
              }
            }
          })
        });
        const data = await res.json();
        setIsVerifying(false);

        if (res.ok && data.status === 'success') {
          showToast(t('OTP verified successfully!'));
          const profile = data.ABHAProfile || data;
          const finalName = profile.name || [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(' ') || 'Aarav Sharma';
          const normalizedAcc = {
            name: finalName,
            preferredAbhaAddress: data.abhaAddress || profile.preferredAddress || profile.abhaId || 'ayesha.ali.9981057765@abdm',
            ABHANumber: data.abhaNumber || profile.abhaNumber || '91-9981-0577-6582',
            profilePhoto: profile.photo || '',
            gender: profile.gender === 'F' ? 'Female' : profile.gender === 'M' ? 'Male' : profile.gender,
            dob: profile.dob || '',
            mobile: profile.mobile || ''
          };
          const success = await loginWithAbhaAccount(selectedRole, normalizedAcc, [normalizedAcc]);
          if (success) {
            const sessionTtl = 1200;
            const refreshTtl = 1800;
            localStorage.setItem('abha_session_expiry', String(Date.now() + sessionTtl * 1000));
            localStorage.setItem('abha_refresh_expiry', String(Date.now() + refreshTtl * 1000));
            localStorage.setItem('x_token_expiry', String(Date.now() + sessionTtl * 1000));
            localStorage.setItem('public_key_expiry', String(Date.now() + 90 * 24 * 3600 * 1000));
            window.dispatchEvent(new Event('setu_state_update'));

            showToast(t('Authentication successful! Welcome back.'));
            router.push('/');
          } else {
            showToast(t('Failed to establish local session.'));
          }
        } else {
          setErrorMsg(data.message || t('Verification failed.'));
          showToast(t('Verification failed.'));
        }
      } catch (err: any) {
        setIsVerifying(false);
        setErrorMsg(err.message || t('Gateway connection failed.'));
        showToast(t('Network error.'));
      }
    }
  };

  const handleSelectAbhaAccount = async (acc: any, allAccounts?: any[]) => {
    setIsVerifying(true);
    try {
      const success = await loginWithAbhaAccount(selectedRole, acc, allAccounts || linkedAccounts || [acc]);
      setIsVerifying(false);
      if (success) {
        const sessionTtl = 1200;
        const refreshTtl = 1800;
        localStorage.setItem('abha_session_expiry', String(Date.now() + sessionTtl * 1000));
        localStorage.setItem('abha_refresh_expiry', String(Date.now() + refreshTtl * 1000));
        localStorage.setItem('x_token_expiry', String(Date.now() + sessionTtl * 1000));
        localStorage.setItem('public_key_expiry', String(Date.now() + 90 * 24 * 3600 * 1000));
        window.dispatchEvent(new Event('setu_state_update'));

        setShowAccountSelectModal(false);
        showToast(t('ABHA account linked and authenticated!'));
        router.push('/');
      } else {
        showToast(t('Failed to establish local session.'));
      }
    } catch (e: any) {
      setIsVerifying(false);
      showToast(e.message || t('Authentication failed.'));
    }
  };

  // DL OTP Verify Flow
  const handleVerifyDlOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      showToast(t('Please enter the verification OTP.'));
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/abdm/v3/enrollment/dl/verify/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp })
      });
      const data = await res.json();
      setIsVerifying(false);

      if (res.ok && data.status === 'success') {
        showToast(t('OTP Verified! Please complete DL demographic details.'));
        setShowDlModal(true);
      } else {
        setErrorMsg(data.message || t('Invalid OTP. Please try again.'));
        showToast(t('Verification failed.'));
      }
    } catch (err: any) {
      setIsVerifying(false);
      showToast(err.message || t('DL verification connection failed.'));
    }
  };

  // Submit DL details
  const handleDlDemographicsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dlNumber) {
      showToast(t('Driving License number is required.'));
      return;
    }
    if (dlNumber.includes('-') || dlNumber !== dlNumber.toUpperCase() || !DRIVING_LICENSE_REGEX.test(dlNumber)) {
      showToast(t('Driving License number must be fully in CAPS and contain no hyphens (-).'));
      return;
    }
    if (!dlFirstName || !dlLastName) {
      showToast(t('First Name and Last Name are required.'));
      return;
    }
    setIsVerifying(true);

    try {
      const res = await fetch('/api/abdm/v3/enrollment/enrol/byDl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dlNumber,
          firstName: dlFirstName,
          middleName: dlMiddleName,
          lastName: dlLastName,
          dob: dlDob,
          gender: dlGender,
          mobile: dlMobile,
          frontPhoto: dlFrontPhoto,
          backPhoto: dlBackPhoto
        })
      });
      const data = await res.json();
      setIsVerifying(false);

      if (res.ok && data.status === 'success') {
        setShowDlModal(false);
        await loginWithDl(dlNumber, data.abhaProfile);
        showToast(t('Authentication successful! Welcome back.'));
        router.push('/');
      } else {
        showToast(data.message || t('DL Demographics validation failed.'));
      }
    } catch (err: any) {
      setIsVerifying(false);
      showToast(err.message || t('DL registration request failed.'));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (side === 'front') {
          setDlFrontPhoto(reader.result as string);
        } else {
          setDlBackPhoto(reader.result as string);
        }
        showToast(t(`${side === 'front' ? 'Front' : 'Back'} side photo uploaded and encoded.`));
      };
      reader.readAsDataURL(file);
    }
  };

  // Format labels and inputs based on tabs
  const getIdentifierPlaceholder = () => {
    if (activeTab === 'mobile') return 'e.g. 9876543210';
    if (activeTab === 'aadhaar') return 'e.g. 123456789012';
    return 'e.g. 91-1234-5678-9012';
  };

  const getIdentifierLabel = () => {
    if (activeTab === 'mobile') return '10-Digit Mobile Number';
    if (activeTab === 'aadhaar') return '12-Digit Aadhaar Number';
    return '14-Digit ABHA ID / Address';
  };

  const getMaxIdentifierLength = () => {
    if (activeTab === 'mobile') return 10;
    if (activeTab === 'aadhaar') return 12;
    return 17;
  };

  return (
    <div className="login-container" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: '20px', background: 'radial-gradient(circle at top, var(--bg-primary) 30%, #03080e 100%)' }}>
      <LogoLoader isLoading={isVerifying} type="login" />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '440px' }}>
        
        {/* Login Card */}
        <div className="login-card" style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '30px 24px', boxShadow: 'var(--surface-shadow)', backdropFilter: 'blur(20px)', position: 'relative' }}>
          
          {/* Shimmer progress bar at top of card when submitting */}
          {(isSendingOtp || isVerifying) && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, transparent, var(--accent-teal), transparent)',
              backgroundSize: '200% 100%',
              animation: 'shimmer-sweep 1.2s infinite linear',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px'
            }} />
          )}
          
          {/* Brand Logo */}
          <div className="logo" style={{ justifyContent: 'center', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              className="logo-icon" 
              style={{ 
                width: '38px', 
                height: '38px', 
                borderRadius: '50%', 
                background: 'transparent', 
                display: 'grid', 
                placeItems: 'center',
                overflow: 'hidden',
              }}
            >
              <img
                src="/assets/logos/logo7.png"
                alt="Brand Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div className="logo-text" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <h1 style={{ fontSize: '18px', margin: 0, fontWeight: 800, color: 'var(--text-primary)' }}>ABHA SETU</h1>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{t('Digital Health Portal')}</span>
            </div>
          </div>

          <h2 style={{ fontSize: '16px', textAlign: 'center', margin: '0 0 4px', fontWeight: 800 }}>National Health Gateway Portal</h2>
          <p className="subtitle" style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center', margin: '0 0 16px', lineHeight: 1.5 }}>
            Access clinical records, UHI consults, and link care contexts using secure OTP.
          </p>

          {/* Subtitle / Role Context Header */}
          <div style={{ textAlign: 'center', marginBottom: '16px', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent-teal)', textTransform: 'uppercase' }}>Citizen / Patient Portal</span>
          </div>


          {/* Form Area */}
          {!otpSent ? (
            activeTab === 'dl' ? (
              <form onSubmit={handleSendDlOtp} style={{ display: 'grid', gap: '12px' }}>
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  10-Digit Mobile Number
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    disabled={isSendingOtp}
                    value={dlMobile}
                    onChange={(e) => setDlMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 9876543210"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'monospace', outline: 'none', opacity: isSendingOtp ? 0.6 : 1 }}
                  />
                </label>
                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="join-btn"
                  style={{ width: '100%', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: isSendingOtp ? 'not-allowed' : 'pointer' }}
                >
                  {isSendingOtp ? (
                    <>
                      <Loader2 className="animate-spin" style={{ width: '14px', height: '14px' }} />
                      <span>Requesting OTP...</span>
                    </>
                  ) : (
                    <>
                      <Smartphone style={{ width: '14px', height: '14px' }} />
                      <span>Send DL Verification OTP</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSendOtp} style={{ display: 'grid', gap: '12px' }}>
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {getIdentifierLabel()}
                  <input
                    type={activeTab === 'mobile' ? 'tel' : 'text'}
                    required
                    maxLength={getMaxIdentifierLength()}
                    disabled={isSendingOtp}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={getIdentifierPlaceholder()}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'monospace', outline: 'none', opacity: isSendingOtp ? 0.6 : 1 }}
                  />
                </label>

                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="join-btn"
                  style={{ width: '100%', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: isSendingOtp ? 'not-allowed' : 'pointer' }}
                >
                  {isSendingOtp ? (
                    <>
                      <Loader2 className="animate-spin" style={{ width: '14px', height: '14px' }} />
                      <span>Requesting OTP...</span>
                    </>
                  ) : (
                    <>
                      <Smartphone style={{ width: '14px', height: '14px' }} />
                      <span>Send Gateway Verification OTP</span>
                    </>
                  )}
                </button>
              </form>
            )
          ) : null}

          {/* Change Method Button */}
          {!otpSent && (
            <button
              type="button"
              onClick={() => setShowSelectModal(true)}
              style={{
                alignSelf: 'center',
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-teal)',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '12px',
                justifyContent: 'center',
                width: '100%'
              }}
            >
              <ArrowLeft style={{ width: '12px', height: '12px' }} />
              <span>Change Login Method</span>
            </button>
          )}

          {otpSent && (
            activeTab === 'dl' ? (
              <form onSubmit={handleVerifyDlOtp} style={{ display: 'grid', gap: '12px' }}>
                <div style={{ background: 'rgba(20, 184, 166, 0.06)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(20, 184, 166, 0.15)', fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', gap: '6px' }}>
                  <Info style={{ width: '14px', height: '14px', color: 'var(--accent-teal)', flexShrink: 0 }} />
                  <div>
                    OTP sent to DL linked phone. Use dummy code <strong>123456</strong> for testing.
                  </div>
                </div>

                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Enter 6-Digit OTP Code
                  <input
                    ref={otpInputRef}
                    type="text"
                    required
                    maxLength={6}
                    disabled={isVerifying}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '14px', textAlign: 'center', letterSpacing: '8px', fontWeight: 'bold', fontFamily: 'monospace', outline: 'none', opacity: isVerifying ? 0.6 : 1 }}
                  />
                </label>

                {errorMsg && (
                  <div style={{ color: 'var(--danger)', fontSize: '10.5px', fontWeight: '600', background: 'rgba(239,68,68,0.08)', padding: '6px', borderRadius: '4px', border: '1px solid rgba(239,68,68,0.15)' }}>
                    {errorMsg}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    disabled={isVerifying}
                    onClick={() => setOtpSent(false)}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      cursor: isVerifying ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      transition: 'all 0.2s',
                      opacity: isVerifying ? 0.6 : 1
                    }}
                  >
                    <ArrowLeft style={{ width: '13px', height: '13px' }} />
                    <span>Edit Mobile</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="join-btn"
                    style={{ flex: 2, minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: isVerifying ? 'not-allowed' : 'pointer' }}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="animate-spin" style={{ width: '14px', height: '14px' }} />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles style={{ width: '14px', height: '14px' }} />
                        <span>Verify & Continue</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} style={{ display: 'grid', gap: '12px' }}>
                <div style={{ background: 'rgba(20, 184, 166, 0.06)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(20, 184, 166, 0.15)', fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', gap: '6px' }}>
                  <Info style={{ width: '14px', height: '14px', color: 'var(--accent-teal)', flexShrink: 0 }} />
                  <div>
                    OTP sent to credential linked phone. Use dummy code <strong>123456</strong> for testing.
                  </div>
                </div>

                {activeTab === 'aadhaar' && (
                  <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Aadhaar-Linked Mobile Number
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      disabled={isVerifying}
                      value={aadhaarMobile}
                      onChange={(e) => setAadhaarMobile(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 9876543210"
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'monospace', outline: 'none', opacity: isVerifying ? 0.6 : 1 }}
                    />
                  </label>
                )}

                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Enter 6-Digit OTP Code
                  <input
                    ref={otpInputRef}
                    type="text"
                    required
                    maxLength={6}
                    disabled={isVerifying}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '14px', textAlign: 'center', letterSpacing: '8px', fontWeight: 'bold', fontFamily: 'monospace', outline: 'none', opacity: isVerifying ? 0.6 : 1 }}
                  />
                </label>

                {errorMsg && (
                  <div style={{ color: 'var(--danger)', fontSize: '10.5px', fontWeight: '600', background: 'rgba(239,68,68,0.08)', padding: '6px', borderRadius: '4px', border: '1px solid rgba(239,68,68,0.15)' }}>
                    {errorMsg}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    disabled={isVerifying}
                    onClick={() => setOtpSent(false)}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      cursor: isVerifying ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      transition: 'all 0.2s',
                      opacity: isVerifying ? 0.6 : 1
                    }}
                  >
                    <ArrowLeft style={{ width: '13px', height: '13px' }} />
                    <span>{activeTab === 'mobile' ? t('Edit Mobile') : activeTab === 'aadhaar' ? t('Edit Aadhaar') : t('Edit ABHA')}</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="join-btn"
                    style={{ flex: 2, minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: isVerifying ? 'not-allowed' : 'pointer' }}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="animate-spin" style={{ width: '14px', height: '14px' }} />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles style={{ width: '14px', height: '14px' }} />
                        <span>Verify & Login</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )
          )}

          {/* Quick link to staff portal */}
          <div style={{ textAlign: 'center', fontSize: '11px', marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Are you clinical staff, operator, or admin? </span>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); router.push('/staff-login'); }}
              style={{ color: 'var(--accent-teal)', fontWeight: 'bold', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
            >
              <ShieldCheck style={{ width: '12px', height: '12px' }} />
              Access Stakeholder Suite
            </a>
          </div>

        </div>

      </div>

      {/* Select Authentication Method Modal Overlay */}
      {showSelectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(10px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 9998,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '500px',
            padding: '30px',
            boxShadow: 'var(--surface-shadow)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            textAlign: 'center'
          }}>
            {/* Header */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <img src="/assets/logos/logo7.png" alt="Logo" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                <h1 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>ABHA SETU</h1>
              </div>
              <h2 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>Select Authentication Method</h2>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>Choose how you want to log into your Digital Health Portal</p>
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
              {[
                { id: 'mobile', label: 'Mobile OTP', desc: 'Login via linked mobile number', icon: Phone },
                { id: 'aadhaar', label: 'Aadhaar OTP', desc: 'Verify via Aadhaar secure OTP', icon: Fingerprint },
                { id: 'abha', label: 'ABHA OTP', desc: 'Access via your health ID address', icon: Heart },
                { id: 'dl', label: 'Driving License', desc: 'Authenticate via DL linked phone', icon: CreditCard }
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setOtpSent(false);
                      setIdentifier('');
                      setOtp('');
                      setShowSelectModal(false);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '16px 10px',
                      borderRadius: '16px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-secondary)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      color: 'var(--text-primary)',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      padding: ['aadhaar', 'abha', 'mobile', 'dl'].includes(item.id) ? '4px' : '0',
                      border: '1px solid rgba(0,0,0,0.06)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                      display: 'grid',
                      placeItems: 'center',
                      color: 'var(--accent-teal)',
                      overflow: 'hidden'
                    }}>
                      {item.id === 'aadhaar' ? (
                        <img src="/assets/logos/aadhaar.png" alt="Aadhaar" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : item.id === 'abha' ? (
                        <img src="/assets/logos/abha.png" alt="ABHA" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : item.id === 'mobile' ? (
                        <img src="/assets/logos/mobile.png" alt="Mobile" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : item.id === 'dl' ? (
                        <img src="/assets/logos/dl.png" alt="DL" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <Icon style={{ width: '16px', height: '16px' }} />
                      )}
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', display: 'block' }}>{item.label}</span>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', lineHeight: '1.3' }}>{item.desc}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Staff Redirect Link */}
            <div style={{ marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Are you clinical staff or operator?</span>
              <button
                type="button"
                onClick={() => router.push('/staff-login')}
                style={{ marginLeft: '6px', background: 'transparent', border: 'none', color: 'var(--accent-teal)', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Staff Access Suite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DL Demographics Modal */}
      {showDlModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 9999,
          padding: '20px',
          overflowY: 'auto'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            padding: '24px',
            boxShadow: 'var(--surface-shadow)',
            position: 'relative'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'left' }}>
              Complete DL Demographic Verification
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'left' }}>
              Provide demographic details as linked in your Driving License card.
            </p>
            <form onSubmit={handleDlDemographicsSubmit} style={{ display: 'grid', gap: '12px', textAlign: 'left' }}>
              <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                Driving License Number (CAPS, no hyphen)
                <input
                  type="text"
                  required
                  disabled={isVerifying}
                  value={dlNumber}
                  onChange={(e) => setDlNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9\s]/g, ''))}
                  placeholder="e.g. DL1420110012345"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'monospace', outline: 'none', opacity: isVerifying ? 0.6 : 1 }}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  First Name
                  <input
                    type="text"
                    required
                    disabled={isVerifying}
                    value={dlFirstName}
                    onChange={(e) => setDlFirstName(e.target.value)}
                    placeholder="First Name"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', opacity: isVerifying ? 0.6 : 1 }}
                  />
                </label>
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Middle Name (Optional)
                  <input
                    type="text"
                    disabled={isVerifying}
                    value={dlMiddleName}
                    onChange={(e) => setDlMiddleName(e.target.value)}
                    placeholder="Middle Name"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', opacity: isVerifying ? 0.6 : 1 }}
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Last Name
                  <input
                    type="text"
                    required
                    disabled={isVerifying}
                    value={dlLastName}
                    onChange={(e) => setDlLastName(e.target.value)}
                    placeholder="Last Name"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', opacity: isVerifying ? 0.6 : 1 }}
                  />
                </label>
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Gender
                  <select
                    value={dlGender}
                    disabled={isVerifying}
                    onChange={(e) => setDlGender(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', height: '38px', outline: 'none', opacity: isVerifying ? 0.6 : 1 }}
                  >
                    <option value="M">Male / पुरुष</option>
                    <option value="F">Female / महिला</option>
                    <option value="O">Other / अन्य</option>
                  </select>
                </label>
              </div>

              <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                Date of Birth
                <input
                  type="date"
                  required
                  disabled={isVerifying}
                  value={dlDob}
                  onChange={(e) => setDlDob(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', opacity: isVerifying ? 0.6 : 1 }}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
                <div style={{ display: 'grid', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>DL Front Photo (jpeg/png)</span>
                  <input
                    type="file"
                    accept="image/jpeg, image/png"
                    disabled={isVerifying}
                    onChange={(e) => handlePhotoUpload(e, 'front')}
                    style={{ fontSize: '11px', width: '100%' }}
                  />
                  {dlFrontPhoto && (
                    <span style={{ fontSize: '9px', color: 'var(--accent-teal)' }}>✓ Front Loaded</span>
                  )}
                </div>
                <div style={{ display: 'grid', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>DL Back Photo (jpeg/png)</span>
                  <input
                    type="file"
                    accept="image/jpeg, image/png"
                    disabled={isVerifying}
                    onChange={(e) => handlePhotoUpload(e, 'back')}
                    style={{ fontSize: '11px', width: '100%' }}
                  />
                  {dlBackPhoto && (
                    <span style={{ fontSize: '9px', color: 'var(--accent-teal)' }}>✓ Back Loaded</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={() => setShowDlModal(false)}
                  style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-primary)', cursor: isVerifying ? 'not-allowed' : 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="join-btn"
                  style={{ flex: 2, minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: isVerifying ? 'not-allowed' : 'pointer' }}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="animate-spin" style={{ width: '14px', height: '14px' }} />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <span>Complete Authentication</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Selection Modal */}
      {showAccountSelectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '500px',
            padding: '30px',
            boxShadow: 'var(--surface-shadow)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <img src="/assets/logos/logo7.png" alt="Logo" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                <h1 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>ABHA SETU</h1>
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>Select ABHA Profile</h2>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                We found {linkedAccounts.length} profiles linked with this number. Choose one to log in:
              </p>
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
              {linkedAccounts.map((acc, index) => {
                const isSelected = selectedAccount && (selectedAccount.ABHANumber === acc.ABHANumber || selectedAccount.preferredAbhaAddress === acc.preferredAbhaAddress);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedAccount(acc)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px',
                      borderRadius: '16px',
                      border: isSelected ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-color)',
                      background: isSelected ? 'rgba(20, 184, 166, 0.08)' : 'var(--bg-secondary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: 'var(--text-primary)',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      boxShadow: isSelected ? '0 0 12px rgba(20, 184, 166, 0.15)' : 'none'
                    }}
                  >
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'rgba(20, 184, 166, 0.1)',
                      display: 'grid',
                      placeItems: 'center',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      {acc.profilePhoto ? (
                        <img src={getPhotoSrc(acc.profilePhoto)} alt={acc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Fingerprint style={{ width: '20px', height: '20px', color: 'var(--accent-teal)' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{acc.name}</span>
                        <span style={{ fontSize: '9px', background: 'rgba(20, 184, 166, 0.15)', color: 'var(--accent-teal)', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                          {acc.verificationType || 'VERIFIED'}
                        </span>
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'monospace', marginTop: '2px' }}>
                        ABHA ID: {acc.preferredAbhaAddress || 'N/A'}
                      </div>
                      <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        ABHA No: {acc.ABHANumber} | Gender: {acc.gender === 'M' ? 'Male' : 'Female'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowAccountSelectModal(false);
                  setIsVerifying(false);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedAccount}
                onClick={() => handleSelectAbhaAccount(selectedAccount)}
                className="join-btn"
                style={{
                  flex: 2,
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: !selectedAccount ? 'not-allowed' : 'pointer',
                  opacity: !selectedAccount ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Sparkles style={{ width: '14px', height: '14px' }} />
                <span>Confirm & Log In</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
