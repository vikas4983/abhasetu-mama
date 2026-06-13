'use client';

/**
 * @file        page.tsx
 * @description Page component listing all linked ABHA accounts for the current patient session.
 * @module      accounts
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-12
 * @modified    2026-06-12
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../providers/LanguageProvider';
import { useAuth } from '../../../providers/AuthProvider';
import { 
  ArrowLeft, 
  ShieldCheck, 
  User, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  Smartphone
} from 'lucide-react';
import { showToast } from '../../../utils/toast';

export default function AccountsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { currentUser, loginWithAbhaAccount, logSecurityEvent } = useAuth();
  
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSwitchAccount = async (account: any) => {
    setIsLoading(true);
    try {
      const success = await loginWithAbhaAccount('patient', account, currentUser?.linkedAccounts);
      setIsLoading(false);
      if (success) {
        showToast(t('Switched active profile successfully.'));
        logSecurityEvent('Active Profile Switched', `Switched active ABHA profile to ${account.name} (${account.ABHANumber})`);
      } else {
        showToast(t('Failed to switch profile.'));
      }
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      showToast(t('Failed to switch profile.'));
    }
  };

  if (isLoading) {
    return (
      <>
        {/* Shimmering skeleton on mount */}
        <section className="route-hero">
          <div className="setu-skeleton setu-skeleton-text" style={{ width: '80px', height: '14px', marginBottom: '8px' }}></div>
          <div className="setu-skeleton setu-skeleton-title" style={{ width: '220px', height: '24px', marginBottom: '8px' }}></div>
          <div className="setu-skeleton setu-skeleton-text" style={{ width: '300px', height: '14px' }}></div>
        </section>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginTop: '20px' }}>
          <div className="route-card" style={{ padding: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
              <div className="setu-skeleton" style={{ width: '48px', height: '48px', borderRadius: '50%' }}></div>
              <div>
                <div className="setu-skeleton setu-skeleton-title" style={{ width: '180px', height: '18px', marginBottom: '6px' }}></div>
                <div className="setu-skeleton setu-skeleton-text" style={{ width: '120px', height: '12px' }}></div>
              </div>
            </div>
            <div className="setu-skeleton setu-skeleton-text" style={{ width: '60%', height: '12px', marginBottom: '12px' }}></div>
            <div className="setu-skeleton setu-skeleton-button" style={{ height: '36px', width: '100px' }}></div>
          </div>
        </div>
      </>
    );
  }

  const linkedAccounts = currentUser?.linkedAccounts || [];
  const activeAbhaNumber = currentUser?.abhaProfile?.ABHANumber || currentUser?.abhaId || '';

  return (
    <>
      {/* Route Hero Header */}
      <section className="route-hero">
        <a href="#" onClick={(e) => { e.preventDefault(); router.push('/'); }} className="back-link">
          <ArrowLeft className="small-icon" style={{ width: '14px', height: '14px', marginRight: '4px' }} />
          {t('Home')}
        </a>
        <div>
          <p className="eyebrow">AYUSHMAN BHARAT DIGITAL MISSION</p>
          <h2>{t('Linked ABHA Accounts')}</h2>
          <p>{t('Manage and switch between patient profiles linked to your active session.')}</p>
        </div>
      </section>

      {/* Main Container */}
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {linkedAccounts.length === 0 ? (
          <article className="route-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <AlertCircle style={{ width: '48px', height: '48px', color: 'var(--text-muted)', margin: '0 auto 16px' }} />
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 800 }}>{t('No Linked Accounts Found')}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '400px', margin: '0 auto 20px', lineHeight: '1.5' }}>
              {t('You have not authenticated using ABHA OTP yet. Please link your existing ABHA to fetch profiles.')}
            </p>
            <button
              onClick={() => router.push('/abha')}
              style={{
                padding: '10px 24px',
                background: 'var(--accent-teal)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {t('Link Existing ABHA')}
            </button>
          </article>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
              {linkedAccounts.map((account: any, index: number) => {
                const isActive = account.ABHANumber === activeAbhaNumber || account.preferredAbhaAddress === activeAbhaNumber;
                
                // Decode profile photo base64
                let photoUrl = '';
                if (account.profilePhoto) {
                  photoUrl = account.profilePhoto.startsWith('data:') 
                    ? account.profilePhoto 
                    : `data:image/jpeg;base64,${account.profilePhoto}`;
                }

                return (
                  <article 
                    key={index} 
                    className="route-card" 
                    style={{ 
                      padding: '20px', 
                      background: 'var(--bg-secondary)', 
                      border: isActive ? '2px solid var(--accent-teal)' : '1px solid var(--border-color)', 
                      borderRadius: '16px',
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '20px',
                      flexWrap: 'wrap',
                      boxShadow: isActive ? '0 8px 24px color-mix(in srgb, var(--accent-teal) 12%, transparent)' : 'none',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      {/* Avatar Image */}
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: 'var(--bg-card)',
                        border: '1.5px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        color: 'var(--text-muted)'
                      }}>
                        {photoUrl ? (
                          <img 
                            src={photoUrl} 
                            alt={account.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <User style={{ width: '24px', height: '24px' }} />
                        )}
                      </div>

                      {/* Details */}
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {account.name}
                          </h4>
                          {isActive && (
                            <span style={{
                              fontSize: '9px',
                              fontWeight: 800,
                              background: 'rgba(20, 184, 166, 0.12)',
                              color: 'var(--accent-teal)',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              border: '1.5px solid rgba(20, 184, 166, 0.3)'
                            }}>
                              {t('ACTIVE SESSION')}
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          <div>
                            <strong>{t('ABHA Number:')}</strong> {account.ABHANumber}
                          </div>
                          <div>
                            <strong>{t('ABHA Address:')}</strong> {account.preferredAbhaAddress}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                            <span style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: account.status === 'ACTIVE' ? 'var(--success)' : 'var(--danger)'
                            }} />
                            <span style={{ fontSize: '10px', fontWeight: 700, color: account.status === 'ACTIVE' ? 'var(--success)' : 'var(--danger)' }}>
                              {account.status || 'ACTIVE'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Switch Button */}
                    <div>
                      {isActive ? (
                        <button
                          disabled
                          style={{
                            padding: '10px 20px',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            fontWeight: 700,
                            cursor: 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <CheckCircle2 style={{ width: '16px', height: '16px', color: 'var(--accent-teal)' }} />
                          <span>{t('Active')}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSwitchAccount(account)}
                          style={{
                            padding: '10px 20px',
                            background: 'color-mix(in srgb, var(--accent-teal) 12%, transparent)',
                            color: 'var(--accent-teal)',
                            border: '1px solid color-mix(in srgb, var(--accent-teal) 25%, transparent)',
                            borderRadius: '8px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--accent-teal)';
                            e.currentTarget.style.color = '#ffffff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'color-mix(in srgb, var(--accent-teal) 12%, transparent)';
                            e.currentTarget.style.color = 'var(--accent-teal)';
                          }}
                        >
                          <span>{t('Switch Profile')}</span>
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Note Panel */}
            <div style={{ display: 'flex', gap: '8px', padding: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', alignItems: 'center' }}>
              <Smartphone style={{ color: 'var(--accent-teal)', width: '20px', height: '20px', flexShrink: 0 }} />
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'left', lineHeight: '1.4' }}>
                {t('All accounts listed above are securely synchronized with the Ayushman Bharat Digital Mission (ABDM) Gateway. Switching your active profile changes the primary ABHA ID linked to OPD token registration and health records sharing.')}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
