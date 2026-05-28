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

  if (!activeToken || timeLeft <= 0) return null;

  const mins = Math.floor(timeLeft / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000).toString().padStart(2, '0');

  return (
    <div id="active-token-banner-container">
      <div className="active-token-banner">
        <div className="banner-main-row">
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
