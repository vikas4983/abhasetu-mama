'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, demoOtpCredentials } from '../../../providers/AuthProvider';
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
  Lock
} from 'lucide-react';
import { showToast } from '../../../utils/toast';
import LogoLoader from '../../../components/common/LogoLoader';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { loginWithOtp } = useAuth();

  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | 'operator'>('patient');
  const [activeTab, setActiveTab] = useState<'mobile' | 'aadhaar' | 'abha'>('mobile');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  // Prefill helper
  const handleDemoPrefill = (role: 'patient' | 'doctor' | 'operator', type: 'mobile' | 'aadhaar' | 'abha') => {
    setSelectedRole(role);
    setActiveTab(type);
    setOtpSent(false);
    setOtp('');
    setErrorMsg('');

    const creds = demoOtpCredentials[role];
    if (creds) {
      const val = type === 'mobile' ? creds.mobile : type === 'aadhaar' ? creds.aadhaar : creds.abha;
      setIdentifier(val);
      showToast(t(`Prefilled ${role}'s ${type.toUpperCase()}`));
    }
  };

  // Simulate OTP sending
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      showToast(t('Please enter a valid identifier.'));
      return;
    }
    
    setIsSendingOtp(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsSendingOtp(false);
      setOtpSent(true);
      showToast(t('Simulated OTP sent! Use verification code: 123456'));
    }, 1200);
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

    setTimeout(async () => {
      const success = await loginWithOtp(selectedRole, identifier, otp);
      setIsVerifying(false);
      if (success) {
        showToast(t('Authentication successful! Welcome back.'));
        router.push('/');
      } else {
        setErrorMsg(t('Invalid OTP or credential mismatch. Please try again. (Hint: Use 123456)'));
        showToast(t('Authorization failed.'));
      }
    }, 1500);
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
        <div className="login-card" style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '30px 24px', boxShadow: 'var(--surface-shadow)', backdropFilter: 'blur(20px)' }}>
          
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

          {/* Interactive Role Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
            <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>1. Choose Your Portal Role</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              {[
                { id: 'patient', label: 'Patient', icon: UserRound },
                { id: 'doctor', label: 'Doctor', icon: Stethoscope },
                { id: 'operator', label: 'Operator', icon: Users }
              ].map(role => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role.id as any);
                      setOtpSent(false);
                      setIdentifier('');
                      setOtp('');
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '8px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: isSelected ? '1px solid var(--accent-teal)' : '1px solid var(--border-color)',
                      background: isSelected ? 'rgba(20, 184, 166, 0.08)' : 'var(--bg-secondary)',
                      color: isSelected ? 'var(--accent-teal)' : 'var(--text-primary)',
                      transition: 'all 0.2s ease',
                      fontSize: '11px',
                      fontWeight: isSelected ? 'bold' : 'normal'
                    }}
                  >
                    <Icon style={{ width: '15px', height: '15px' }} />
                    <span>{role.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tabbed Auth Mode Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
            <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>2. Select Validation Method</span>
            <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: '30px', padding: '3px', border: '1px solid var(--border-color)' }}>
              {[
                { id: 'mobile', label: 'Mobile OTP', icon: Phone },
                { id: 'aadhaar', label: 'Aadhaar OTP', icon: CreditCard },
                { id: 'abha', label: 'ABHA OTP', icon: Heart }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setOtpSent(false);
                      setIdentifier('');
                      setOtp('');
                    }}
                    style={{
                      flex: 1,
                      padding: '6px 4px',
                      borderRadius: '20px',
                      border: 'none',
                      background: isActive ? 'var(--accent-teal)' : 'transparent',
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                      fontSize: '10.5px',
                      fontWeight: isActive ? 'bold' : '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Icon style={{ width: '12px', height: '12px' }} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Area */}
          {!otpSent ? (
            <form onSubmit={handleSendOtp} style={{ display: 'grid', gap: '12px' }}>
              <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                {getIdentifierLabel()}
                <input
                  type={activeTab === 'mobile' ? 'tel' : 'text'}
                  required
                  maxLength={getMaxIdentifierLength()}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={getIdentifierPlaceholder()}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'monospace' }}
                />
              </label>

              <button
                type="submit"
                disabled={isSendingOtp}
                className="join-btn"
                style={{ width: '100%', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
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
          ) : (
            <form onSubmit={handleVerifyOtp} style={{ display: 'grid', gap: '12px' }}>
              <div style={{ background: 'rgba(20, 184, 166, 0.06)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(20, 184, 166, 0.15)', fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', gap: '6px' }}>
                <Info style={{ width: '14px', height: '14px', color: 'var(--accent-teal)', flexShrink: 0 }} />
                <div>
                  OTP sent to credential linked phone. Use dummy code <strong>123456</strong> for testing.
                </div>
              </div>

              <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                Enter 6-Digit OTP Code
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="••••••"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '14px', textAlign: 'center', letterSpacing: '8px', fontWeight: 'bold', fontFamily: 'monospace' }}
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
                  onClick={() => setOtpSent(false)}
                  style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Edit Number
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="join-btn"
                  style={{ flex: 2, minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
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
          )}

          {/* Quick link to admin console */}
          <div style={{ textAlign: 'center', fontSize: '11px', marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Are you an administrator? </span>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); router.push('/admin/login'); }}
              style={{ color: 'var(--accent-teal)', fontWeight: 'bold', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
            >
              <ShieldCheck style={{ width: '12px', height: '12px' }} />
              Access Admin Console
            </a>
          </div>

        </div>

        {/* Demo Accounts Prefill Accordion/Drawer */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.02)',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock style={{ width: '13px', height: '13px', color: 'var(--accent-teal)' }} />
              ABHA Demo Testing Accounts
            </span>
            {isDrawerOpen ? <ChevronUp style={{ width: '14px', height: '14px' }} /> : <ChevronDown style={{ width: '14px', height: '14px' }} />}
          </button>

          {isDrawerOpen && (
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(0,0,0,0.1)', borderTop: '1px solid var(--border-color)' }}>
              {[
                { role: 'patient', label: 'Aarav Sharma (Patient)', mobile: '9876543210', aadhaar: '123456789012', abha: '91-1234-5678-9012' },
                { role: 'doctor', label: 'Dr. Ayesha Ali (Doctor)', mobile: '9981057765', aadhaar: '987654321098', abha: '91-9876-5432-1098' },
                { role: 'operator', label: 'OPD Operator (Operator)', mobile: '8888888888', aadhaar: '888888888888', abha: '91-8888-8888-8888' }
              ].map(item => (
                <div key={item.role} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', fontSize: '10.5px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '6px', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{item.label}</span>
                    <span style={{ fontSize: '9px', background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: '4px', color: 'var(--text-muted)' }}>OTP: 123456</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
                    <button
                      onClick={() => handleDemoPrefill(item.role as any, 'mobile')}
                      style={{ padding: '4px 2px', border: '1px solid rgba(20, 184, 166, 0.2)', borderRadius: '4px', background: 'rgba(20, 184, 166, 0.04)', color: 'var(--accent-teal)', cursor: 'pointer', fontSize: '9px' }}
                    >
                      Prefill Mobile
                    </button>
                    <button
                      onClick={() => handleDemoPrefill(item.role as any, 'aadhaar')}
                      style={{ padding: '4px 2px', border: '1px solid rgba(23, 162, 184, 0.2)', borderRadius: '4px', background: 'rgba(23, 162, 184, 0.04)', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '9px' }}
                    >
                      Prefill Aadhaar
                    </button>
                    <button
                      onClick={() => handleDemoPrefill(item.role as any, 'abha')}
                      style={{ padding: '4px 2px', border: '1px solid rgba(235, 94, 40, 0.2)', borderRadius: '4px', background: 'rgba(235, 94, 40, 0.04)', color: '#eb5e28', cursor: 'pointer', fontSize: '9px' }}
                    >
                      Prefill ABHA
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
