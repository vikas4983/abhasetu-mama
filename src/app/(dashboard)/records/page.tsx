'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';
import { useLanguage } from '../../../providers/LanguageProvider';
import { FolderLock, ArrowLeft, Upload, ShieldAlert, Sparkles } from 'lucide-react';
import { showToast } from '../../../utils/toast';

export default function RecordsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { records, addRecord, logSecurityEvent } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Trigger high-fidelity shimmering skeleton transition on page mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  const handleFileUpload = () => {
    setIsUploading(true);
    showToast(t('Opening secure record locker upload...'));

    setTimeout(() => {
      const newRecord = {
        name: 'Digital Health Policy Card.pdf',
        type: 'Insurance',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        source: 'Care Shield Plus Gold',
      };
      addRecord(newRecord);
      logSecurityEvent('File Upload', 'Uploaded Digital Health Policy Card.pdf securely');
      showToast(t('Insurance Policy Card uploaded successfully.'));
      setIsUploading(false);
    }, 1500);
  };

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
          <h2>{t('Digital Health Locker')}</h2>
          <p>{t('Interoperable electronic health records vault.')}</p>
        </div>
      </section>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
          {/* Shimmering Upload Zone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
            <article className="route-card" style={{ textAlign: 'center', padding: '32px 24px', border: '1px dashed var(--border-color)', background: 'rgba(0, 212, 170, 0.01)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div className="setu-skeleton setu-skeleton-avatar" style={{ width: '48px', height: '48px' }}></div>
              <div className="setu-skeleton setu-skeleton-title" style={{ width: '220px', height: '16px' }}></div>
              <div className="setu-skeleton setu-skeleton-text" style={{ width: '70%', height: '12px' }}></div>
              <div className="setu-skeleton setu-skeleton-text" style={{ width: '60%', height: '12px', marginBottom: '8px' }}></div>
              <div className="setu-skeleton" style={{ width: '180px', height: '36px', borderRadius: '8px' }}></div>
            </article>
          </div>

          {/* Shimmering Table */}
          <section className="route-card" style={{ padding: '20px', border: '1px solid var(--border-color)' }}>
            <div className="record-table" style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ background: 'var(--bg-secondary)', height: '40px', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                <div className="setu-skeleton" style={{ width: '90%', height: '12px', border: 'none !important' }}></div>
              </div>
              {[1, 2, 3].map((n) => (
                <div key={n} style={{ height: '44px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                  <div className="setu-skeleton" style={{ width: '85%', height: '10px', border: 'none !important' }}></div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <>
          {/* Upload Zone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px', marginBottom: '22px', marginTop: '20px' }}>
            <article className="route-card" style={{ textAlign: 'center', padding: '32px 24px', border: '1px dashed var(--border-color)', background: 'rgba(0, 212, 170, 0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0, 212, 170, 0.1)', color: 'var(--accent-teal)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
                <FolderLock style={{ width: '24px', height: '24px' }} />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px' }}>Linked Electronic Records Locker</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '6px', marginBottom: '20px', lineHeight: '1.6', maxWidth: '460px', marginLeft: 'auto', marginRight: 'auto' }}>
                Upload digital copies, prescriptions, NHA health certificates or insurance files securely under DPDP guidelines.
              </p>
              <button
                className="join-btn"
                onClick={handleFileUpload}
                disabled={isUploading}
                style={{ minWidth: '180px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {isUploading ? (
                  <>
                    <Sparkles className="pulse-dot" style={{ width: '16px', height: '16px', display: 'inline-block' }} />
                    <span>Syncing Record...</span>
                  </>
                ) : (
                  <>
                    <Upload style={{ width: '16px', height: '16px' }} />
                    <span>Upload Record File</span>
                  </>
                )}
              </button>
            </article>
          </div>

          {/* Locker Records Table */}
          <section className="record-table">
            <div className="table-row table-head" style={{ borderBottom: '2px solid var(--border-color)', fontWeight: 700, color: 'var(--text-primary)', paddingBottom: '10px' }}>
              <span>Document Name</span>
              <span>Type</span>
              <span>Date Uploaded</span>
              <span>Verified Provider</span>
            </div>
            {records.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                No health records linked yet. Upload records or sync ABHA card to retrieve clinical documentation.
              </div>
            ) : (
              records.map((record, index) => (
                <div
                  key={index}
                  className="table-row"
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    padding: '14px 6px',
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
                    gap: '12px',
                    fontSize: '13px',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)', wordBreak: 'break-word' }}>{t(record.name)}</span>
                  <span>{t(record.type)}</span>
                  <span>{record.date}</span>
                  <span style={{ color: 'var(--accent-teal)', fontWeight: '600' }}>{t(record.source)}</span>
                </div>
              ))
            )}
          </section>
        </>
      )}
    </>
  );
}
