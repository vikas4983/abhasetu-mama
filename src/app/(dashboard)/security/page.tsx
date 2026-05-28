'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';
import { useLanguage } from '../../../providers/LanguageProvider';
import { Key, FileText, ArrowLeft } from 'lucide-react';

export default function SecurityPage() {
  const { securityLogs, currentUser } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  // Create a dynamic JWT payload representation for display
  const userBase64 = currentUser
    ? btoa(JSON.stringify({ email: currentUser.email, role: currentUser.role, name: currentUser.name }))
    : 'eyJlbWFpbCI6InBhdGllbnRAYWJoYXNldHUuY29tIiwicm9sZSI6InBhdGllbnQiLCJuYW1lIjoiQW5hbnlhIFZlcm1hIn0';

  const dummyJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${userBase64}.9S2d_12KdaUis92Jdklso01AdksoW921s`;
  const [jwtHeader, jwtPayload, jwtSign] = dummyJwt.split('.');

  return (
    <>
      {/* Route Hero Header */}
      <section className="route-hero">
        <a href="#" onClick={(e) => { e.preventDefault(); router.push('/'); }} className="back-link">
          <ArrowLeft className="small-icon" style={{ width: '14px', height: '14px', marginRight: '4px' }} />
          {t('Home')}
        </a>
        <div>
          <p className="eyebrow">ABHA SETU</p>
          <h2>{t('Security Logs')}</h2>
          <p>{t('Masked compliance logs, token parameters, and JWT session structures.')}</p>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginTop: '20px' }}>
        {/* Session Token JWT */}
        <article className="route-card">
          <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Key style={{ color: 'var(--accent-teal)' }} />
            <h3 style={{ margin: 0 }}>Session Token Representation (JWT)</h3>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '12px', marginTop: 0 }}>
            Healthcare portal sessions are protected via cryptographically signed JWT tokens holding active role permissions.
          </p>
          <div style={{ fontFamily: 'monospace', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', fontSize: '10px', wordBreak: 'break-all', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            <span style={{ color: 'var(--danger)' }}>{jwtHeader}</span>.
            <span style={{ color: 'var(--accent-teal)' }}>{jwtPayload}</span>.
            <span style={{ color: 'var(--accent-cyan)' }}>{jwtSign}</span>
          </div>
        </article>

        {/* Audit Logs */}
        <section className="route-card wide-card">
          <div className="card-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <FileText style={{ color: 'var(--accent-cyan)' }} />
            <h3 style={{ margin: 0 }}>Secure Security Logs (Aadhaar Masked)</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '14px', marginTop: 0 }}>
            All personal identifiers (vitals, Aadhaar, OTPs) are cryptographically hashed and redacted prior to system audit persistence.
          </p>
          <div style={{ display: 'grid', gap: '8px' }}>
            {securityLogs.length === 0 ? (
              <div style={{ padding: '12px 0', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                No security logs recorded yet.
              </div>
            ) : (
              securityLogs.map((log, idx) => (
                <div
                  key={idx}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    padding: '8px 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    fontSize: '11px',
                  }}
                >
                  <div>
                    <strong style={{ color: 'var(--accent-teal)' }}>{t(log.event)}</strong> -{' '}
                    <span style={{ color: 'var(--text-secondary)' }}>{t(log.details)}</span>
                  </div>
                  <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{log.time}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </>
  );
}
