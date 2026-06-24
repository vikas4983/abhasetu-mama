/**
 * @file        GetProfileDetailsTab.tsx
 * @description Renders the 'Get Profile Details' tab which includes the 3D flipping card and the compact profile details grid.
 * @module      profile/components
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-24
 */

import React from 'react';
import { RefreshCw, AlertCircle, Copy } from 'lucide-react';
import { AbdmProfile } from '../page';

interface GetProfileDetailsTabProps {
  profileDetails: { status: string; data: AbdmProfile } | null;
  profileDetailsLoading: boolean;
  profileDetailsError: string | null;
  fetchProfileDetails: () => Promise<void>;
  isFlipped: boolean;
  setIsFlipped: (flipped: boolean) => void;
  copyToClipboard: (text: string, fieldName: string) => void;
  getDobString: (profileData: Partial<AbdmProfile> | undefined) => string;
  t: (key: string) => string;
}

/**
 * Component for displaying the live sync card with 3D Y-rotation and localized details list.
 */
export const GetProfileDetailsTab: React.FC<GetProfileDetailsTabProps> = ({
  profileDetails,
  profileDetailsLoading,
  profileDetailsError,
  fetchProfileDetails,
  isFlipped,
  setIsFlipped,
  copyToClipboard,
  getDobString,
  t,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', width: '100%' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .dual-cards-container {
          display: flex;
          flex-direction: row;
          gap: 20px;
          width: 100%;
          justify-content: center;
          flex-wrap: wrap;
        }
        @media (max-width: 991px) {
          .dual-cards-container {
            flex-direction: column !important;
            align-items: center !important;
          }
        }
        .metadata-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 8px 16px;
        }
        /* CSS for Flipping Card */
        .flip-card {
          background-color: transparent;
          width: 100%;
          max-width: 580px;
          height: 270px;
          perspective: 1500px;
          cursor: pointer;
          user-select: none;
          transform-style: preserve-3d;
          -webkit-transform-style: preserve-3d;
        }
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
          -webkit-transform-style: preserve-3d;
          border-radius: 16px;
          will-change: transform;
        }
        .flip-card.flipped .flip-card-inner {
          transform: rotateY(180deg);
        }
        .flip-card-front, .flip-card-back {
          position: absolute !important;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden !important;
          backface-visibility: hidden !important;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1) !important;
          will-change: transform;
          transform: translate3d(0, 0, 0);
          -webkit-transform: translate3d(0, 0, 0);
        }
        /* Prevent visual bleed-through of high z-index overlay on the back of the card */
        .flip-card-front::after, .flip-card-back::after {
          -webkit-backface-visibility: hidden !important;
          backface-visibility: hidden !important;
        }
        .flip-card-back {
          transform: rotateY(180deg) translate3d(0, 0, 0) !important;
          -webkit-transform: rotateY(180deg) translate3d(0, 0, 0) !important;
        }
        .flip-card-hint {
          font-size: 11px;
          color: var(--text-muted);
          text-align: center;
          display: block;
          margin-top: 6px;
          font-weight: 500;
        }
      `}} />

      {/* Header with refresh controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {t('ABHA Profile Details')}
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: 'var(--text-muted)' }}>
            {t('Verified live details from Ayushman Bharat Digital Mission (ABDM)')}
          </p>
        </div>
        <button
          onClick={fetchProfileDetails}
          disabled={profileDetailsLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: 'var(--accent-teal)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
            opacity: profileDetailsLoading ? 0.6 : 1,
            transition: 'all 0.15s ease'
          }}
        >
          <RefreshCw style={{ width: '14px', height: '14px', animation: profileDetailsLoading ? 'spin 1s linear infinite' : 'none' }} />
          <span>{profileDetailsLoading ? t('Refreshing...') : t('Refresh Details')}</span>
        </button>
      </div>

      {profileDetailsLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: '12px', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', width: '100%' }}>
          <RefreshCw style={{ width: '32px', height: '32px', color: 'var(--accent-teal)', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>{t('Fetching secure profile data from ABDM...')}</p>
        </div>
      )}

      {profileDetailsError && !profileDetailsLoading && (
        <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid #ef4444', borderRadius: '16px', padding: '20px', color: '#ef4444', display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle style={{ width: '20px', height: '20px' }} />
            <strong style={{ fontSize: '14px' }}>{t('Failed to fetch details')}</strong>
          </div>
          <p style={{ fontSize: '13px', margin: 0 }}>{profileDetailsError}</p>
          <button
            onClick={fetchProfileDetails}
            style={{
              alignSelf: 'flex-start',
              padding: '8px 16px',
              background: '#ef4444',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontWeight: 700,
              fontSize: '12.5px',
              cursor: 'pointer'
            }}
          >
            {t('Try Again')}
          </button>
        </div>
      )}

      {profileDetails && !profileDetailsLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', alignItems: 'center' }}>
          
          {/* Flipping Card Container */}
          <div 
            className={`flip-card ${isFlipped ? 'flipped' : ''}`}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className="flip-card-inner">
              
              {/* FRONT SIDE: Localized/Native Card */}
              <div className="setu-abha-card flip-card-front" style={{ minHeight: 'auto' }}>
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
                        position: 'relative'
                      }}
                    >
                      <img
                        src={profileDetails.data?.profilePhoto ? (profileDetails.data.profilePhoto.startsWith('data:') ? profileDetails.data.profilePhoto : `data:image/jpeg;base64,${profileDetails.data.profilePhoto}`) : 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=150'} 
                        alt="Profile Photo" 
                        style={{ width: '100%', height: '100%', borderRadius: '6px', objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=150';
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="setu-abha-card-details" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'left', minWidth: 0 }}>
                    <div className="setu-abha-card-field">
                      <span className="setu-abha-card-label" style={{ color: '#64748b', display: 'block', fontWeight: 700 }}>{profileDetails.data?.localizedDetails?.localizedLabels?.name || 'नाव'}</span>
                      <strong className="setu-abha-card-value" style={{ color: '#0f172a', fontWeight: '800', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {profileDetails.data?.localizedDetails?.name || 'N/A'}
                      </strong>
                    </div>
                    
                    <div className="setu-abha-card-field">
                      <span className="setu-abha-card-label" style={{ color: '#64748b', display: 'block', fontWeight: 700 }}>{profileDetails.data?.localizedDetails?.localizedLabels?.abhaNumber || 'आभा संख्या'}</span>
                      <strong className="setu-abha-card-value token-num" style={{ color: 'var(--accent-blue)', fontFamily: 'monospace', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span>{profileDetails.data?.ABHANumber}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); copyToClipboard(profileDetails.data?.ABHANumber || '', 'ABHA Number'); }}
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
                      <span className="setu-abha-card-label" style={{ color: '#64748b', display: 'block', fontWeight: 700 }}>{profileDetails.data?.localizedDetails?.localizedLabels?.abhaAddress || 'आभा पता'}</span>
                      <strong className="setu-abha-card-value token-num" style={{ color: '#0f172a', fontFamily: 'monospace', fontWeight: 700, wordBreak: 'break-all', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span>{profileDetails.data?.preferredAbhaAddress}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); copyToClipboard(profileDetails.data?.preferredAbhaAddress || '', 'ABHA Address'); }}
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
                        <span className="setu-abha-card-label" style={{ color: '#64748b', display: 'block', fontWeight: 700 }}>{profileDetails.data?.localizedDetails?.localizedLabels?.gender || 'लिंग'}</span>
                        <span className="setu-abha-card-value setu-abha-card-row-value" style={{ fontWeight: 600 }}>
                          {profileDetails.data?.localizedDetails?.gender || 'N/A'}
                        </span>
                      </div>
                      <div className="setu-abha-card-field" style={{ flex: 1, minWidth: 0 }}>
                        <span className="setu-abha-card-label" style={{ color: '#64748b', display: 'block', fontWeight: 700 }}>{profileDetails.data?.localizedDetails?.localizedLabels?.dob || 'जन्म तिथि'}</span>
                        <span className="setu-abha-card-value setu-abha-card-row-value" style={{ fontWeight: 600 }}>{getDobString(profileDetails.data)}</span>
                      </div>
                      <div className="setu-abha-card-field" style={{ flex: 1, minWidth: 0 }}>
                        <span className="setu-abha-card-label" style={{ color: '#64748b', display: 'block', fontWeight: 700 }}>{profileDetails.data?.localizedDetails?.localizedLabels?.mobile || 'मोबाइल'}</span>
                        <span className="setu-abha-card-value setu-abha-card-row-value" style={{ fontWeight: 600 }}>{profileDetails.data?.mobile || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="setu-abha-card-qr-wrapper" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="setu-abha-card-qr" style={{ padding: '4px', background: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify({
                          district_name: (profileDetails.data.districtName || "JABALPUR").toUpperCase(),
                          hid: profileDetails.data.preferredAbhaAddress || "username1997@sbx",
                          address: profileDetails.data.address || "N/A",
                          gender: profileDetails.data.gender ? (['male', 'm'].includes(profileDetails.data.gender.toLowerCase()) ? 'M' : ['female', 'f'].includes(profileDetails.data.gender.toLowerCase()) ? 'F' : profileDetails.data.gender) : 'M',
                          distlgd: profileDetails.data.districtCode || "411",
                          dob: getDobString(profileDetails.data),
                          name: profileDetails.data.name || [profileDetails.data.firstName, profileDetails.data.middleName, profileDetails.data.lastName].filter(Boolean).join(' '),
                          mobile: profileDetails.data.mobile || "N/A",
                          statelgd: profileDetails.data.stateCode || "23",
                          hidn: profileDetails.data.ABHANumber,
                          "state name": (profileDetails.data.stateName || "MADHYA PRADESH").toUpperCase()
                        }))}`}
                        alt="ABHA QR"
                        className="setu-abha-card-qr-img"
                        style={{ display: 'block' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* BACK SIDE: English Card */}
              <div className="setu-abha-card flip-card-back" style={{ minHeight: 'auto' }}>
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
                    <span className="setu-abha-card-header-subtitle" style={{ fontSize: '11px', opacity: 0.9, fontWeight: 600 }}>AYUSHMAN BHARAT HEALTH ACCOUNT (ABHA)</span>
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
                        position: 'relative'
                      }}
                    >
                      <img
                        src={profileDetails.data?.kycPhoto ? (profileDetails.data.kycPhoto.startsWith('data:') ? profileDetails.data.kycPhoto : `data:image/jpeg;base64,${profileDetails.data.kycPhoto}`) : 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=150'} 
                        alt="KYC Photo" 
                        style={{ width: '100%', height: '100%', borderRadius: '6px', objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=150';
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="setu-abha-card-details" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'left', minWidth: 0 }}>
                    <div className="setu-abha-card-field">
                      <span className="setu-abha-card-label" style={{ color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Name</span>
                      <strong className="setu-abha-card-value" style={{ color: '#0f172a', fontWeight: '800', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {profileDetails.data?.name || [profileDetails.data?.firstName, profileDetails.data?.middleName, profileDetails.data?.lastName].filter(Boolean).join(' ')}
                      </strong>
                    </div>
                    
                    <div className="setu-abha-card-field">
                      <span className="setu-abha-card-label" style={{ color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>ABHA Number</span>
                      <strong className="setu-abha-card-value token-num" style={{ color: 'var(--accent-blue)', fontFamily: 'monospace', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span>{profileDetails.data?.ABHANumber}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); copyToClipboard(profileDetails.data?.ABHANumber || '', 'ABHA Number'); }}
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
                      <span className="setu-abha-card-label" style={{ color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>ABHA Address</span>
                      <strong className="setu-abha-card-value token-num" style={{ color: '#0f172a', fontFamily: 'monospace', fontWeight: 700, wordBreak: 'break-all', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span>{profileDetails.data?.preferredAbhaAddress}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); copyToClipboard(profileDetails.data?.preferredAbhaAddress || '', 'ABHA Address'); }}
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
                        <span className="setu-abha-card-label" style={{ color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Gender</span>
                        <span className="setu-abha-card-value setu-abha-card-row-value" style={{ fontWeight: 600 }}>
                          {profileDetails.data?.gender === 'M' ? 'Male' : profileDetails.data?.gender === 'F' ? 'Female' : profileDetails.data?.gender || 'N/A'}
                        </span>
                      </div>
                      <div className="setu-abha-card-field" style={{ flex: 1, minWidth: 0 }}>
                        <span className="setu-abha-card-label" style={{ color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Date of Birth</span>
                        <span className="setu-abha-card-value setu-abha-card-row-value" style={{ fontWeight: 600 }}>{getDobString(profileDetails.data)}</span>
                      </div>
                      <div className="setu-abha-card-field" style={{ flex: 1, minWidth: 0 }}>
                        <span className="setu-abha-card-label" style={{ color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Mobile</span>
                        <span className="setu-abha-card-value setu-abha-card-row-value" style={{ fontWeight: 600 }}>{profileDetails.data?.mobile || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="setu-abha-card-qr-wrapper" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="setu-abha-card-qr" style={{ padding: '4px', background: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify({
                          district_name: (profileDetails.data.districtName || "JABALPUR").toUpperCase(),
                          hid: profileDetails.data.preferredAbhaAddress || "username1997@sbx",
                          address: profileDetails.data.address || "N/A",
                          gender: profileDetails.data.gender ? (['male', 'm'].includes(profileDetails.data.gender.toLowerCase()) ? 'M' : ['female', 'f'].includes(profileDetails.data.gender.toLowerCase()) ? 'F' : profileDetails.data.gender) : 'M',
                          distlgd: profileDetails.data.districtCode || "411",
                          dob: getDobString(profileDetails.data),
                          name: profileDetails.data.name || [profileDetails.data.firstName, profileDetails.data.middleName, profileDetails.data.lastName].filter(Boolean).join(' '),
                          mobile: profileDetails.data.mobile || "N/A",
                          statelgd: profileDetails.data.stateCode || "23",
                          hidn: profileDetails.data.ABHANumber,
                          "state name": (profileDetails.data.stateName || "MADHYA PRADESH").toUpperCase()
                        }))}`}
                        alt="ABHA QR"
                        className="setu-abha-card-qr-img"
                        style={{ display: 'block' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
          <span className="flip-card-hint">
            {isFlipped ? t('Showing English card (Click card to flip to Native language card)') : t('Showing Native language card (Click card to flip to English card)')}
          </span>

          {/* Other Details Card Below ABHA Card */}
          <div style={{
            width: '100%',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '12px 16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            textAlign: 'left',
            marginTop: '8px'
          }}>
            <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
              {t('Profile Information Details')}
            </h3>
            
            <div className="metadata-grid">
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>{t('Verification Status')}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  {profileDetails.data?.verificationStatus === 'VERIFIED' ? (
                    <img src="/assets/check_icon.png" alt="Verified" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
                  ) : (
                    profileDetails.data?.verificationStatus || 'N/A'
                  )}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>{t('Verification Type')}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '11.5px', display: 'block', marginTop: '2px' }}>
                  {profileDetails.data?.verificationType === 'AADHAAR' ? 'AADHAAR / आधार' : (profileDetails.data?.verificationType || 'N/A')}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>{t('KYC Verified')}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  {profileDetails.data?.kycVerified ? (
                    <img src="/assets/check_icon.png" alt="Verified" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
                  ) : t('NO')}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>{t('Mobile Number')}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '11.5px', display: 'block', marginTop: '2px' }}>
                  {profileDetails.data?.mobile || 'N/A'}
                </span>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>{t('Full Address')}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '11.5px', display: 'block', lineHeight: 1.4, marginTop: '2px' }}>
                  <span style={{ display: 'block', fontWeight: 700 }}>{profileDetails.data?.address || 'N/A'}</span>
                  {profileDetails.data?.localizedDetails && (
                    <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '10.5px', fontStyle: 'italic', marginTop: '1px', fontWeight: 500 }}>
                      {[profileDetails.data?.localizedDetails?.villageName || profileDetails.data?.localizedDetails?.townName, profileDetails.data?.localizedDetails?.wardName, profileDetails.data?.localizedDetails?.districtName, profileDetails.data?.localizedDetails?.stateName].filter(Boolean).join(', ')}
                    </span>
                  )}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>{t('District & Subdistrict')}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '11.5px', display: 'block', marginTop: '2px' }}>
                  <span style={{ display: 'block' }}>{profileDetails.data?.districtName || 'N/A'} {profileDetails.data?.subdistrictName ? `(${profileDetails.data.subdistrictName})` : ''}</span>
                  {profileDetails.data?.localizedDetails?.districtName && (
                    <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '10.5px', marginTop: '1px' }}>
                      {profileDetails.data?.localizedDetails?.districtName}
                    </span>
                  )}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>{t('State Name')}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '11.5px', display: 'block', marginTop: '2px' }}>
                  <span style={{ display: 'block' }}>{profileDetails.data?.stateName || 'N/A'}</span>
                  {profileDetails.data?.localizedDetails?.stateName && (
                    <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '10.5px', marginTop: '1px' }}>
                      {profileDetails.data?.localizedDetails?.stateName}
                    </span>
                  )}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>{t('Pin Code')}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '11.5px', display: 'block', marginTop: '2px' }}>
                  {profileDetails.data?.pincode || 'N/A'}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>{t('Account Status')}</span>
                <span style={{ fontWeight: 700, color: profileDetails.data?.status === 'ACTIVE' ? 'var(--accent-teal)' : 'var(--text-primary)', fontSize: '11.5px', display: 'block', marginTop: '2px' }}>
                  {profileDetails.data?.status || 'N/A'}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>{t('Created Date')}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '11.5px', display: 'block', marginTop: '2px' }}>
                  {profileDetails.data?.createdDate || 'N/A'}
                </span>
              </div>
            </div>

            {/* Verification Photos Section */}
            <div style={{ marginTop: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                {t('ABHA Verification Photos')}
              </span>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '4px 8px 4px 4px' }}>
                  <div style={{ width: '40px', height: '50px', borderRadius: '4px', border: '1px solid var(--border-color)', overflow: 'hidden', flexShrink: 0 }}>
                    <img 
                      src={profileDetails.data?.profilePhoto ? (profileDetails.data.profilePhoto.startsWith('data:') ? profileDetails.data.profilePhoto : `data:image/jpeg;base64,${profileDetails.data.profilePhoto}`) : 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=150'} 
                      alt="Profile Photo" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '8.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{t('Profile Photo')}</span>
                    <span style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-primary)' }}>{t('ABHA Photo')}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '4px 8px 4px 4px' }}>
                  <div style={{ width: '40px', height: '50px', borderRadius: '4px', border: '1px solid var(--border-color)', overflow: 'hidden', flexShrink: 0 }}>
                    <img 
                      src={profileDetails.data?.kycPhoto ? (profileDetails.data.kycPhoto.startsWith('data:') ? profileDetails.data.kycPhoto : `data:image/jpeg;base64,${profileDetails.data.kycPhoto}`) : 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=150'} 
                      alt="KYC Photo" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '8.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{t('KYC Photo')}</span>
                    <span style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-primary)' }}>{t('Aadhaar Photo')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                {t('Available Authentication Methods')}
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {profileDetails.data?.authMethods?.map((method: string) => (
                  <span
                    key={method}
                    style={{
                      padding: '2.5px 6px',
                      background: 'rgba(20, 184, 166, 0.06)',
                      border: '1px solid rgba(20, 184, 166, 0.3)',
                      borderRadius: '6px',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      color: 'var(--accent-teal)'
                    }}
                  >
                    {method}
                  </span>
                )) || <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{t('None')}</span>}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
