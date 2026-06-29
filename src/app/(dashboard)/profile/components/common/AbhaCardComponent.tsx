/**
 * @file        AbhaCardComponent.tsx
 * @description Shared, reusable, and printable ABHA Card Component.
 * @module      profile/components/common
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-24
 * @modified    2026-06-24
 */

import React from 'react';
import { Copy, Pencil } from 'lucide-react';
import { AbhaCardComponentProps } from './AbhaCardComponent.types';

export const AbhaCardComponent: React.FC<AbhaCardComponentProps> = ({
  abhaProfile,
  currentUser,
  getPhotoSrc,
  getGenderDisplay,
  copyToClipboard,
  triggerPhotoSelect,
  triggerMobileEdit,
  isEditable = false,
  isBack = false, // Ignored, always render front side of card
}) => {
  // Helper to resolve profile name
  const getProfileName = () => {
    return (
      abhaProfile.name ||
      [abhaProfile.firstName, abhaProfile.middleName, abhaProfile.lastName].filter(Boolean).join(' ') ||
      currentUser?.name ||
      "Ashish Patel"
    );
  };

  const name = getProfileName();
  const abhaNumber = abhaProfile.ABHANumber || abhaProfile.abhaNumber || "91-3110-0385-0725";
  const abhaAddress =
    abhaProfile.preferredAbhaAddress ||
    abhaProfile.preferredAddress ||
    abhaProfile.abhaAddress ||
    abhaProfile.abhaId ||
    (abhaProfile.phrAddress && abhaProfile.phrAddress.join(', ')) ||
    "91311003850725@sbx";
  const gender = getGenderDisplay ? getGenderDisplay(abhaProfile.gender) : (abhaProfile.gender || "Male");
  const dob = abhaProfile.dob || "24-09-1992";
  const mobile = abhaProfile.mobile || "8770745851";

  // QR Code Payload
  const qrData = JSON.stringify({
    district_name: (abhaProfile.districtName || "JABALPUR").toUpperCase(),
    hid: abhaAddress,
    address: abhaProfile.address || "N/A",
    gender: abhaProfile.gender ? (['male', 'm'].includes(abhaProfile.gender.toLowerCase()) ? 'M' : ['female', 'f'].includes(abhaProfile.gender.toLowerCase()) ? 'F' : abhaProfile.gender) : 'M',
    distlgd: abhaProfile.distLgd || abhaProfile.distlgd || "411",
    dob: dob,
    name: name,
    mobile: mobile,
    statelgd: abhaProfile.stateLgd || abhaProfile.statelgd || "23",
    hidn: abhaNumber,
    "state name": (abhaProfile.stateName || "MADHYA PRADESH").toUpperCase()
  });

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

  // Inline styling definitions to guarantee high-fidelity printed output
  const cardStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: '580px',
    minHeight: '250px',
    margin: '0 auto',
    borderRadius: '16px',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M9 15c.068 0 .135.003.203.009C10.74 15.358 12 16.528 12 18c0 1.657-1.343 3-3 3s-3-1.343-3-3c0-1.472 1.26-2.642 2.797-2.991C8.865 15.003 8.932 15 9 15zm30 0c.068 0 .135.003.203.009C40.74 15.358 42 16.528 42 18c0 1.657-1.343 3-3 3s-3-1.343-3-3c0-1.472 1.26-2.642 2.797-2.991C38.865 15.003 38.932 15 39 15zM9 45c.068 0 .135.003.203.009C10.74 45.358 12 46.528 12 48c0 1.657-1.343 3-3 3s-3-1.343-3-3c0-1.472 1.26-2.642 2.797-2.991C8.865 45.003 8.932 45 9 45zm30 0c.068 0 .135.003.203.009C40.74 45.358 42 48c0 1.657-1.343 3-3 3s-3-1.343-3-3c0-1.472 1.26-2.642 2.797-2.991C38.865 45.003 38.932 45 39 45z' fill='%231f3a60' fill-opacity='0.02' fill-rule='evenodd'/%3E%3C/svg%3E")`,
    border: '1px solid rgba(31, 58, 96, 0.15)',
    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(31, 58, 96, 0.05)',
    fontFamily: "'Inter', 'Roboto', sans-serif",
    color: '#1e293b',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    boxSizing: 'border-box',
    printColorAdjust: 'exact',
    WebkitPrintColorAdjust: 'exact',
  } as React.CSSProperties;

  const headerStyle: React.CSSProperties = {
    background: '#264488',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '2px solid #00d4aa',
    position: 'relative',
    zIndex: 2,
    height: '68px',
    boxSizing: 'border-box',
    printColorAdjust: 'exact',
    WebkitPrintColorAdjust: 'exact',
  } as React.CSSProperties;

  const logoWrapperStyle: React.CSSProperties = {
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const headerTextContainerStyle: React.CSSProperties = {
    textAlign: 'center',
    color: '#ffffff',
    flex: 1,
    padding: '0 6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  };

  const headerTitleStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.3px',
    textTransform: 'uppercase',
  };

  const headerSubtitleStyle: React.CSSProperties = {
    fontSize: '11px',
    opacity: 0.9,
    fontWeight: 600,
  };

  const abdmWrapperStyle: React.CSSProperties = {
    height: '52px',
    width: '52px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRadius: '50%',
    border: '1px solid #cbd5e1',
    overflow: 'hidden',
    background: '#ffffff',
  };

  const bodyStyle: React.CSSProperties = {
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 1,
    background: 'radial-gradient(circle, #ffffff 0%, #f1f5f9 100%)',
    color: '#0f172a',
    flex: 1,
    boxSizing: 'border-box',
    justifyContent: 'space-between',
    printColorAdjust: 'exact',
    WebkitPrintColorAdjust: 'exact',
  } as React.CSSProperties;

  const topRowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    gap: '16px',
    alignItems: 'flex-start',
    width: '100%',
    boxSizing: 'border-box',
  };

  const avatarWrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    flexShrink: 0,
  };

  // Picture made slightly smaller (95px x 120px)
  const avatarStyle: React.CSSProperties = {
    width: '95px',
    height: '120px',
    borderRadius: '8px',
    overflow: 'visible', // Allows edit badge to pop out
    border: '1.5px solid #cbd5e1',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
    background: '#f8fafc',
    position: 'relative',
    cursor: isEditable ? 'pointer' : 'default',
  };

  const editBadgeStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '-4px',
    right: '-4px',
    width: '22px',
    height: '22px',
    background: '#2563eb',
    border: '1px solid #ffffff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    zIndex: 10,
    cursor: 'pointer',
    padding: 0,
  };

  const detailsContainerStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '11px',
    textAlign: 'left',
    minWidth: 0,
  };

  const fieldStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  };

  const labelStyle: React.CSSProperties = {
    color: '#64748b',
    fontSize: '8px',
    fontWeight: 600,
    textTransform: 'none',
    letterSpacing: '0.2px',
    margin: 0,
    whiteSpace: 'nowrap',
  };

  const valueStrongStyle: React.CSSProperties = {
    fontSize: '13.5px',
    fontWeight: 800,
    color: '#0f172a',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const valueTokenBlueStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    color: '#1f3a60',
    fontSize: '14px',
    fontWeight: 800,
    letterSpacing: '0.3px',
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  };

  const valueTokenBlackStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    color: '#0f172a',
    fontSize: '11px',
    fontWeight: 800,
    wordBreak: 'break-all',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  };

  const qrWrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const qrContainerStyle: React.CSSProperties = {
    border: '1.5px solid #cbd5e1',
    borderRadius: '8px',
    padding: '4px',
    background: '#ffffff',
    width: '90px',
    height: '90px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  };

  // Bottom demographic row spanning the full width
  const bottomRowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '8px',
    borderTop: '1px solid #cbd5e1',
    paddingTop: '8px',
    marginTop: '12px',
    width: '100%',
    boxSizing: 'border-box',
  };

  // Demographic columns set to wrap-content instead of flex: 1 for correct space-between alignment
  const bottomFieldStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    minWidth: 0,
  };

  const bottomValueStyle: React.CSSProperties = {
    fontSize: '13.5px',
    fontWeight: 800,
    color: '#0f172a',
    whiteSpace: 'nowrap',
  };

  return (
    <article className="printable-abha-card" style={cardStyle}>
      {/* Self-contained CSS styles for smooth hover translation, shadow lifting, and mobile responsiveness */}
      <style dangerouslySetInnerHTML={{ __html: `
        .printable-abha-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .printable-abha-card:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(31, 58, 96, 0.08) !important;
        }
        @media (max-width: 480px) {
          .printable-abha-card {
            border-radius: 12px !important;
            min-height: auto !important;
          }
          .printable-abha-card-header {
            height: 52px !important;
            padding: 8px 12px !important;
          }
          .printable-abha-card-header span:first-of-type {
            font-size: 9px !important;
          }
          .printable-abha-card-header span:last-of-type {
            font-size: 8px !important;
          }
          .printable-abha-card-nha-img {
            height: 28px !important;
          }
          .printable-abha-card-abdm-wrapper {
            height: 38px !important;
            width: 38px !important;
          }
          .printable-abha-card-body {
            padding: 8px 12px !important;
            gap: 10px !important;
          }
          .printable-abha-card-avatar {
            width: 70px !important;
            height: 90px !important;
          }
          .printable-abha-card-details {
            gap: 4px !important;
          }
          .printable-abha-card-label {
            font-size: 6px !important;
          }
          .printable-abha-card-value {
            font-size: 10px !important;
          }
          .printable-abha-card-value.token-num {
            font-size: 10px !important;
            gap: 4px !important;
          }
          .printable-abha-card-value.token-num button svg {
            width: 10px !important;
            height: 10px !important;
          }
          .printable-abha-card-qr {
            width: 65px !important;
            height: 65px !important;
            padding: 2px !important;
          }
          .printable-abha-card-row {
            gap: 4px !important;
            padding-top: 6px !important;
            margin-top: 6px !important;
          }
          .printable-abha-card-row .printable-abha-card-value {
            font-size: 10px !important;
          }
        }
      `}} />

      {/* Header */}
      <div className="printable-abha-card-header" style={headerStyle}>
        <div style={logoWrapperStyle}>
          <img
            src="/assets/svg/nha.svg"
            alt="NHA Logo"
            className="printable-abha-card-nha-img"
            style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
          />
        </div>
        <div style={headerTextContainerStyle}>
          <span style={headerTitleStyle}>Ayushman Bharat Health Account</span>
          <span style={headerSubtitleStyle}>आयुष्मान भारत स्वास्थ्य खाता (आभा)</span>
        </div>
        <div className="printable-abha-card-abdm-wrapper" style={abdmWrapperStyle}>
          <img
            src="/assets/svg/abdm1.svg"
            alt="ABDM Logo"
            style={{ height: '100%', width: '100%', objectFit: 'contain' }}
          />
        </div>
      </div>

      {/* Body */}
      <div className="printable-abha-card-body" style={bodyStyle}>
        {/* Top Section: Photo (Left), Details (Middle), QR Code (Right) - all aligned to start/top */}
        <div style={topRowStyle}>
          
          {/* Column 1: User Photo */}
          <div className="printable-abha-card-avatar-wrapper" style={avatarWrapperStyle}>
            <div 
              className="printable-abha-card-avatar" 
              style={avatarStyle} 
              onClick={isEditable ? triggerPhotoSelect : undefined}
            >
              <img
                src={getPhotoSrc(abhaProfile.profilePhoto || currentUser?.photo)}
                alt={name}
                style={{ width: '100%', height: '100%', borderRadius: '6px', objectFit: 'cover' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=150';
                }}
              />
              {isEditable && (
                <div style={editBadgeStyle}>
                  <Pencil style={{ width: '10px', height: '10px', color: '#ffffff' }} />
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Text Demographics */}
          <div className="printable-abha-card-details" style={detailsContainerStyle}>
            <div className="printable-abha-card-field" style={fieldStyle}>
              <span className="printable-abha-card-label" style={labelStyle}>Name/ नाम</span>
              <strong className="printable-abha-card-value" style={valueStrongStyle}>{name}</strong>
            </div>
            
            <div className="printable-abha-card-field" style={fieldStyle}>
              <span className="printable-abha-card-label" style={labelStyle}>Abha number/ आभा-संख्या</span>
              <strong className="printable-abha-card-value token-num" style={valueTokenBlueStyle}>
                <span>{abhaNumber}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); copyToClipboard?.(abhaNumber, 'ABHA Number'); }}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    padding: '2px', 
                    cursor: 'pointer', 
                    display: 'inline-flex', 
                    alignItems: 'center',
                    color: '#64748b'
                  }}
                  title="Copy ABHA Number"
                >
                  <Copy style={{ width: '12px', height: '12px' }} />
                </button>
              </strong>
            </div>
            
            <div className="printable-abha-card-field" style={fieldStyle}>
              <span className="printable-abha-card-label" style={labelStyle}>Abha address/ आभा पता</span>
              <strong className="printable-abha-card-value token-num" style={valueTokenBlackStyle}>
                <span>{abhaAddress}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); copyToClipboard?.(abhaAddress, 'ABHA Address'); }}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    padding: '2px', 
                    cursor: 'pointer', 
                    display: 'inline-flex', 
                    alignItems: 'center',
                    color: '#64748b'
                  }}
                  title="Copy ABHA Address"
                >
                  <Copy style={{ width: '12px', height: '12px' }} />
                </button>
              </strong>
            </div>
          </div>

          {/* Column 3: Small QR Code */}
          <div className="printable-abha-card-qr-wrapper" style={qrWrapperStyle}>
            <div className="printable-abha-card-qr" style={qrContainerStyle}>
              <img
                src={qrCodeUrl}
                alt="ABHA QR"
                className="printable-abha-card-qr-img"
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              />
            </div>
          </div>

        </div>

        {/* Bottom Section: Gender (Left-aligned), DOB (Center-aligned), Mobile (Right-aligned) */}
        <div className="printable-abha-card-row" style={bottomRowStyle}>
          <div className="printable-abha-card-field" style={{ ...bottomFieldStyle, alignItems: 'flex-start', textAlign: 'left' }}>
            <span className="printable-abha-card-label" style={labelStyle}>Gender/ लिंग</span>
            <span className="printable-abha-card-value" style={bottomValueStyle}>{gender}</span>
          </div>
          <div className="printable-abha-card-field" style={{ ...bottomFieldStyle, alignItems: 'center', textAlign: 'center' }}>
            <span className="printable-abha-card-label" style={labelStyle}>Date of birth/ जन्मतिथि</span>
            <span className="printable-abha-card-value" style={bottomValueStyle}>{dob}</span>
          </div>
          <div className="printable-abha-card-field" style={{ ...bottomFieldStyle, alignItems: 'flex-end', textAlign: 'right' }}>
            <span className="printable-abha-card-label" style={labelStyle}>Mobile/ मोबाइल</span>
            <span className="printable-abha-card-value" style={{ ...bottomValueStyle, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span>{mobile}</span>
              {isEditable && triggerMobileEdit && (
                <button 
                  onClick={(e) => { e.stopPropagation(); triggerMobileEdit(); }}
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
              )}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
