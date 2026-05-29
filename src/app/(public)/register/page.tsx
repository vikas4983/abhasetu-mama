'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';
import { useLanguage } from '../../../providers/LanguageProvider';
import { Plus, Sparkles, Loader2 } from 'lucide-react';
import { showToast } from '../../../utils/toast';
import LogoLoader from '../../../components/common/LogoLoader';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [selectedLogo, setSelectedLogo] = useState<string>('default');
  const [isRegistering, setIsRegistering] = useState(false);

  React.useEffect(() => {
    try {
      const state = JSON.parse(localStorage.getItem('setu_state') || '{}');
      if (state.selectedLogo) {
        setSelectedLogo(state.selectedLogo);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);

    setTimeout(() => {
      register(name, email, mobile);
      setIsRegistering(false);
      showToast(t('Account created successfully! Welcome to ABHA SETU.'));
    }, 1800); // 1.8 seconds enrollment animation
  };

  return (
    <div className="login-container" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: '20px' }}>
      <LogoLoader isLoading={isRegistering} type="register" />
      <div className="login-card" style={{ width: '100%', maxWidth: '400px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '30px 24px', boxShadow: 'var(--surface-shadow)' }}>
        
        {/* Brand Logo */}
        <div className="logo" style={{ justifyContent: 'center', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div 
            className="logo-icon" 
            style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: '50%', 
              background: selectedLogo !== 'default' ? 'transparent' : 'color-mix(in srgb, var(--accent-teal) 10%, transparent)', 
              display: 'grid', 
              placeItems: 'center',
              overflow: 'hidden',
              padding: selectedLogo !== 'default' && selectedLogo.includes('logo6') ? '2px' : '0'
            }}
          >
            {selectedLogo === 'default' ? (
              <Plus className="logo-plus" style={{ width: '20px', height: '20px', color: 'var(--accent-teal)' }} />
            ) : (
              <img
                src={selectedLogo}
                alt="Brand Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            )}
          </div>
          <div className="logo-text" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '18px', margin: 0, fontWeight: 800, color: 'var(--text-primary)' }}>ABHA SETU</h1>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{t('Digital Health Bridge')}</span>
          </div>
        </div>

        <h2 style={{ fontSize: '18px', textAlign: 'center', margin: '0 0 4px', fontWeight: 800 }}>Register Health Account</h2>
        <p className="subtitle" style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', margin: '0 0 20px', lineHeight: 1.5 }}>
          Enroll in the ABDM-linked healthcare ecosystem instantly.
        </p>

        {/* Form */}
        <form className="form-grid" onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
          <label style={{ display: 'grid', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Full Name
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Ayesha Ali"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px' }}
            />
          </label>
          <label style={{ display: 'grid', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Email Address
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ayesha.ali@domain.com"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px' }}
            />
          </label>
          <label style={{ display: 'grid', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Mobile Number
            <input
              type="tel"
              required
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="9876542070"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px' }}
            />
          </label>
          <label style={{ display: 'grid', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Create Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px' }}
            />
          </label>

          <button
            type="submit"
            className="join-btn"
            disabled={isRegistering}
            style={{ width: '100%', minHeight: '44px', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {isRegistering ? (
              <>
                <Loader2 className="animate-spin" style={{ width: '16px', height: '16px' }} />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <Sparkles style={{ width: '16px', height: '16px' }} />
                <span>Create Account & Login</span>
              </>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '12px', marginTop: '18px', color: 'var(--text-secondary)', margin: '18px 0 0' }}>
          Already registered?{' '}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); router.push('/login'); }}
            style={{ color: 'var(--accent-teal)', fontWeight: '700', textDecoration: 'none' }}
          >
            Login Here
          </a>
        </p>
      </div>
    </div>
  );
}
