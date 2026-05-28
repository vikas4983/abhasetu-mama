'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, demoCredentials } from '../../../providers/AuthProvider';
import { useLanguage } from '../../../providers/LanguageProvider';
import { Plus, UserRound, Stethoscope, Users, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { showToast } from '../../../utils/toast';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleRolePrefill = (role: 'patient' | 'doctor' | 'operator' | 'admin') => {
    setSelectedRole(role);
    const creds = demoCredentials[role];
    if (creds) {
      setEmail(creds.email);
      setPassword(creds.pass);
      showToast(t(`Prefilled credentials for ${creds.name}`));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsAuthenticating(true);

    // Dynamic verification loader spinner
    setTimeout(async () => {
      const success = await login(email, password);
      setIsAuthenticating(false);
      if (success) {
        showToast(t('Welcome back! Session authorized.'));
        router.push('/');
      } else {
        setErrorMsg(t('Invalid credentials. Please verify.'));
      }
    }, 800);
  };

  return (
    <div className="login-container" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: '20px' }}>
      <div className="login-card" style={{ width: '100%', maxWidth: '400px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '30px 24px', boxShadow: 'var(--surface-shadow)' }}>
        
        {/* Brand Logo */}
        <div className="logo" style={{ justifyContent: 'center', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="logo-icon" style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(0, 212, 170, 0.1)', display: 'grid', placeItems: 'center' }}>
            <Plus className="logo-plus" style={{ width: '20px', height: '20px', color: 'var(--accent-teal)' }} />
          </div>
          <div className="logo-text" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '18px', margin: 0, fontWeight: 800, color: 'var(--text-primary)' }}>ABHA SETU</h1>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>National Digital Health Bridge</span>
          </div>
        </div>

        <h2 style={{ fontSize: '18px', textAlign: 'center', margin: '0 0 4px', fontWeight: 800 }}>Secure Portal Sign-In</h2>
        <p className="subtitle" style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', margin: '0 0 20px', lineHeight: 1.5 }}>
          Select a quick demo role to prefill or sign in manually.
        </p>

        {/* Quick Prefill Grid */}
        <div className="role-prefill-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
          <button
            type="button"
            className={`prefill-btn ${selectedRole === 'patient' ? 'active' : ''}`}
            onClick={() => handleRolePrefill('patient')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border-color)', background: selectedRole === 'patient' ? 'rgba(0, 212, 170, 0.1)' : 'var(--bg-secondary)', color: selectedRole === 'patient' ? 'var(--accent-teal)' : 'var(--text-primary)' }}
          >
            <UserRound style={{ width: '16px', height: '16px' }} />
            <span>Patient</span>
          </button>
          <button
            type="button"
            className={`prefill-btn ${selectedRole === 'doctor' ? 'active' : ''}`}
            onClick={() => handleRolePrefill('doctor')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border-color)', background: selectedRole === 'doctor' ? 'rgba(0, 212, 170, 0.1)' : 'var(--bg-secondary)', color: selectedRole === 'doctor' ? 'var(--accent-teal)' : 'var(--text-primary)' }}
          >
            <Stethoscope style={{ width: '16px', height: '16px' }} />
            <span>Doctor</span>
          </button>
          <button
            type="button"
            className={`prefill-btn ${selectedRole === 'operator' ? 'active' : ''}`}
            onClick={() => handleRolePrefill('operator')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border-color)', background: selectedRole === 'operator' ? 'rgba(0, 212, 170, 0.1)' : 'var(--bg-secondary)', color: selectedRole === 'operator' ? 'var(--accent-teal)' : 'var(--text-primary)' }}
          >
            <Users style={{ width: '16px', height: '16px' }} />
            <span>Operator</span>
          </button>
          <button
            type="button"
            className={`prefill-btn ${selectedRole === 'admin' ? 'active' : ''}`}
            onClick={() => handleRolePrefill('admin')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border-color)', background: selectedRole === 'admin' ? 'rgba(0, 212, 170, 0.1)' : 'var(--bg-secondary)', color: selectedRole === 'admin' ? 'var(--accent-teal)' : 'var(--text-primary)' }}
          >
            <ShieldCheck style={{ width: '16px', height: '16px' }} />
            <span>Admin</span>
          </button>
        </div>

        <div className="divider" style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)', margin: '16px 0', letterSpacing: '1px', fontWeight: 'bold' }}>
          OR SIGN IN MANUALLY
        </div>

        {/* Manual Form */}
        <form className="form-grid" onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
          <label style={{ display: 'grid', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Email Address
            <input
              type="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setSelectedRole(null); }}
              placeholder="name@domain.com"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px' }}
            />
          </label>
          <label style={{ display: 'grid', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => { setPassword(e.target.value); setSelectedRole(null); }}
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px' }}
            />
          </label>

          {errorMsg && (
            <div id="login-error" style={{ color: 'var(--danger)', fontSize: '11px', fontWeight: '600' }}>
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="join-btn"
            disabled={isAuthenticating}
            style={{ width: '100%', minHeight: '44px', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {isAuthenticating ? (
              <>
                <Loader2 className="animate-spin" style={{ width: '16px', height: '16px' }} />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <Sparkles style={{ width: '16px', height: '16px' }} />
                <span>Verify and Access</span>
              </>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '12px', marginTop: '18px', color: 'var(--text-secondary)', margin: '18px 0 0' }}>
          New to the ecosystem?{' '}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); router.push('/register'); }}
            style={{ color: 'var(--accent-teal)', fontWeight: '700', textDecoration: 'none' }}
          >
            Register Health Account
          </a>
        </p>
      </div>
    </div>
  );
}
