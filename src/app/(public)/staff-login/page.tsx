/**
 * @file        page.tsx
 * @description Secure Portal Login for Clinical Staff, Operational operators, and Administrators.
 * @module      staff-login
 * @layer       page
 * @author      Platform Team
 * @created     2026-06-11
 * @modified    2026-06-11
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, demoOtpCredentials } from '../../../providers/AuthProvider';
import { useLanguage } from '../../../providers/LanguageProvider';
import { 
  Stethoscope, 
  Users, 
  ShieldCheck, 
  Loader2, 
  Phone, 
  Key, 
  Mail, 
  Lock,
  Sparkles,
  ArrowLeft,
  Building2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { showToast } from '../../../utils/toast';
import LogoLoader from '../../../components/common/LogoLoader';

export default function StaffLoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { loginWithOtp, loginWithJwt, updateCurrentUser } = useAuth();

  const [selectedRole, setSelectedRole] = useState<'doctor' | 'operator' | 'admin' | 'facility'>('doctor');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [facilityType, setFacilityType] = useState('clinic');
  const [facilityId, setFacilityId] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Prefill default credentials for staff accounts
  const handlePrefill = (role: 'doctor' | 'operator' | 'admin' | 'master_admin' | 'facility' | 'patient') => {
    setErrorMsg('');
    setOtpSent(false);
    setOtp('');

    if (role === 'patient') {
      router.push('/login');
      showToast(t('Redirecting to Citizen Portal for Patient Login...'));
      return;
    }

    if (role === 'admin' || role === 'master_admin') {
      setSelectedRole('admin');
      if (role === 'admin') {
        setEmail('admin@abhasetu.com');
        setPassword('DreamProject@2026');
        showToast(t('Prefilled Default Admin Credentials.'));
      } else {
        setEmail('master@abhasetu.com');
        setPassword('DreamProject@2026');
        showToast(t('Prefilled Default Master Admin Credentials.'));
      }
    } else if (role === 'facility') {
      setSelectedRole('facility');
      setFacilityType('hospital');
      setFacilityId('HFR-104825');
      setMobileNumber('8888888888');
      showToast(t('Prefilled Apollo Hospital Facility credentials.'));
    } else {
      setSelectedRole(role);
      const creds = demoOtpCredentials[role];
      if (creds) {
        setMobileNumber(creds.mobile);
        showToast(t(`Prefilled ${role}'s mobile number`));
      }
    }
  };

  // Trigger mobile OTP simulation for doctor/operator
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.length !== 10) {
      showToast(t('Please enter a valid 10-digit mobile number.'));
      return;
    }
    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
      showToast(t('Simulated OTP sent! Use verification code: 123456'));
    }, 1000);
  };

  // Perform OTP verification & sign-in for doctor/operator/facility
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      showToast(t('Please enter a 6-digit OTP.'));
      return;
    }
    setIsLoading(true);
    setErrorMsg('');

    setTimeout(async () => {
      const loginRole = selectedRole === 'facility' ? 'operator' : (selectedRole as 'doctor' | 'operator');
      const success = await loginWithOtp(loginRole, mobileNumber, otp);
      setIsLoading(false);
      if (success) {
        if (selectedRole === 'facility') {
          updateCurrentUser({
            name: `${facilityType.toUpperCase()} Staff Operator`,
            email: `${facilityType}@abhasetu.com`
          });
        }
        showToast(t('Staff session authorized successfully.'));
        router.push('/');
      } else {
        setErrorMsg(t('Invalid OTP or credential mismatch. Please try again. (Hint: Use 123456)'));
        showToast(t('Verification failed.'));
      }
    }, 1200);
  };

  // Perform JWT sign-in for admin
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/abdm/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.status === 'success') {
        await loginWithJwt(data.token, {
          email: data.user.email,
          role: data.user.role,
          name: data.user.name,
        });
        showToast(t('Administrative session authorized.'));
        router.push('/admin');
      } else {
        setErrorMsg(data.message || t('Invalid administrator credentials.'));
        showToast(t('Authentication failed.'));
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(t('Server connection error. Ensure backend is running.'));
      showToast(t('Network error.'));
    }
  };

  return (
    <div className="login-container" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: '20px', background: 'radial-gradient(circle at top, var(--bg-primary) 30%, #050a12 100%)' }}>
      <LogoLoader isLoading={isLoading} type="login" />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '440px' }}>
        
        {/* Back link */}
        <button
          onClick={() => router.push('/login')}
          style={{
            alignSelf: 'flex-start',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <ArrowLeft style={{ width: '14px', height: '14px' }} />
          <span>Back to Citizen Portal</span>
        </button>

        {/* Login Card */}
        <div style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '30px 24px', boxShadow: 'var(--surface-shadow)', backdropFilter: 'blur(20px)' }}>
          
          {/* Brand Logo */}
          <div className="logo" style={{ justifyContent: 'center', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
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
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <h1 style={{ fontSize: '18px', margin: 0, fontWeight: 800, color: 'var(--text-primary)' }}>ABHA SETU STAFF</h1>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{t('Clinical & Administrative Suite')}</span>
            </div>
          </div>

          <h2 style={{ fontSize: '15px', textAlign: 'center', margin: '0 0 6px', fontWeight: 800 }}>Stakeholder Gateway Login</h2>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center', margin: '0 0 20px', lineHeight: 1.5 }}>
            Access clinical modules, provider registries, and health locker operator dashboards.
          </p>

          {/* Role Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
            <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>1. Select Portal Role</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {[
                { id: 'doctor', label: 'Doctor', icon: Stethoscope },
                { id: 'operator', label: 'Operator', icon: Users },
                { id: 'facility', label: 'Facility', icon: Building2 },
                { id: 'admin', label: 'Admin', icon: ShieldCheck }
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
                      setMobileNumber('');
                      setEmail('');
                      setPassword('');
                      setOtp('');
                      setErrorMsg('');
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

          {/* Render forms based on selected role */}
          {selectedRole === 'admin' ? (
            /* Admin credentials form */
            <form onSubmit={handleAdminLogin} style={{ display: 'grid', gap: '14px' }}>
              <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                Administrator Email
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@abhasetu.com"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px' }}
                />
              </label>
              <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                Security Password
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px' }}
                />
              </label>

              {errorMsg && (
                <div style={{ color: 'var(--danger)', fontSize: '11px', fontWeight: '600', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="join-btn"
                style={{ width: '100%', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Sparkles style={{ width: '16px', height: '16px' }} />
                <span>Verify and Access Console</span>
              </button>
            </form>
          ) : selectedRole === 'facility' ? (
            /* Facility OTP form */
            !otpSent ? (
              <form onSubmit={handleSendOtp} style={{ display: 'grid', gap: '12px' }}>
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Select Facility Type
                  <select
                    value={facilityType}
                    onChange={(e) => setFacilityType(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', height: '38px' }}
                  >
                    <option value="clinic">Clinic / क्लिनिक</option>
                    <option value="hospital">Hospital / अस्पताल</option>
                    <option value="lab">Diagnostic Lab / लैब</option>
                    <option value="pharmacy">Pharmacy / फार्मेसी</option>
                  </select>
                </label>
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Facility Registry ID (HFR ID)
                  <input
                    type="text"
                    required
                    value={facilityId}
                    onChange={(e) => setFacilityId(e.target.value)}
                    placeholder="e.g. HFR-104825"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                </label>
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Facility Mobile Number
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 8888888888"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'monospace' }}
                  />
                </label>

                <button
                  type="submit"
                  className="join-btn"
                  style={{ width: '100%', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Phone style={{ width: '14px', height: '14px' }} />
                  <span>Send Facility OTP</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} style={{ display: 'grid', gap: '12px' }}>
                <div style={{ background: 'rgba(20, 184, 166, 0.06)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(20, 184, 166, 0.15)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  OTP sent. Use simulated code <strong>123456</strong> for testing.
                </div>

                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Enter 6-Digit OTP Code
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '14px', textAlign: 'center', letterSpacing: '8px', fontWeight: 'bold', fontFamily: 'monospace' }}
                  />
                </label>

                {errorMsg && (
                  <div style={{ color: 'var(--danger)', fontSize: '11px', fontWeight: '600', background: 'rgba(239, 68, 68, 0.1)', padding: '6px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                    {errorMsg}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Edit Info
                  </button>
                  <button
                    type="submit"
                    className="join-btn"
                    style={{ flex: 2, minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Sparkles style={{ width: '14px', height: '14px' }} />
                    <span>Verify & Login</span>
                  </button>
                </div>
              </form>
            )
          ) : (
            /* Doctor/Operator OTP form */
            !otpSent ? (
              <form onSubmit={handleSendOtp} style={{ display: 'grid', gap: '12px' }}>
                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  10-Digit Mobile Number
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 9981057765"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'monospace' }}
                  />
                </label>

                <button
                  type="submit"
                  className="join-btn"
                  style={{ width: '100%', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Phone style={{ width: '14px', height: '14px' }} />
                  <span>Send Staff Verification OTP</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} style={{ display: 'grid', gap: '12px' }}>
                <div style={{ background: 'rgba(20, 184, 166, 0.06)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(20, 184, 166, 0.15)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  OTP sent. Use simulated code <strong>123456</strong> for testing.
                </div>

                <label style={{ display: 'grid', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Enter 6-Digit OTP Code
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '14px', textAlign: 'center', letterSpacing: '8px', fontWeight: 'bold', fontFamily: 'monospace' }}
                  />
                </label>

                {errorMsg && (
                  <div style={{ color: 'var(--danger)', fontSize: '11px', fontWeight: '600', background: 'rgba(239, 68, 68, 0.1)', padding: '6px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
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
                    className="join-btn"
                    style={{ flex: 2, minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Sparkles style={{ width: '14px', height: '14px' }} />
                    <span>Verify & Login</span>
                  </button>
                </div>
              </form>
            )
          )}

        </div>

        {/* Staff Demo Credentials Drawer */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => setIsShortcutsOpen(!isShortcutsOpen)}
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
              Staff Demo Sign-in Shortcuts
            </span>
            {isShortcutsOpen ? <ChevronUp style={{ width: '14px', height: '14px' }} /> : <ChevronDown style={{ width: '14px', height: '14px' }} />}
          </button>
          
          {isShortcutsOpen && (
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.1)', borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={() => handlePrefill('patient')}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '11px' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users style={{ width: '13px', height: '13px', color: 'var(--accent-teal)' }} />
                  <span>Aarav Sharma (Patient)</span>
                </span>
                <span style={{ fontSize: '9px', color: 'var(--accent-teal)' }}>Redirect to Citizen</span>
              </button>
              <button
                onClick={() => handlePrefill('doctor')}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '11px' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Stethoscope style={{ width: '13px', height: '13px', color: 'var(--accent-teal)' }} />
                  <span>Dr. Ayesha Ali (Doctor)</span>
                </span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Mobile OTP</span>
              </button>
              <button
                onClick={() => handlePrefill('operator')}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '11px' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users style={{ width: '13px', height: '13px', color: 'var(--accent-cyan)' }} />
                  <span>OPD Desk Operator</span>
                </span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Mobile OTP</span>
              </button>
              <button
                onClick={() => handlePrefill('facility')}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '11px' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 style={{ width: '13px', height: '13px', color: 'var(--accent-teal)' }} />
                  <span>Apollo Hospital (Facility)</span>
                </span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>HFR ID OTP</span>
              </button>
              <button
                onClick={() => handlePrefill('admin')}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '11px' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck style={{ width: '13px', height: '13px', color: 'var(--accent-teal)' }} />
                  <span>System Administrator</span>
                </span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Email/Password</span>
              </button>
              <button
                onClick={() => handlePrefill('master_admin')}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '11px' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck style={{ width: '13px', height: '13px', color: '#eb5e28' }} />
                  <span>Master Admin</span>
                </span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Email/Password</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
