/**
 * @file        AbhaCardBackComponent.tsx
 * @description Printable ABHA card back — instructions (NHA specimen layout)
 * @module      profile/components/common
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-29
 */

import React from 'react';

export interface AbhaCardBackComponentProps {
  id?: string;
  className?: string;
  issuedOn?: string;
  compact?: boolean;
}

export const AbhaCardBackComponent: React.FC<AbhaCardBackComponentProps> = ({
  id,
  className = 'pvc-back-card',
  issuedOn,
  compact = false,
}) => {
  const pad = compact ? '12px' : '16px';
  const headerH = compact ? '56px' : '68px';
  const titleSize = compact ? '9px' : '12px';
  const subSize = compact ? '8px' : '11px';
  const bodyFont = compact ? '7.5px' : '9.5px';
  const hindiFont = compact ? '7px' : '9px';

  return (
    <article
      id={id}
      className={className}
      style={{
        width: '100%',
        maxWidth: '580px',
        minHeight: compact ? '250px' : '270px',
        borderRadius: compact ? '12px' : '16px',
        overflow: 'hidden',
        border: '1px solid #cbd5e1',
        boxShadow: compact ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
        background: 'radial-gradient(circle, #ffffff 0%, #f8fafc 100%)',
        fontFamily: "'Inter', 'Roboto', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}
    >
      <div
        className="setu-abha-card-header printable-abha-card-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#264488',
          borderBottom: '2px solid #00d4aa',
          padding: pad,
          height: headerH,
          boxSizing: 'border-box',
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
        }}
      >
        <div style={{ height: compact ? '32px' : '40px', display: 'flex', alignItems: 'center' }}>
          <img src="/assets/svg/nha.svg" alt="NHA Logo" className="setu-abha-card-nha-img" style={{ height: '100%', width: 'auto' }} />
        </div>
        <div style={{ textAlign: 'center', color: '#fff', flex: 1, padding: '0 6px' }}>
          <span style={{ fontSize: titleSize, fontWeight: 800, letterSpacing: '0.3px', display: 'block' }}>
            Ayushman Bharat Health Account
          </span>
          <span style={{ fontSize: subSize, opacity: 0.9, fontWeight: 600, display: 'block' }}>
            आयुष्मान भारत स्वास्थ्य खाता (आभा)
          </span>
        </div>
        <div
          className="setu-abha-card-abdm-wrapper"
          style={{
            height: compact ? '42px' : '56px',
            width: compact ? '42px' : '56px',
            borderRadius: '50%',
            border: '1px solid #cbd5e1',
            overflow: 'hidden',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img src="/assets/svg/abdm1.svg" alt="ABDM Logo" style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
        </div>
      </div>

      <div
        className="pvc-back-body"
        style={{
          padding: pad,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
          color: '#0f172a',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: compact ? '9px' : '12px', marginBottom: '6px' }}>
          <span>Instructions</span>
          <span>Toll-Free Number: 1800 114 477</span>
        </div>
        <ul className="pvc-instructions" style={{ margin: 0, paddingLeft: '18px', fontSize: bodyFont, lineHeight: 1.4, color: '#334155', listStyleType: 'disc' }}>
          <li style={{ marginBottom: '6px' }}>
            With this ABHA you have become a part of India&apos;s digital health ecosystem.
            <div style={{ color: '#64748b', fontSize: hindiFont, fontWeight: 500 }}>
              इस आभा के साथ आप भारत के डिजिटल हेल्थ इकोसिस्टम का हिस्सा बन गए हैं।
            </div>
          </li>
          <li style={{ marginBottom: '6px' }}>
            ABHA provides you a unique identification and helps in storing - safekeeping all your digital health records at one place.
            <div style={{ color: '#64748b', fontSize: hindiFont, fontWeight: 500 }}>
              आभा आपको एक विशिष्ट पहचान प्रदान करता है और आपके सभी डिजिटल स्वास्थ्य रिकॉर्ड को सुरक्षित एक ही स्थान पर संग्रहीत रखने में मदद करता है।
            </div>
          </li>
          <li style={{ marginBottom: '6px' }}>
            You can download the ABHA mobile app, Aarogya Setu or other ABDM enabled app to view and share your digital health records with ABDM registered healthcare service providers.
            <div style={{ color: '#64748b', fontSize: hindiFont, fontWeight: 500 }}>
              आप एबीडीएम पंजीकृत स्वास्थ्य सेवा प्रदाताओं के साथ अपने डिजिटल स्वास्थ्य रिकॉर्ड देखने और साझा करने के लिए आभा मोबाइल ऐप, आरोग्य सेतु या अन्य एबीडीएम सक्षम ऐप डाउनलोड कर सकते हैं।
            </div>
          </li>
          <li style={{ marginBottom: '6px' }}>
            If this card is lost kindly download it from www.abha.abdm.gov.in, it is digitally acceptable.
            <div style={{ color: '#64748b', fontSize: hindiFont, fontWeight: 500 }}>
              यदि यह कार्ड खो जाता है तो कृपया इसे www.abha.abdm.gov.in से डाउनलोड करें, यह डिजिटल रूप से स्वीकार्य है।
            </div>
          </li>
        </ul>
        <div style={{ width: '100%', marginTop: '6px' }}>
          <hr style={{ border: 'none', borderTop: '1px solid #cbd5e1', margin: '4px 0' }} />
          <div style={{ textAlign: 'center', fontSize: compact ? '8.5px' : '11px', fontWeight: 'bold', color: '#334155' }}>
            Issued on: {issuedOn || '—'}
          </div>
        </div>
      </div>
    </article>
  );
};
