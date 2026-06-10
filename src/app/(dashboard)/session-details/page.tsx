/**
 * @file        page.tsx
 * @description Gateway Diagnostics webpage showing active session tokens TTLs and statuses.
 * @module      abdm/session
 * @layer       page
 * @author      Platform Team
 * @created     2026-06-11
 * @modified    2026-06-11
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../providers/LanguageProvider';
import { ArrowLeft, Clock, ShieldCheck, Key, Shield, Info, Activity, RefreshCw } from 'lucide-react';
import { showToast } from '../../../utils/toast';

export default function SessionDetailsPage() {
  const router = useRouter();
  const { t } = useLanguage();

  // Timers States
  const [sessionTimer, setSessionTimer] = useState('N/A');
  const [refreshTimer, setRefreshTimer] = useState('N/A');
  const [xTokenTimer, setXTokenTimer] = useState('N/A');
  const [keyTimer, setKeyTimer] = useState('N/A');

  const [sessionExpired, setSessionExpired] = useState(true);
  const [refreshExpired, setRefreshExpired] = useState(true);
  const [xTokenExpired, setXTokenExpired] = useState(true);
  const [keyExpired, setKeyExpired] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const updateAllTimers = () => {
    // 1. Session Expiry
    const sessionVal = localStorage.getItem('abha_session_expiry');
    if (sessionVal) {
      const diff = Number(sessionVal) - Date.now();
      if (diff <= 0) {
        setSessionExpired(true);
        setSessionTimer('EXPIRED');
      } else {
        setSessionExpired(false);
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setSessionTimer(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
      }
    } else {
      setSessionExpired(true);
      setSessionTimer('N/A');
    }

    // 2. Refresh Expiry
    const refreshVal = localStorage.getItem('abha_refresh_expiry');
    if (refreshVal) {
      const diff = Number(refreshVal) - Date.now();
      if (diff <= 0) {
        setRefreshExpired(true);
        setRefreshTimer('EXPIRED');
      } else {
        setRefreshExpired(false);
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setRefreshTimer(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
      }
    } else {
      setRefreshExpired(true);
      setRefreshTimer('N/A');
    }

    // 3. X-Token Expiry
    const xTokenVal = localStorage.getItem('x_token_expiry');
    if (xTokenVal) {
      const diff = Number(xTokenVal) - Date.now();
      if (diff <= 0) {
        setXTokenExpired(true);
        setXTokenTimer('EXPIRED');
      } else {
        setXTokenExpired(false);
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setXTokenTimer(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
      }
    } else {
      setXTokenExpired(true);
      setXTokenTimer('N/A');
    }

    // 4. Public Key Expiry
    const keyVal = localStorage.getItem('public_key_expiry');
    if (keyVal) {
      const diff = Number(keyVal) - Date.now();
      if (diff <= 0) {
        setKeyExpired(true);
        setKeyTimer('EXPIRED');
      } else {
        setKeyExpired(false);
        const days = Math.floor(diff / (24 * 3600000));
        const hours = Math.floor((diff % (24 * 3600000)) / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setKeyTimer(`${days}d ${hours}h ${mins}m ${secs}s`);
      }
    } else {
      setKeyExpired(true);
      setKeyTimer('N/A');
    }
  };

  useEffect(() => {
    updateAllTimers();
    const interval = setInterval(updateAllTimers, 1000);
    return () => clearInterval(interval);
  }, []);

  const triggerSessionRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/abdm/sessions', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const sessionTtl = data.expiresIn || 1200;
        const refreshTtl = data.refreshExpiresIn || 1800;
        localStorage.setItem('abha_session_expiry', String(Date.now() + sessionTtl * 1000));
        localStorage.setItem('abha_refresh_expiry', String(Date.now() + refreshTtl * 1000));
        window.dispatchEvent(new Event('setu_state_update'));
        showToast(t('Gateway session refreshed successfully!'));
        updateAllTimers();
      } else {
        showToast(t('Failed to refresh session: ') + (data.message || 'Unknown error'));
      }
    } catch (err: any) {
      showToast(t('Network error refreshing session.'));
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <>
      {/* Hero Header */}
      <section className="route-hero">
        <a href="#" onClick={(e) => { e.preventDefault(); router.push('/'); }} className="back-link" aria-label="Go back to Home">
          <ArrowLeft className="small-icon" style={{ width: '14px', height: '14px', marginRight: '4px' }} />
          {t('Home')}
        </a>
        <div>
          <p className="eyebrow">ABDM SANDBOX GATEWAY</p>
          <h2>{t('Gateway Session Diagnostics')}</h2>
          <p>{t('Monitor active security session variables, encryption key life cycles, and request telemetry logs.')}</p>
        </div>
      </section>

      <div style={{ maxWidth: '800px', margin: '20px auto 40px', display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 16px' }}>
        
        {/* Actions header */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={triggerSessionRefresh}
            disabled={isRefreshing}
            className="primary-action"
            style={{
              padding: '10px 18px',
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <RefreshCw className={isRefreshing ? 'animate-spin' : ''} style={{ width: '15px', height: '15px' }} />
            <span>{isRefreshing ? t('Refreshing...') : t('Force Session Refresh')}</span>
          </button>
        </div>

        {/* Diagnostic Status Card Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          
          {/* Card 1: Session Expiry */}
          <article className="route-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(0, 212, 170, 0.1)', color: 'var(--accent-teal)', display: 'grid', placeItems: 'center' }}>
                <Clock style={{ width: '18px', height: '18px' }} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Gateway Session TTL</h4>
                <div style={{ fontSize: '24px', fontWeight: '850', color: sessionExpired ? 'var(--danger)' : 'var(--accent-teal)', fontFamily: 'monospace', marginTop: '2px' }}>
                  {sessionTimer}
                </div>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              The life expectancy of the gateway Bearer session token. Used for UHI transactions, certificates lookup, and sandbox operations.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 'bold', color: sessionExpired ? 'var(--danger)' : 'var(--success)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: sessionExpired ? 'var(--danger)' : 'var(--success)' }}></span>
              <span>{sessionExpired ? 'Inactive / Expired' : 'Active & Verified'}</span>
            </div>
          </article>

          {/* Card 2: Refresh Expiry */}
          <article className="route-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(0, 180, 216, 0.1)', color: 'var(--accent-blue)', display: 'grid', placeItems: 'center' }}>
                <RefreshCw style={{ width: '18px', height: '18px' }} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Gateway Refresh TTL</h4>
                <div style={{ fontSize: '24px', fontWeight: '850', color: refreshExpired ? 'var(--danger)' : 'var(--accent-blue)', fontFamily: 'monospace', marginTop: '2px' }}>
                  {refreshTimer}
                </div>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              The lifecycle of the Gateway refresh token. Used to silently acquire fresh session access tokens without asking for client credentials.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 'bold', color: refreshExpired ? 'var(--danger)' : 'var(--success)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: refreshExpired ? 'var(--danger)' : 'var(--success)' }}></span>
              <span>{refreshExpired ? 'Inactive / Expired' : 'Active & Verified'}</span>
            </div>
          </article>

          {/* Card 3: X-Token Expiry */}
          <article className="route-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(0, 212, 170, 0.1)', color: 'var(--accent-teal)', display: 'grid', placeItems: 'center' }}>
                <ShieldCheck style={{ width: '18px', height: '18px' }} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Demographics X-Token TTL</h4>
                <div style={{ fontSize: '24px', fontWeight: '850', color: xTokenExpired ? 'var(--danger)' : 'var(--accent-teal)', fontFamily: 'monospace', marginTop: '2px' }}>
                  {xTokenTimer}
                </div>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              The patient profile validation token life. Necessary to update mobile number, fetch profiles, request verification links, or download ABHA card.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 'bold', color: xTokenExpired ? 'var(--danger)' : 'var(--success)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: xTokenExpired ? 'var(--danger)' : 'var(--success)' }}></span>
              <span>{xTokenExpired ? 'Not Active / Expired' : 'Authenticated Profile'}</span>
            </div>
          </article>

          {/* Card 4: Encryption Key Expiry */}
          <article className="route-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(0, 180, 216, 0.1)', color: 'var(--accent-blue)', display: 'grid', placeItems: 'center' }}>
                <Key style={{ width: '18px', height: '18px' }} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Encryption Key TTL</h4>
                <div style={{ fontSize: '18px', fontWeight: '850', color: keyExpired ? 'var(--danger)' : 'var(--accent-blue)', fontFamily: 'monospace', marginTop: '6px' }}>
                  {keyTimer}
                </div>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              The validity of the cached RSA public key fetched from gateway `/cert` node. Used for secure RSA-OAEP payload parameters encryption.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 'bold', color: keyExpired ? 'var(--danger)' : 'var(--success)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: keyExpired ? 'var(--danger)' : 'var(--success)' }}></span>
              <span>{keyExpired ? 'Key Expired' : 'Valid Encryption Key'}</span>
            </div>
          </article>

        </div>

        {/* Explanatory Notice */}
        <div style={{
          display: 'flex',
          gap: '12px',
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1.5px dashed var(--border-color)',
          borderRadius: '16px',
          alignItems: 'flex-start'
        }}>
          <Info style={{ color: 'var(--accent-teal)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)' }}>Sandbox Security Information</h4>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              These timeouts represent the token expiration fields returned by NHA Gateway. Under production rules, access tokens automatically self-renew before expiry. This diagnostics dashboard helps system integrators troubleshoot communication errors.
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
