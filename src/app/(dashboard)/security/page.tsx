'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';
import { useLanguage } from '../../../providers/LanguageProvider';
import { Key, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import { useInfiniteScroll } from '../../../utils/hooks/useInfiniteScroll';

export default function SecurityPage() {
  const { securityLogs, currentUser } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Infinite scroll hook for Security logs list
  const {
    visibleItems: visibleLogs,
    hasMore: hasMoreLogs,
    isLoading: loadingLogs,
    loadMore: loadMoreLogs,
    error: logsError,
    retry: retryLogs
  } = useInfiniteScroll(securityLogs, { initialSize: 5, loadSize: 5 });

  // Create a dynamic JWT payload representation for display
  const userBase64 = currentUser
    ? btoa(JSON.stringify({ email: currentUser.email, role: currentUser.role, name: currentUser.name }))
    : 'eyJlbWFpbCI6InBhdGllbnRAYWJoYXNldHUuY29tIiwicm9sZSI6InBhdGllbnQiLCJuYW1lIjoiQW5hbnlhIFZlcm1hIn0';

  const dummyJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${userBase64}.9S2d_12KdaUis92Jdklso01AdksoW921s`;
  const [jwtHeader, jwtPayload, jwtSign] = dummyJwt.split('.');

  if (isLoading) {
    return (
      <>
        {/* Shimmering security skeletons */}
        <section className="route-hero">
          <div className="setu-skeleton setu-skeleton-text" style={{ width: '80px', height: '14px', marginBottom: '8px' }}></div>
          <div className="setu-skeleton setu-skeleton-title" style={{ width: '180px', height: '24px', marginBottom: '8px' }}></div>
          <div className="setu-skeleton setu-skeleton-text" style={{ width: '320px', height: '14px' }}></div>
        </section>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginTop: '20px' }}>
          <div className="route-card" style={{ padding: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <div className="setu-skeleton" style={{ width: '24px', height: '24px', borderRadius: '50%' }}></div>
              <div className="setu-skeleton setu-skeleton-title" style={{ width: '180px', height: '18px' }}></div>
            </div>
            <div className="setu-skeleton setu-skeleton-text" style={{ width: '80%', height: '12px', marginBottom: '12px' }}></div>
            <div className="setu-skeleton" style={{ width: '100%', height: '60px', borderRadius: '8px' }}></div>
          </div>
          <div className="route-card" style={{ padding: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <div className="setu-skeleton" style={{ width: '24px', height: '24px', borderRadius: '50%' }}></div>
              <div className="setu-skeleton setu-skeleton-title" style={{ width: '150px', height: '18px' }}></div>
            </div>
            <div className="setu-skeleton setu-skeleton-text" style={{ width: '90%', height: '12px', marginBottom: '12px' }}></div>
            <div style={{ display: 'grid', gap: '10px' }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <div className="setu-skeleton setu-skeleton-text" style={{ width: '60%', height: '12px' }}></div>
                  <div className="setu-skeleton setu-skeleton-text" style={{ width: '60px', height: '12px' }}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }


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
            {visibleLogs.length === 0 ? (
              <div style={{ padding: '12px 0', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                No security logs recorded yet.
              </div>
            ) : (
              visibleLogs.map((log, idx) => (
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

          {hasMoreLogs && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
              <button
                className="prefill-btn"
                onClick={loadMoreLogs}
                disabled={loadingLogs}
                style={{ padding: '8px 24px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px', minHeight: 'auto', height: '36px' }}
              >
                {loadingLogs ? (
                  <>
                    <Loader2 className="animate-spin" style={{ width: '14px', height: '14px', marginRight: '6px' }} />
                    {t('Loading Logs...')}
                  </>
                ) : (
                  t('Load More Logs')
                )}
              </button>
            </div>
          )}

          {logsError && (
            <div style={{ textAlign: 'center', color: 'var(--danger)', fontSize: '12px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
              <span>{logsError}</span>
              <button className="join-btn" onClick={retryLogs} style={{ padding: '4px 12px', fontSize: '10px', minHeight: 'auto' }}>Retry</button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
