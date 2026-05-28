'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../../providers/LanguageProvider';
import { useAuth } from '../../../../providers/AuthProvider';
import { ShieldAlert, KeyRound, Sparkles, HelpCircle, Mail } from 'lucide-react';
import { showToast } from '../../../../utils/toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { logSecurityEvent } = useAuth();

  const [email, setEmail] = useState('admin@abhasetu.com');
  const [password, setPassword] = useState('MasterAdminPassword1!');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Automatically redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      router.push('/admin/docs');
    }
  }, [router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    showToast(t('Validating administrator credentials...'));

    // Simulated high-security Admin Auth authentication handshake
    setTimeout(() => {
      if (email === 'admin@abhasetu.com' && password === 'MasterAdminPassword1!') {
        const dummyJwt = `ABHA_ADMIN_JWT_${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
        localStorage.setItem('admin_token', dummyJwt);
        
        logSecurityEvent('Admin Authenticated', `Master Admin successfully authorized via admin console. Email: ${email}`);
        showToast(t('Authentication successful! Welcome to the Dev Sandbox.'));
        
        setLoading(false);
        router.push('/admin/docs');
      } else {
        setErrorMsg(t('Invalid administrator email or password scope. Access Denied.'));
        logSecurityEvent('Admin Auth Failed', `Unauthorized logon attempt to admin panel. Input Email: ${email}`);
        setLoading(false);
      }
    }, 1200);
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '75vh', width: '100%' }}>
      <article className="route-card" style={{ width: '100%', maxWidth: '440px', padding: '32px', border: '1px solid rgba(0, 212, 170, 0.2)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', background: 'rgba(6, 10, 18, 0.65)' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '10px', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0, 212, 170, 0.1)', color: 'var(--accent-teal)', display: 'grid', placeItems: 'center', boxShadow: '0 0 20px rgba(0, 212, 170, 0.15)' }}>
            <KeyRound style={{ width: '22px', height: '22px' }} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Master Admin Dev Portal</h2>
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>Log in to access dynamic ABDM sandbox testing tools.</p>
          </div>
        </div>

        {errorMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#ef4444', fontSize: '12px', marginBottom: '18px' }}>
            <ShieldAlert style={{ width: '16px', height: '16px', flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} style={{ display: 'grid', gap: '16px' }}>
          <label style={{ display: 'grid', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            Administrator Email
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail style={{ position: 'absolute', left: '12px', width: '14px', height: '14px', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@abhasetu.com"
                style={{ width: '100%', padding: '12px 12px 12px 38px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px' }}
              />
            </div>
          </label>

          <label style={{ display: 'grid', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            Security Access Password
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <KeyRound style={{ position: 'absolute', left: '12px', width: '14px', height: '14px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{ width: '100%', padding: '12px 12px 12px 38px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px' }}
              />
            </div>
          </label>

          <button
            type="submit"
            className="join-btn animate-glow"
            disabled={loading}
            style={{ width: '100%', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}
          >
            {loading ? (
              <>
                <Sparkles className="pulse-dot" style={{ width: '16px', height: '16px' }} />
                <span>Authenticating Admin...</span>
              </>
            ) : (
              <>
                <KeyRound style={{ width: '16px', height: '16px' }} />
                <span>Log In as Master Admin</span>
              </>
            )}
          </button>
        </form>

        {/* Informative Pre-fill Help Card */}
        <div style={{ background: 'rgba(0, 212, 170, 0.03)', border: '1px dashed rgba(0, 212, 170, 0.2)', padding: '12px 16px', borderRadius: '8px', display: 'flex', gap: '10px', marginTop: '20px', fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'left', lineHeight: 1.5 }}>
          <HelpCircle style={{ width: '16px', height: '16px', color: 'var(--accent-teal)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Verification Credentials:</strong>
            <div style={{ fontFamily: 'monospace', marginTop: '4px', background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
              Email: admin@abhasetu.com<br />
              Pass: MasterAdminPassword1!
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
