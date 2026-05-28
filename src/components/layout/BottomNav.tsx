'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '../../providers/LanguageProvider';
import { Home, HeartPulse, QrCode, Calendar, Grid3X3 } from 'lucide-react';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();

  const handleNavClick = (e: React.MouseEvent, route: string) => {
    e.preventDefault();
    router.push(route);
  };

  return (
    <nav className="bottom-nav">
      <a
        href="#"
        onClick={(e) => handleNavClick(e, '/')}
        className={`nav-item ${pathname === '/' ? 'active' : ''}`}
      >
        <Home className="nav-icon" style={{ width: '20px', height: '20px' }} />
        <span>{t('Home')}</span>
      </a>

      <a
        href="#"
        onClick={(e) => handleNavClick(e, '/health')}
        className={`nav-item ${pathname === '/health' ? 'active' : ''}`}
      >
        <HeartPulse className="nav-icon" style={{ width: '20px', height: '20px' }} />
        <span>{t('Health')}</span>
      </a>

      <a
        href="#"
        onClick={(e) => handleNavClick(e, '/qr-scanner')}
        className={`nav-item fab-scan ${pathname === '/qr-scanner' ? 'active' : ''}`}
        aria-label={t('Scan ABDM QR')}
      >
        <QrCode style={{ width: '24px', height: '24px', color: '#ffffff' }} />
        <span>{t('Scan')}</span>
      </a>

      <a
        href="#"
        onClick={(e) => handleNavClick(e, '/abha')}
        className={`nav-item ${pathname === '/abha' ? 'active' : ''}`}
      >
        <Calendar className="nav-icon" style={{ width: '20px', height: '20px' }} />
        <span>{t('ABHA')}</span>
      </a>

      <a
        href="#"
        onClick={(e) => handleNavClick(e, '/more')}
        className={`nav-item ${pathname === '/more' ? 'active' : ''}`}
      >
        <Grid3X3 className="nav-icon" style={{ width: '20px', height: '20px' }} />
        <span>{t('More')}</span>
      </a>
    </nav>
  );
}
