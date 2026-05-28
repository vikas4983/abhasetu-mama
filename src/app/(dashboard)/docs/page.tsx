'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../providers/LanguageProvider';
import { ShieldAlert, KeyRound, ArrowLeft } from 'lucide-react';

export default function PublicDocsGatewayPage() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <>
      {/* Route Hero Header */}
      <section className="route-hero">
        <a href="#" onClick={(e) => { e.preventDefault(); router.push('/'); }} className="back-link">
          <ArrowLeft className="small-icon" style={{ width: '14px', height: '14px', marginRight: '4px' }} />
          {t('Home')}
        </a>
        <div>
          <p className="eyebrow">ABHA SETU SECURITY DIRECTIVE</p>
          <h2>{t('Secure Developer Portal')}</h2>
          <p>{t('Protected boundary under national digital health sandbox standards.')}</p>
        </div>
      </section>

      <div style={{ display: 'grid', placeItems: 'center', minHeight: '50vh', width: '100%', padding: '20px' }}>
        <article className="route-card" style={{ width: '100%', maxWidth: '480px', padding: '32px', border: '1px solid rgba(0, 212, 170, 0.2)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', background: 'rgba(6, 10, 18, 0.65)', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0, 212, 170, 0.1)', color: 'var(--accent-teal)', display: 'grid', placeItems: 'center', margin: '0 auto 16px', boxShadow: '0 0 20px rgba(0, 212, 170, 0.15)' }}>
            <ShieldAlert style={{ width: '22px', height: '22px' }} />
          </div>
          
          <h2 style={{ margin: '0 0 10px', fontSize: '16px', fontWeight: 800 }}>Developer Console Secured</h2>
          <p style={{ margin: '0 0 24px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            In absolute compliance with the **DPDP Act 2023** and NHA Sandbox operational rules, all interactive cURL sandboxes, regex validation tools, and cryptographic keys have been restricted.
            <br /><br />
            To perform API evaluations, please authorize your session using verified Master Administrator scopes.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => router.push('/admin/login')}
              className="join-btn animate-glow"
              style={{ width: '100%', minHeight: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: 0 }}
            >
              <KeyRound style={{ width: '14px', height: '14px' }} />
              <span>Log In as Master Admin</span>
            </button>
            <button
              onClick={() => router.push('/')}
              className="join-btn"
              style={{ width: '100%', minHeight: '42px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', margin: 0 }}
            >
              Back to Patient Dashboard
            </button>
          </div>
        </article>
      </div>
    </>
  );
}
