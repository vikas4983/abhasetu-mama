'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../providers/LanguageProvider';
import { ShieldCheck, LogOut, Home } from 'lucide-react';
import { showToast } from '../../utils/toast';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { t } = useLanguage();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    showToast(t('Master Admin session ended.'));
    router.push('/admin/login');
  };

  return (
    <div className="app admin-shell" style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, #0c1424 0%, #060a12 100%)', color: 'var(--text-primary)' }}>
      {/* Admin Navbar */}
      <header className="header" style={{ borderBottom: '1px solid rgba(0, 212, 170, 0.15)', background: 'rgba(6, 10, 18, 0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => router.push('/')}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #00d4aa 0%, #00bc98 100%)', display: 'grid', placeItems: 'center', color: '#000000', boxShadow: '0 0 15px rgba(0, 212, 170, 0.4)' }}>
              <ShieldCheck style={{ width: '18px', height: '18px' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '15px', fontWeight: 800, letterSpacing: '0.5px', color: '#ffffff' }}>
                ABHA SETU <span style={{ color: 'var(--accent-teal)', fontSize: '10px', fontWeight: 'normal', background: 'rgba(0, 212, 170, 0.1)', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>ADMIN</span>
              </h1>
              <p style={{ margin: 0, fontSize: '9px', color: 'var(--text-secondary)' }}>National Digital Health Bridge Console</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => router.push('/')}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <Home style={{ width: '12px', height: '12px' }} />
              Portal Home
            </button>
            
            {typeof window !== 'undefined' && localStorage.getItem('admin_token') && (
              <button
                onClick={handleLogout}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <LogOut style={{ width: '12px', height: '12px' }} />
                End Session
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Admin Workspace Area */}
      <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>
    </div>
  );
}
