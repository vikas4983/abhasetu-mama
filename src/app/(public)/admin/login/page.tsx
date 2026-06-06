'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../providers/AuthProvider';
import { useLanguage } from '../../../../providers/LanguageProvider';
import { ShieldCheck, Loader2, Sparkles, Key } from 'lucide-react';
import { showToast } from '../../../../utils/toast';
import LogoLoader from '../../../../components/common/LogoLoader';

export default function AdminLoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { loginWithJwt } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handlePrefill = (role: 'admin' | 'master_admin') => {
    if (role === 'admin') {
      setEmail('admin@abhasetu.com');
      setPassword('DreamProject@2026');
      showToast(t('Prefilled Default Admin Credentials.'));
    } else {
      setEmail('master@abhasetu.com');
      setPassword('DreamProject@2026');
      showToast(t('Prefilled Default Master Admin Credentials.'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsAuthenticating(true);

    try {
      const res = await fetch('/api/abdm/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        await loginWithJwt(data.token, {
          email: data.user.email,
          role: data.user.role,
          name: data.user.name,
        });
        showToast(t('Welcome back! Secure administrative session authorized.'));
        router.push('/admin');
      } else {
        setErrorMsg(data.message || t('Invalid administrator credentials.'));
        showToast(t('Authentication failed.'));
      }
    } catch (err) {
      setErrorMsg(t('Server connection error. Ensure database and backend are running.'));
      showToast(t('Network error.'));
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="login-container" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: '20px' }}>
      <LogoLoader isLoading={isAuthenticating} type="login" />
      <div className="login-card" style={{ width: '100%', maxWidth: '420px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '36px 28px', boxShadow: 'var(--surface-shadow)' }}>
        
        {/* Brand Logo */}
        <div className="logo" style={{ justifyContent: 'center', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{t('Administrative Control Suite')}</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
          <span style={{ fontSize: '10px', fontWeight: 'bold', background: 'rgba(23, 162, 184, 0.15)', color: 'var(--accent-teal)', padding: '4px 10px', borderRadius: '30px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck style={{ width: '12px', height: '12px' }} />
            SECURE CONSOLE SIGN-IN
          </span>
        </div>

        <h2 style={{ fontSize: '18px', textAlign: 'center', margin: '8px 0 4px', fontWeight: 800 }}>Admin Console Access</h2>
        <p className="subtitle" style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center', margin: '0 0 24px', lineHeight: 1.5 }}>
          Authorized system administrators only. Access is tracked and audited.
        </p>

        {/* Quick Demo Credentials Prefill */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => handlePrefill('admin')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '11.5px', fontWeight: '600' }}
          >
            <Key style={{ width: '13px', height: '13px', color: 'var(--accent-teal)' }} />
            <span>Prefill Admin</span>
          </button>
          <button
            type="button"
            onClick={() => handlePrefill('master_admin')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '11.5px', fontWeight: '600' }}
          >
            <Key style={{ width: '13px', height: '13px', color: '#eb5e28' }} />
            <span>Prefill Master</span>
          </button>
        </div>

        {/* Manual Form */}
        <form className="form-grid" onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
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
            <div id="login-error" style={{ color: 'var(--danger)', fontSize: '11.5px', fontWeight: '600', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
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
                <span>Authorizing JWT...</span>
              </>
            ) : (
              <>
                <Sparkles style={{ width: '16px', height: '16px' }} />
                <span>Verify and Access Console</span>
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '11px', marginTop: '20px', color: 'var(--text-secondary)' }}>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); router.push('/login'); }}
            style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
          >
            ← Return to Public Health Portal
          </a>
        </div>
      </div>
    </div>
  );
}
