'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';
import { useLanguage } from '../../providers/LanguageProvider';
import { showToast } from '../../utils/toast';

export default function ActiveTokenBanner() {
  const { activeToken, setActiveToken, logSecurityEvent } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    // Reset dismissal status when activeToken changes
    setDismissed(false);
  }, [activeToken]);

  useEffect(() => {
    if (!activeToken) return;

    const calculateTime = () => {
      const diff = activeToken.expiresAt - Date.now();
      if (diff <= 0) {
        setActiveToken(null);
        showToast(t('OPD Check-in Token has expired.'));
        logSecurityEvent('Token Expired', `Token ${activeToken.tokenNum} for ${activeToken.facilityName} expired`);
        return 0;
      }
      return diff;
    };

    // Initial setup
    setTimeLeft(calculateTime());

    const interval = setInterval(() => {
      const nextTime = calculateTime();
      setTimeLeft(nextTime);
      if (nextTime <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeToken, setActiveToken, logSecurityEvent, t]);

  if (!activeToken || timeLeft <= 0 || dismissed) return null;

  const mins = Math.floor(timeLeft / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000).toString().padStart(2, '0');

  return (
    <div id="active-token-banner-container" className="animate-slide-in">
      <div className="active-token-banner" style={{ position: 'relative' }}>
        {/* Dismiss Button */}
        <button
          onClick={() => {
            setDismissed(true);
            logSecurityEvent('Token Banner Dismissed', `User closed floating token notification for ${activeToken.tokenNum}`);
          }}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            padding: '4px',
            lineHeight: 1,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '20px',
            height: '20px',
            borderRadius: '50%'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--danger)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
          aria-label="Dismiss Notification"
        >
          &times;
        </button>

        <div className="banner-main-row" style={{ paddingRight: '20px' }}>
          <div className="pulse-dot"></div>
          <div className="banner-info">
            <div className="banner-title">
              {t('Token')}: <span className="highlight-token">{activeToken.tokenNum}</span>
            </div>
            <div className="banner-subtitle">{activeToken.facilityName}</div>
          </div>
        </div>
        <div className="banner-action-row">
          <div className="timer-badge">
            {t('Expires in')} {mins}:{secs}
          </div>
          <button
            className="view-ticket-btn"
            onClick={() => router.push('/appointments')}
          >
            {t('View Ticket')}
          </button>
        </div>
      </div>
    </div>
  );
}

