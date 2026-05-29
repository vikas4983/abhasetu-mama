'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../providers/LanguageProvider';
import { ShieldCheck, Lock, Accessibility, Mail, Phone, MapPin, Plus } from 'lucide-react';

export default function Footer() {
  const router = useRouter();
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  const [selectedLogo, setSelectedLogo] = useState<string>('default');

  useEffect(() => {
    try {
      const state = JSON.parse(localStorage.getItem('setu_state') || '{}');
      if (state.selectedLogo) {
        setSelectedLogo(state.selectedLogo);
      } else {
        setSelectedLogo('default');
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleLinkClick = (e: React.MouseEvent, route: string) => {
    e.preventDefault();
    router.push(route);
  };

  return (
    <footer className="site-footer" aria-label="AbhaSetu footer">
      <div className="footer-brand">
        <div className="footer-logo">
          <div className="logo-icon" style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            display: 'grid', 
            placeItems: 'center', 
            overflow: 'hidden',
            background: selectedLogo !== 'default' ? 'transparent' : 'linear-gradient(135deg, var(--accent-teal), var(--accent-cyan))',
            boxShadow: selectedLogo !== 'default' ? 'none' : '0 12px 28px color-mix(in srgb, var(--accent-teal) 24%, transparent)',
            border: selectedLogo !== 'default' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
            padding: selectedLogo !== 'default' ? '2px' : '0'
          }}>
            {selectedLogo === 'default' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px', color: '#ffffff' }}>
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            ) : (
              <img
                src={selectedLogo}
                alt="Brand Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
              />
            )}
          </div>
          <div>
            <h2>ABHA SETU</h2>
            <p>
              {t('National Digital Health Bridge for ABDM-ready healthcare operations, telemedicine, connected facilities, QR flows, and secure patient journeys.')}
            </p>
          </div>
        </div>
        <div className="footer-trust" aria-label="Compliance readiness">
          <span>
            <ShieldCheck className="small-icon" style={{ width: '14px', height: '14px', marginRight: '4px' }} />
            ABDM Ready
          </span>
          <span>
            <Lock className="small-icon" style={{ width: '14px', height: '14px', marginRight: '4px' }} />
            Consent-first
          </span>
          <span>
            <Accessibility className="small-icon" style={{ width: '14px', height: '14px', marginRight: '4px' }} />
            Accessible
          </span>
        </div>
      </div>
      <div className="footer-grid">
        <section>
          <h3>Platform</h3>
          <a href="#" onClick={(e) => handleLinkClick(e, '/more')}>{t('ABDM Services')}</a>
          <a href="#" onClick={(e) => handleLinkClick(e, '/appointments')}>{t('Telemedicine')}</a>
          <a href="#" onClick={(e) => handleLinkClick(e, '/connected')}>{t('Connected Facilities')}</a>
          <a href="#" onClick={(e) => handleLinkClick(e, '/qr-scanner')}>{t('QR Scanner')}</a>
        </section>
        <section>
          <h3>Operations</h3>
          <a href="#" onClick={(e) => handleLinkClick(e, '/health')}>{t('Health Insights')}</a>
          <a href="#" onClick={(e) => handleLinkClick(e, '/more')}>{t('Compliance')}</a>
          <a href="#" onClick={(e) => handleLinkClick(e, '/security')}>{t('Security Logs')}</a>
          <a href="#" onClick={(e) => handleLinkClick(e, '/settings')}>{t('Settings')}</a>
        </section>
        <section>
          <h3>Company</h3>
          <a href="#" onClick={(e) => handleLinkClick(e, '/about')}>{t('About Us')}</a>
          <a href="#" onClick={(e) => handleLinkClick(e, '/more')}>{t('Contact Support')}</a>
          <a href="#" onClick={(e) => handleLinkClick(e, '/more')}>{t('Terms of Service')}</a>
          <a href="#" onClick={(e) => handleLinkClick(e, '/more')}>{t('Privacy Policy')}</a>
          <a href="#" onClick={(e) => handleLinkClick(e, '/more')}>{t('ABDM Compliance')}</a>
        </section>
        <section>
          <h3>Contact</h3>
          <a href="mailto:contact@abhasetu.com" style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <Mail className="small-icon" style={{ width: '14px', height: '14px', flexShrink: 0, marginRight: '6px' }} />
            contact@abhasetu.com
          </a>
          <a href="tel:+919981057765" style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <Phone className="small-icon" style={{ width: '14px', height: '14px', flexShrink: 0, marginRight: '6px' }} />
            +91-9981057765
          </a>
          <p style={{ display: 'inline-flex', alignItems: 'flex-start' }}>
            <MapPin className="small-icon" style={{ width: '14px', height: '14px', flexShrink: 0, marginRight: '6px', marginTop: '3px' }} />
            <span>Madar Gate, Panchampura, Katangi, Jabalpur, MP 483105</span>
          </p>
        </section>
        <section>
          <h3>Connect</h3>
          <a
            href="https://www.facebook.com/share/1Eb3rV5tPj/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="social-svg facebook-svg" style={{ width: '16px', height: '16px' }}>
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
            Facebook
          </a>
          <a
            href="https://www.instagram.com/abha.setu?igsh=c3oydW13dm44eTJ2"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="social-svg instagram-svg" style={{ width: '16px', height: '16px' }}>
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            Instagram
          </a>
          <a
            href="https://www.linkedin.com/in/abha-setu-37481a410"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="social-svg linkedin-svg" style={{ width: '16px', height: '16px' }}>
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
              <rect x="2" y="9" width="4" height="12"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
            LinkedIn
          </a>
        </section>
      </div>
      <div className="footer-bottom">
        <span>© {year} ABHA SETU. {t('All rights reserved.')}</span>
        <span>
          Healthcare workflows shown in demo mode. Live ABDM use requires approved sandbox or production credentials.
        </span>
      </div>
    </footer>
  );
}
