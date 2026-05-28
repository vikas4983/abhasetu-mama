'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../providers/LanguageProvider';
import { ShieldCheck, Lock, Accessibility, ArrowLeft, Globe } from 'lucide-react';

export default function AboutPage() {
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
          <p className="eyebrow">ABHA SETU</p>
          <h2>{t('About Platform')}</h2>
          <p>{t('Mission, vision, and educational integrations of the interoperable health ecosystem.')}</p>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginTop: '20px' }}>
        {/* Hero Mission Card */}
        <article className="route-card wide-card about-hero-card" style={{ padding: '32px', position: 'relative', overflow: 'hidden', borderRadius: '16px' }}>
          <div className="tricolor-accent-bar" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div style={{ background: '#FF9933' }}></div>
            <div style={{ background: '#FFFFFF' }}></div>
            <div style={{ background: '#138808' }}></div>
          </div>
          
          <div className="card-title-row" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--accent-teal))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
              The Abha Setu Mission - Powered by IQRA Online School
            </h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '18px', lineHeight: 1.7, fontSize: '14px', color: 'var(--text-secondary)' }}>
            <p style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '15px', borderLeft: '3px solid var(--accent-teal)', paddingLeft: '12px', marginBottom: '8px', marginTop: 0 }}>
              ABHA SETU is a next-generation digital health bridge designed to connect healthcare services with digital empowerment through one unified ecosystem.
            </p>
            <p style={{ margin: 0 }}>
              The platform integrates telemedicine services, digital patient health records, OPD management systems, diagnostics support, and ABDM-ready healthcare infrastructure to deliver a secure, modern, and patient-centric healthcare experience.
            </p>
            <p style={{ margin: 0 }}>
              Developed under the educational and skill-development vision of <strong>IQRA Online School</strong>, ABHA SETU serves as an integrated digital health initiative focused on bridging healthcare, technology, and professional skill development.
            </p>
          </div>
        </article>

        {/* NSDC Course Highlight Card */}
        <article className="route-card wide-card nsdc-course-card" style={{ padding: '28px', border: '1px dashed rgba(0, 212, 170, 0.4)', background: 'rgba(0, 212, 170, 0.03)', borderRadius: '16px', position: 'relative', overflow: 'visible' }}>
          <div style={{ position: 'absolute', top: '-12px', right: '24px', padding: '4px 12px', borderRadius: '20px', background: 'var(--accent-teal)', color: '#13283b', fontSize: '10px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            NSDC APPROVED SKILL DEVELOPMENT
          </div>
          
          <div className="card-title-row" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>E-Health Services Provider Program</h3>
          </div>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6, marginBottom: '20px', marginTop: 0 }}>
            As part of this mission, ABHA SETU also promotes the <strong>E-Health Services Provider Program (NSDC Approved Skill Development Course, Code: CO102500052)</strong>, empowering healthcare professionals and students with industry-relevant skills in digital health systems, electronic health record (EHR) management, and interoperable clinical workflows.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: 'rgba(255, 255, 255, 0.02)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>Approved Course Code</span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-teal)' }}>CO102500052</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>Educational Partner</span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>IQRA Online School</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>Curriculum Standard</span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>ABDM & EHR Guidelines</span>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '0.5px', fontWeight: 600, marginTop: 0 }}>Key Training Modules Covered</h4>
            <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--accent-teal)' }}>✓</span> Interoperable EHR Systems & Digital Logs
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--accent-teal)' }}>✓</span> National Health Authority (NHA) Standards
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--accent-teal)' }}>✓</span> Telehealth Telemedicine Operations
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--accent-teal)' }}>✓</span> ABDM Integration & Consent Frameworks
              </li>
            </ul>
          </div>
        </article>

        {/* Grid Highlights */}
        <section className="route-grid two-col" style={{ gap: '20px', display: 'grid' }}>
          <article className="route-card" style={{ padding: '24px', margin: 0 }}>
            <div className="card-title-row" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck className="card-icon" style={{ color: 'var(--accent-teal)' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Unified Digital Health Interface</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.6, margin: 0 }}>
              A complete bridge connecting traditional clinics with interoperable frameworks. Empowering instant consent-based clinical file exchanges under the DPDP Act.
            </p>
          </article>
          <article className="route-card" style={{ padding: '24px', margin: 0 }}>
            <div className="card-title-row" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe className="card-icon" style={{ color: 'var(--accent-cyan)' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>National Skill India Vision</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.6, margin: 0 }}>
              Aligning healthcare infrastructure training with digital growth. Preparing India's healthcare workforce for seamless, paperless hospital patient workflows.
            </p>
          </article>
        </section>
      </div>
    </>
  );
}
