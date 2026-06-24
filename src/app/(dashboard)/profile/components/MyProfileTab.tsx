/**
 * @file        MyProfileTab.tsx
 * @description Renders the 'My Profile' tab containing the realistic ABHA Card layout and demographic details.
 * @module      profile/components
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-24
 */

import React from 'react';
import { Download, Printer, CreditCard, Share2, Pencil, Copy, ChevronDown, ChevronRight, Check } from 'lucide-react';
import Badge from '../../../../components/common/Badge';

interface MyProfileTabProps {
  abhaProfile: any;
  currentUser: any;
  t: (key: string) => string;
  isDemographicsExpanded: boolean;
  setIsDemographicsExpanded: (expanded: boolean) => void;
  getPhotoSrc: (photo: string | undefined) => string;
  getGenderDisplay: (gender: string | undefined) => string;
  copyToClipboard: (text: string, fieldName: string) => void;
  handleDownloadCard: () => void;
  handlePrintCard: () => void;
  handleShareCard: () => void;
  triggerPhotoSelect: () => void;
  triggerMobileEdit: () => void;
  setActiveModal: (modal: string | null) => void;
}

/**
 * Renders the My Profile tab including the premium realistic ABHA Card
 * and collapsible demographic fields.
 */
export const MyProfileTab: React.FC<MyProfileTabProps> = ({
  abhaProfile,
  currentUser,
  t,
  isDemographicsExpanded,
  setIsDemographicsExpanded,
  getPhotoSrc,
  getGenderDisplay,
  copyToClipboard,
  handleDownloadCard,
  handlePrintCard,
  handleShareCard,
  triggerPhotoSelect,
  triggerMobileEdit,
  setActiveModal,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', width: '100%' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .profile-layout-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          width: 100%;
          max-width: 680px;
          margin-bottom: 8px;
        }
        .profile-actions-stack {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 12px 24px;
          width: 100%;
          margin-top: 12px;
        }
        .profile-welcome-links {
          display: flex !important;
          gap: 16px !important;
          flex-wrap: nowrap !important;
          align-items: center !important;
        }
        .profile-welcome-links button {
          display: inline-flex !important;
          align-items: center !important;
          gap: 6px !important;
          background: none !important;
          border: none !important;
          padding: 4px 0 !important;
          color: #c2410c !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          cursor: pointer !important;
          white-space: nowrap !important;
        }
        @media (max-width: 480px) {
          .profile-welcome-row {
            flex-direction: row !important;
            flex-wrap: nowrap !important;
            justify-content: space-between !important;
            align-items: center !important;
            gap: 8px !important;
          }
          .profile-welcome-row h1 {
            font-size: 14px !important;
          }
          .profile-welcome-links {
            gap: 8px !important;
          }
          .profile-welcome-links button span {
            display: none !important;
          }
          .profile-welcome-links button {
            padding: 8px !important;
            background: rgba(194, 65, 12, 0.08) !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
        }
      `}} />

      <div className="profile-layout-container">
        {/* Welcome Header & Actions Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: '580px',
          marginBottom: '4px',
          padding: '0 4px',
          flexWrap: 'wrap',
          gap: '8px'
        }} className="profile-welcome-row">
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
            Welcome, {abhaProfile.name || [abhaProfile.firstName, abhaProfile.middleName, abhaProfile.lastName].filter(Boolean).join(' ') || currentUser?.name || "Ashish Patel"}
          </h1>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }} className="profile-welcome-links">
            <button
              onClick={handleDownloadCard}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px 0',
                color: '#c2410c',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              <Download style={{ width: '15px', height: '15px', color: '#c2410c' }} />
              <span>Download</span>
            </button>
            <button
              onClick={handlePrintCard}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px 0',
                color: '#c2410c',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              <Printer style={{ width: '15px', height: '15px', color: '#c2410c' }} />
              <span>Print</span>
            </button>
            <button
              onClick={() => setActiveModal('print_pvc')}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px 0',
                color: '#c2410c',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              <CreditCard style={{ width: '15px', height: '15px', color: '#c2410c' }} />
              <span>Print PVC</span>
            </button>
            <button
              onClick={handleShareCard}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px 0',
                color: '#c2410c',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              <Share2 style={{ width: '15px', height: '15px', color: '#c2410c' }} />
              <span>Share</span>
            </button>
          </div>
        </div>
        
        <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <article 
            id="abha-card-capture-profile"
            className="setu-abha-card" 
            style={{ 
              width: '100%',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid #cbd5e1',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
              fontFamily: "'Inter', sans-serif",
              flexShrink: 0
            }}
          >
            <div 
              className="setu-abha-card-header" 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                background: '#264488', 
                borderBottom: '2px solid #10b981' 
              }}
            >
              <div style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <img
                  src="/assets/svg/nha.svg"
                  alt="NHA Logo"
                  className="setu-abha-card-nha-img"
                  style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
                />
              </div>
              <div style={{ textAlign: 'center', color: '#ffffff', flex: 1, padding: '0 6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span className="setu-abha-card-header-title" style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '0.3px', textTransform: 'uppercase' }}>Ayushman Bharat Health Account</span>
                <span className="setu-abha-card-header-subtitle" style={{ fontSize: '11px', opacity: 0.9, fontWeight: 600 }}>आयुष्मान भारत स्वास्थ्य खाता (आभा)</span>
              </div>
              <div style={{ height: '56px', width: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRadius: '50%', border: '1px solid #cbd5e1', overflow: 'hidden', background: '#ffffff' }} className="setu-abha-card-abdm-wrapper">
                <img
                  src="/assets/svg/abdm1.svg"
                  alt="ABDM Logo"
                  style={{ height: '100%', width: '100%', objectFit: 'contain' }}
                />
              </div>
            </div>
            
            <div 
              className="setu-abha-card-body" 
              style={{ 
                position: 'relative', 
                display: 'flex', 
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'stretch',
                background: 'radial-gradient(circle, #ffffff 0%, #f1f5f9 100%)', 
                color: '#0f172a' 
              }}
            >
              <div className="setu-abha-card-avatar-wrapper" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', position: 'relative' }}>
                <div 
                  className="setu-abha-card-avatar" 
                  style={{ 
                    borderRadius: '6px', 
                    overflow: 'visible', 
                    border: '1px solid #94a3b8', 
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                  onClick={triggerPhotoSelect}
                >
                  <img
                    src={getPhotoSrc(abhaProfile.photo || abhaProfile.profilePhoto || currentUser?.photo)}
                    alt={abhaProfile.name || abhaProfile.firstName || 'ABHA User'}
                    style={{ width: '100%', height: '100%', borderRadius: '6px', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=150';
                    }}
                  />
                  {/* Always visible small edit badge */}
                  <div 
                    style={{ 
                      position: 'absolute', 
                      bottom: '-4px', 
                      right: '-4px', 
                      background: '#10b981', 
                      borderRadius: '50%', 
                      width: '20px', 
                      height: '20px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      border: '1.5px solid #ffffff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                      zIndex: 10
                    }}
                  >
                    <Pencil style={{ width: '10px', height: '10px', color: '#ffffff' }} />
                  </div>
                </div>
              </div>
              
              <div className="setu-abha-card-details" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'left', minWidth: 0 }}>
                <div className="setu-abha-card-field">
                  <span className="setu-abha-card-label" style={{ color: '#64748b', display: 'block', fontWeight: 700 }}>Name / नाम</span>
                  <strong className="setu-abha-card-value" style={{ color: '#0f172a', fontWeight: '800', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {abhaProfile.name ||
                      [abhaProfile.firstName, abhaProfile.middleName, abhaProfile.lastName].filter(Boolean).join(' ') ||
                      currentUser?.name}
                  </strong>
                </div>
                
                <div className="setu-abha-card-field">
                  <span className="setu-abha-card-label" style={{ color: '#64748b', display: 'block', fontWeight: 700 }}>ABHA Number / आभा संख्या</span>
                  <strong className="setu-abha-card-value token-num" style={{ color: 'var(--accent-blue)', fontFamily: 'monospace', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span>{abhaProfile.ABHANumber || abhaProfile.abhaNumber}</span>
                    <button 
                      onClick={() => copyToClipboard(abhaProfile.ABHANumber || abhaProfile.abhaNumber || '', 'ABHA Number')}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        padding: '2px', 
                        cursor: 'pointer', 
                        display: 'inline-flex', 
                        alignItems: 'center',
                        color: 'var(--text-muted)'
                      }}
                      title="Copy ABHA Number"
                    >
                      <Copy style={{ width: '12px', height: '12px' }} />
                    </button>
                  </strong>
                </div>
                
                <div className="setu-abha-card-field">
                  <span className="setu-abha-card-label" style={{ color: '#64748b', display: 'block', fontWeight: 700 }}>ABHA Address / आभा पता</span>
                  <strong className="setu-abha-card-value token-num" style={{ color: '#0f172a', fontFamily: 'monospace', fontWeight: 700, wordBreak: 'break-all', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span>{abhaProfile.preferredAbhaAddress || abhaProfile.preferredAddress || abhaProfile.abhaAddress || abhaProfile.abhaId || (abhaProfile.phrAddress && abhaProfile.phrAddress.join(", "))}</span>
                    <button 
                      onClick={() => copyToClipboard(abhaProfile.preferredAbhaAddress || abhaProfile.preferredAddress || abhaProfile.abhaAddress || abhaProfile.abhaId || '', 'ABHA Address')}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        padding: '2px', 
                        cursor: 'pointer', 
                        display: 'inline-flex', 
                        alignItems: 'center',
                        color: 'var(--text-muted)'
                      }}
                      title="Copy ABHA Address"
                    >
                      <Copy style={{ width: '12px', height: '12px' }} />
                    </button>
                  </strong>
                </div>
                
                <div className="setu-abha-card-row" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', width: '100%' }}>
                  <div className="setu-abha-card-field" style={{ flex: 1, minWidth: 0 }}>
                    <span className="setu-abha-card-label" style={{ color: '#64748b', display: 'block', fontWeight: 700 }}>Gender / लिंग</span>
                    <span className="setu-abha-card-value setu-abha-card-row-value" style={{ fontWeight: 600 }}>
                      {getGenderDisplay(abhaProfile.gender)}
                    </span>
                  </div>
                  <div className="setu-abha-card-field" style={{ flex: 1, minWidth: 0 }}>
                    <span className="setu-abha-card-label" style={{ color: '#64748b', display: 'block', fontWeight: 700 }}>DOB / जन्म तिथि</span>
                    <span className="setu-abha-card-value setu-abha-card-row-value" style={{ fontWeight: 600 }}>{abhaProfile.dob}</span>
                  </div>
                  <div className="setu-abha-card-field" style={{ flex: 1, minWidth: 0 }}>
                    <span className="setu-abha-card-label" style={{ color: '#64748b', display: 'block', fontWeight: 700 }}>Mobile / मोबाइल</span>
                    <span className="setu-abha-card-value setu-abha-card-row-value" style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span>{abhaProfile.mobile}</span>
                      <button 
                        onClick={triggerMobileEdit}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          padding: '2px', 
                          cursor: 'pointer', 
                          display: 'inline-flex', 
                          alignItems: 'center',
                          color: '#10b981'
                        }}
                        title="Edit Mobile Number"
                      >
                        <Pencil style={{ width: '10px', height: '10px' }} />
                      </button>
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="setu-abha-card-qr-wrapper" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="setu-abha-card-qr" style={{ padding: '4px', background: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify({
                      district_name: (abhaProfile.districtName || "JABALPUR").toUpperCase(),
                      hid: abhaProfile.preferredAbhaAddress || abhaProfile.preferredAddress || abhaProfile.abhaAddress || abhaProfile.abhaId || "medibuddy.9981435702@abdm",
                      address: abhaProfile.address || "1787, Nagpur Road, In Front Of Sai Niwas, Medical, Jabalpur, Jabalpur, Madhya Pradesh",
                      gender: abhaProfile.gender ? (['male', 'm'].includes(abhaProfile.gender.toLowerCase()) ? 'M' : ['female', 'f'].includes(abhaProfile.gender.toLowerCase()) ? 'F' : abhaProfile.gender) : 'M',
                      distlgd: abhaProfile.distLgd || abhaProfile.distlgd || "411",
                      dob: abhaProfile.dob || "24-09-1992",
                      name: abhaProfile.name || [abhaProfile.firstName, abhaProfile.middleName, abhaProfile.lastName].filter(Boolean).join(' ') || currentUser?.name || "Ashish Patel",
                      mobile: abhaProfile.mobile || "9981435702",
                      statelgd: abhaProfile.stateLgd || abhaProfile.statelgd || "23",
                      hidn: abhaProfile.ABHANumber || abhaProfile.abhaNumber || "91-6005-4602-2077",
                      "state name": (abhaProfile.stateName || "MADHYA PRADESH").toUpperCase()
                    }))}`}
                    alt="ABHA QR"
                    className="setu-abha-card-qr-img"
                    style={{ display: 'block' }}
                  />
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* Collapsible Demographics Card */}
      <div 
        style={{ 
          width: '100%', 
          maxWidth: '680px', 
          background: 'var(--bg-secondary)', 
          borderRadius: '12px', 
          border: '1px solid var(--border-color)', 
          overflow: 'hidden'
        }}
      >
        <button
          onClick={() => setIsDemographicsExpanded(!isDemographicsExpanded)}
          style={{
            width: '100%',
            padding: '14px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            color: 'var(--text-primary)'
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isDemographicsExpanded ? (
              <ChevronDown style={{ width: '14px', height: '14px', color: 'var(--accent-teal)' }} />
            ) : (
              <ChevronRight style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
            )}
            <span>{t('Demographic Details')}</span>
          </span>

          {/* ABHA Status Active badge if active */}
          {(abhaProfile.abhaStatus === 'ACTIVE' || abhaProfile.status === 'ACTIVE' || abhaProfile.abhaStatus === undefined) && (
            <Badge variant="success" icon={<Check style={{ width: '10px', height: '10px' }} />}>
              {t('ACTIVE')}
            </Badge>
          )}
        </button>

        {isDemographicsExpanded && (
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '12px', 
              padding: '0 16px 16px 16px', 
              fontSize: '11px', 
              textAlign: 'left', 
              borderTop: '1px solid var(--border-color)',
              paddingTop: '16px'
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>{t('Mobile Number')}</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{abhaProfile.mobile || 'N/A'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>{t('Email Address')}</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{abhaProfile.email || 'Not verified'}</span>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>{t('Street Address')}</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{abhaProfile.address || 'N/A'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>{t('District & State')}</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{(abhaProfile.districtName || abhaProfile.district) || 'N/A'}, {(abhaProfile.stateName || abhaProfile.state) || 'N/A'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>{t('Pin Code')}</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{abhaProfile.pinCode || 'N/A'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
