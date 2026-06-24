/**
 * @file        ProfileModals.tsx
 * @description Coordinates and renders all profile dashboard popup dialog overlays (PVC print, OTP entry, crop tool, response debugger).
 * @module      profile/components
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-24
 */

import React from 'react';
import { CreditCard, X, Printer, Phone, Mail, Camera, Pencil, Check, Key, RefreshCw, EyeOff, Eye, ShieldAlert, UserMinus, AlertCircle } from 'lucide-react';
import OtpInput from '../../../../components/common/OtpInput';
import { ImageCropper } from '../../../../components/common/ImageCropper';

interface ProfileModalsProps {
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
  abhaProfile: any;
  currentUser: any;
  t: (key: string) => string;
  pvcTab: 'front' | 'back';
  setPvcTab: (tab: 'front' | 'back') => void;
  getPhotoSrc: (photo: string | undefined) => string;
  getGenderDisplay: (gender: string | undefined) => string;
  handlePrintPvc: () => void;
  shakeModal: boolean;
  mobileOtpStep: boolean;
  setMobileOtpStep: (step: boolean) => void;
  mobileForm: any;
  handleMobileSubmit: (formData: any) => Promise<void>;
  mobileLoading: boolean;
  mobileCoolingTimer: number;
  mobileError: string;
  setMobileError: (err: string) => void;
  newMobile: string;
  mobileOtp: string;
  setMobileOtp: (otp: string) => void;
  handleVerifyMobileOtp: () => Promise<void>;
  emailSent: boolean;
  emailForm: any;
  handleEmailSubmit: (formData: any) => Promise<void>;
  emailLoading: boolean;
  emailCoolingTimer: number;
  emailError: string;
  newEmail: string;
  photoPreview: string;
  setPhotoPreview: (preview: string) => void;
  photoFile: File | null;
  setPhotoFile: (file: File | null) => void;
  photoLoading: boolean;
  photoError: string;
  setPhotoError: (err: string) => void;
  handlePhotoFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePhotoUploadSubmit: (e: React.FormEvent) => Promise<void>;
  passSuccess: boolean;
  passOtpStep: boolean;
  setPassOtpStep: (step: boolean) => void;
  passwordForm: any;
  handleSetPasswordSubmit: (formData: any) => Promise<void>;
  passAuthMethod: 'aadhaar' | 'abha';
  setPassAuthMethod: (method: 'aadhaar' | 'abha') => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
  passError: string;
  setPassError: (err: string) => void;
  passLoading: boolean;
  passOtp: string;
  setPassOtp: (otp: string) => void;
  handleVerifyPasswordOtp: () => Promise<void>;
  reKycSuccess: boolean;
  reKycOtpStep: boolean;
  setReKycOtpStep: (step: boolean) => void;
  reKycError: string;
  setReKycError: (err: string) => void;
  handleRequestReKycOtp: () => Promise<void>;
  reKycLoading: boolean;
  reKycOtp: string;
  setReKycOtp: (otp: string) => void;
  handleVerifyReKycOtp: () => Promise<void>;
  deactivateConfirmed: boolean;
  deactivateOtpStep: boolean;
  setDeactivateOtpStep: (step: boolean) => void;
  deactivateOption: 'deactivate' | 'delete';
  setDeactivateOption: (opt: 'deactivate' | 'delete') => void;
  deactivateAuthMethod: 'aadhaar' | 'abha';
  setDeactivateAuthMethod: (method: 'aadhaar' | 'abha') => void;
  deactivateError: string;
  setDeactivateError: (err: string) => void;
  deactivateLoading: boolean;
  handleDeactivateRequest: () => Promise<void>;
  deactivateOtp: string;
  setDeactivateOtp: (otp: string) => void;
  handleVerifyDeactivateOtp: () => Promise<void>;
  delinkOtpStep: boolean;
  setDelinkOtpStep: (step: boolean) => void;
  delinkError: string;
  setDelinkError: (err: string) => void;
  handleRequestDelinkOtp: () => Promise<void>;
  delinkLoading: boolean;
  delinkOtp: string;
  setDelinkOtp: (otp: string) => void;
  handleVerifyDelinkOtp: () => Promise<void>;
  rawImageToCrop: string;
  setRawImageToCrop: (img: string) => void;
  photoResponseData: any;
  setPhotoResponseData: (data: any) => void;
}

/**
 * Controller component for conditional modal renders, ensuring perfect DOM separation.
 */
export const ProfileModals: React.FC<ProfileModalsProps> = ({
  activeModal,
  setActiveModal,
  abhaProfile,
  currentUser,
  t,
  pvcTab,
  setPvcTab,
  getPhotoSrc,
  getGenderDisplay,
  handlePrintPvc,
  shakeModal,
  mobileOtpStep,
  setMobileOtpStep,
  mobileForm,
  handleMobileSubmit,
  mobileLoading,
  mobileCoolingTimer,
  mobileError,
  setMobileError,
  newMobile,
  mobileOtp,
  setMobileOtp,
  handleVerifyMobileOtp,
  emailSent,
  emailForm,
  handleEmailSubmit,
  emailLoading,
  emailCoolingTimer,
  emailError,
  newEmail,
  photoPreview,
  setPhotoPreview,
  photoFile,
  setPhotoFile,
  photoLoading,
  photoError,
  setPhotoError,
  handlePhotoFileChange,
  handlePhotoUploadSubmit,
  passSuccess,
  passOtpStep,
  setPassOtpStep,
  passwordForm,
  handleSetPasswordSubmit,
  passAuthMethod,
  setPassAuthMethod,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  passError,
  setPassError,
  passLoading,
  passOtp,
  setPassOtp,
  handleVerifyPasswordOtp,
  reKycSuccess,
  reKycOtpStep,
  setReKycOtpStep,
  reKycError,
  setReKycError,
  handleRequestReKycOtp,
  reKycLoading,
  reKycOtp,
  setReKycOtp,
  handleVerifyReKycOtp,
  deactivateConfirmed,
  deactivateOtpStep,
  setDeactivateOtpStep,
  deactivateOption,
  setDeactivateOption,
  deactivateAuthMethod,
  setDeactivateAuthMethod,
  deactivateError,
  setDeactivateError,
  deactivateLoading,
  handleDeactivateRequest,
  deactivateOtp,
  setDeactivateOtp,
  handleVerifyDeactivateOtp,
  delinkOtpStep,
  setDelinkOtpStep,
  delinkError,
  setDelinkError,
  handleRequestDelinkOtp,
  delinkLoading,
  delinkOtp,
  setDelinkOtp,
  handleVerifyDelinkOtp,
  rawImageToCrop,
  setRawImageToCrop,
  photoResponseData,
  setPhotoResponseData,
}) => {
  return (
    <>
      {/* 1. Print PVC Modal */}
      {activeModal === 'print_pvc' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'grid', placeItems: 'center', padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px',
            width: '100%', maxWidth: '520px', padding: '24px', boxShadow: 'var(--surface-shadow)',
            display: 'flex', flexDirection: 'column', gap: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <CreditCard style={{ color: 'var(--accent-teal)' }} />
                <span>Print PVC Card Preview</span>
              </h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Tabs Header */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', margin: '0 -24px' }}>
              <button 
                onClick={() => setPvcTab('front')} 
                style={{ 
                  flex: 1, 
                  padding: '12px', 
                  background: pvcTab === 'front' ? 'transparent' : 'var(--bg-secondary)', 
                  border: 'none',
                  borderBottom: pvcTab === 'front' ? '2.5px solid var(--accent-teal)' : '2.5px solid transparent',
                  color: pvcTab === 'front' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: 700, 
                  fontSize: '13px', 
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                Front View Of PVC Card
              </button>
              <button 
                onClick={() => setPvcTab('back')} 
                style={{ 
                  flex: 1, 
                  padding: '12px', 
                  background: pvcTab === 'back' ? 'transparent' : 'var(--bg-secondary)', 
                  border: 'none',
                  borderBottom: pvcTab === 'back' ? '2.5px solid var(--accent-teal)' : '2.5px solid transparent',
                  color: pvcTab === 'back' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: 700, 
                  fontSize: '13px', 
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                Back View Of PVC Card
              </button>
            </div>

            {/* Modal Body / Previews */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', minHeight: '300px', justifyContent: 'center', padding: '10px 0' }}>
              {pvcTab === 'front' ? (
                /* FRONT PREVIEW */
                <div style={{ width: '100%', maxWidth: '440px' }}>
                  <article 
                    className="setu-abha-card" 
                    style={{ 
                      width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid #cbd5e1',
                      fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minHeight: '277px', background: '#ffffff'
                    }}
                  >
                    {/* Header */}
                    <div className="setu-abha-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#264488', borderBottom: '2px solid #10b981', height: '56px', boxSizing: 'border-box' }}>
                      <div style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <img src="/assets/svg/nha.svg" alt="NHA Logo" style={{ height: '100%', width: 'auto', objectFit: 'contain' }} />
                      </div>
                      <div style={{ textAlign: 'center', color: '#ffffff', flex: 1, padding: '0 6px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        <span style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '0.2px', textTransform: 'uppercase' }}>Ayushman Bharat Health Account</span>
                        <span style={{ fontSize: '8px', opacity: 0.9, fontWeight: 600 }}>आयुष्मान भारत स्वास्थ्य खाता (आभा)</span>
                      </div>
                      <div style={{ height: '42px', width: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRadius: '50%', border: '1px solid #cbd5e1', overflow: 'hidden', background: '#ffffff' }}>
                        <img src="/assets/svg/abdm1.svg" alt="ABDM Logo" style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
                      </div>
                    </div>
                    
                    {/* Body */}
                    <div className="setu-abha-card-body" style={{ display: 'grid', gridTemplateColumns: '85px 1fr 75px', gap: '12px', padding: '12px', background: 'radial-gradient(circle, #ffffff 0%, #f1f5f9 100%)', color: '#0f172a', alignItems: 'center', height: 'calc(100% - 56px)', boxSizing: 'border-box' }}>
                      <div style={{ width: '85px', height: '110px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #94a3b8', flexShrink: 0 }}>
                        <img src={getPhotoSrc(abhaProfile.photo || abhaProfile.profilePhoto || currentUser?.photo)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar" />
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', minWidth: 0 }}>
                        <div>
                          <span style={{ fontSize: '6px', color: '#64748b', display: 'block', fontWeight: 700 }}>Name / नाम</span>
                          <strong style={{ fontSize: '10px', color: '#0f172a', fontWeight: '800', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {abhaProfile.name || [abhaProfile.firstName, abhaProfile.middleName, abhaProfile.lastName].filter(Boolean).join(' ') || currentUser?.name}
                          </strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '6px', color: '#64748b', display: 'block', fontWeight: 700 }}>ABHA Number / आभा संख्या</span>
                          <strong style={{ fontSize: '9.5px', color: 'var(--accent-blue)', fontFamily: 'monospace', fontWeight: 800 }}>
                            {abhaProfile.ABHANumber || abhaProfile.abhaNumber}
                          </strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '6px', color: '#64748b', display: 'block', fontWeight: 700 }}>ABHA Address / आभा पता</span>
                          <strong style={{ fontSize: '8px', color: '#0f172a', fontFamily: 'monospace', fontWeight: 700, wordBreak: 'break-all' }}>
                            {abhaProfile.preferredAbhaAddress || abhaProfile.preferredAddress || abhaProfile.abhaAddress || abhaProfile.abhaId}
                          </strong>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '4px', width: '100%', marginTop: '2px' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: '5px', color: '#64748b', display: 'block', fontWeight: 700 }}>Gender / लिंग</span>
                            <span style={{ fontSize: '8px', fontWeight: 600, color: '#0f172a' }}>{getGenderDisplay(abhaProfile.gender)}</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: '5px', color: '#64748b', display: 'block', fontWeight: 700 }}>DOB / जन्म तिथि</span>
                            <span style={{ fontSize: '8px', fontWeight: 600, color: '#0f172a' }}>{abhaProfile.dob}</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: '5px', color: '#64748b', display: 'block', fontWeight: 700 }}>Mobile / मोबाइल</span>
                            <span style={{ fontSize: '8px', fontWeight: 600, color: '#0f172a' }}>{abhaProfile.mobile}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify({
                            district_name: (abhaProfile.districtName || "JABALPUR").toUpperCase(),
                            hid: abhaProfile.preferredAbhaAddress || abhaProfile.preferredAddress || abhaProfile.abhaAddress || abhaProfile.abhaId,
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
                          style={{ width: '75px', height: '75px', display: 'block' }}
                          alt="QR"
                        />
                      </div>
                    </div>
                  </article>
                </div>
              ) : (
                /* BACK PREVIEW */
                <div style={{ width: '100%', maxWidth: '440px' }}>
                  <article 
                    className="pvc-back-card"
                    style={{
                      width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid #cbd5e1',
                      fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minHeight: '277px', background: 'radial-gradient(circle, #ffffff 0%, #f8fafc 100%)'
                    }}
                  >
                    {/* Header */}
                    <div className="setu-abha-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#264488', borderBottom: '2px solid #10b981', height: '56px', boxSizing: 'border-box' }}>
                      <div style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <img src="/assets/svg/nha.svg" alt="NHA Logo" style={{ height: '100%', width: 'auto', objectFit: 'contain' }} />
                      </div>
                      <div style={{ textAlign: 'center', color: '#ffffff', flex: 1, padding: '0 6px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        <span style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '0.2px', textTransform: 'uppercase' }}>Ayushman Bharat Health Account</span>
                        <span style={{ fontSize: '8px', opacity: 0.9, fontWeight: 600 }}>आयुष्मान भारत स्वास्थ्य खाता (आभा)</span>
                      </div>
                      <div style={{ height: '42px', width: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRadius: '50%', border: '1px solid #cbd5e1', overflow: 'hidden', background: '#ffffff' }}>
                        <img src="/assets/svg/abdm1.svg" alt="ABDM Logo" style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
                      </div>
                    </div>
                    
                    {/* Body */}
                    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', height: 'calc(100% - 56px)', boxSizing: 'border-box', justifyContent: 'space-between', color: '#0f172a' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', fontSize: '9px', marginBottom: '4px', color: '#0f172a' }}>
                        <span>Instructions</span>
                        <span>Toll-Free Number: 1800 114 477</span>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '14px', fontSize: '7.5px', lineHeight: '1.3', color: '#334155', textAlign: 'left', listStyleType: 'disc' }}>
                        <li style={{ marginBottom: '4px' }}>
                          With this ABHA you have become a part of India's digital health ecosystem.
                          <div style={{ color: '#64748b', fontSize: '7px' }}>इस आभा के साथ आप भारत के डिजिटल हेल्थ इकोसिस्टम का हिस्सा बन गए हैं।</div>
                        </li>
                        <li style={{ marginBottom: '4px' }}>
                          ABHA provides you a unique identification and helps in storing - safekeeping all your digital health records at one place.
                          <div style={{ color: '#64748b', fontSize: '7px' }}>आभा आपको एक विशिष्ट पहचान प्रदान करता है और आपके सभी डिजिटल स्वास्थ्य रिकॉर्ड को सुरक्षित एक ही स्थान पर संग्रहीत रखने में मदद करता है।</div>
                        </li>
                        <li style={{ marginBottom: '4px' }}>
                          You can download the ABHA mobile app, Aarogya Setu or other ABDM enabled app to view and share your digital health records with ABDM registered healthcare service providers.
                          <div style={{ color: '#64748b', fontSize: '7px' }}>आप एबीडीएम पंजीकृत स्वास्थ्य सेवा प्रदाताओं के साथ अपने डिजिटल स्वास्थ्य रिकॉर्ड देखने और साझा करने के लिए आभा मोबाइल ऐप, आरोग्य सेतु या अन्य एबीडीएम सक्षम ऐप डाउनलोड कर सकते हैं।</div>
                        </li>
                        <li style={{ marginBottom: '4px' }}>
                          If this card is lost kindly download it from www.abha.abdm.gov.in, it is digitally acceptable.
                          <div style={{ color: '#64748b', fontSize: '7px' }}>यदि यह कार्ड खो जाता है तो कृपया इसे www.abha.abdm.gov.in से डाउनलोड करें, यह डिजिटल रूप से स्वीकार्य है।</div>
                        </li>
                      </ul>
                      
                      <div style={{ width: '100%', marginTop: '4px' }}>
                        <hr style={{ border: 'none', borderTop: '1px solid #cbd5e1', margin: '3px 0' }} />
                        <div style={{ textAlign: 'center', fontSize: '8.5px', fontWeight: 'bold', color: '#334155' }}>
                          Issued on: 30-11-2022
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setActiveModal(null)} 
                style={{ 
                  flex: 1, 
                  padding: '10px 14px', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '8px', 
                  background: 'var(--bg-secondary)', 
                  color: 'var(--text-primary)', 
                  fontWeight: 700, 
                  cursor: 'pointer', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '6px' 
                }}
              >
                <X style={{ width: '16px', height: '16px' }} />
                <span>Close</span>
              </button>
              <button 
                onClick={handlePrintPvc} 
                style={{ 
                  flex: 1, 
                  padding: '10px 14px', 
                  border: 'none', 
                  borderRadius: '8px', 
                  background: '#c2410c', 
                  color: '#ffffff', 
                  fontWeight: 800, 
                  cursor: 'pointer', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '6px' 
                }}
              >
                <Printer style={{ width: '16px', height: '16px', color: '#ffffff' }} />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Mobile Update Modal */}
      {activeModal === 'edit_mobile' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'grid', placeItems: 'center', padding: '20px'
        }}>
          <div 
            className={shakeModal ? 'shake-modal' : ''}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px',
              width: '100%', maxWidth: '440px', padding: '24px', boxShadow: 'var(--surface-shadow)',
              display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <Phone style={{ color: 'var(--accent-teal)', width: '18px', height: '18px' }} />
                <span>Update Mobile Number</span>
              </h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {!mobileOtpStep ? (
              <form onSubmit={mobileForm.handleSubmit(handleMobileSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Current Mobile Number</span>
                  <input type="text" value={abhaProfile.mobile || 'N/A'} disabled style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-muted)', marginTop: '4px', cursor: 'not-allowed', letterSpacing: '2px', fontSize: '13px' }} />
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>New Mobile Number</span>
                  <div style={{ position: 'relative', marginTop: '4px' }}>
                    {(() => {
                      const { onChange: onMobileChange, ...mobileReg } = mobileForm.register('newMobile', {
                        required: t('Mobile number is required.'),
                        pattern: { value: /^\d{10}$/, message: t('Please enter a valid 10-digit mobile number.') },
                        validate: (val: string) => val !== abhaProfile.mobile || t('New mobile cannot be the same as current mobile.')
                      });
                      return (
                        <input 
                          type="tel" 
                          maxLength={10}
                          placeholder="Enter 10-digit mobile number" 
                          disabled={mobileLoading || mobileCoolingTimer > 0}
                          {...mobileReg}
                          onChange={async (e) => {
                            const cleaned = e.target.value.replace(/\D/g, '');
                            e.target.value = cleaned;
                            await onMobileChange(e);
                            setMobileError('');
                          }}
                          style={{ 
                            width: '100%', padding: '10px 36px 10px 10px', borderRadius: '8px', 
                            border: (mobileForm.formState.errors.newMobile || mobileError) ? '2px solid var(--danger)' : mobileForm.watch('newMobile')?.length === 10 && !mobileForm.formState.errors.newMobile ? '2px solid var(--success)' : '1px solid var(--border-color)', 
                            background: 'var(--bg-primary)', color: 'var(--text-primary)',
                            boxShadow: (mobileForm.formState.errors.newMobile || mobileError) ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                            animation: (mobileForm.formState.errors.newMobile || mobileError) ? 'otp-shake 0.4s ease' : 'none',
                            letterSpacing: '2px', fontSize: '13px'
                          }} 
                        />
                      );
                    })()}
                    {mobileForm.watch('newMobile')?.length === 10 && !mobileForm.formState.errors.newMobile && !mobileError && (
                      <img 
                        src="/assets/check_icon.png" 
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px' }} 
                        alt="Verified" 
                      />
                    )}
                  </div>
                </div>
                {mobileForm.formState.errors.newMobile && <div style={{ color: 'var(--danger)', fontSize: '11.5px', fontWeight: 600 }}>{mobileForm.formState.errors.newMobile.message as string}</div>}
                {mobileError && <div style={{ color: 'var(--danger)', fontSize: '11.5px' }}>{mobileError}</div>}
                <button type="submit" disabled={mobileLoading} style={{ padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}>
                  {mobileLoading ? 'Sending...' : 'Request OTP / ओटीपी प्राप्त करें'}
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: 'rgba(20, 184, 166, 0.06)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(20, 184, 166, 0.15)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  OTP sent to new mobile ending with ******{newMobile.slice(-4)}.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>Enter 6-Digit OTP</span>
                  <OtpInput value={mobileOtp} onChange={(val) => { setMobileError(''); setMobileOtp(val); }} error={!!mobileError} disabled={mobileLoading} shake={shakeModal} onEnter={handleVerifyMobileOtp} />
                </div>
                {mobileError && <div style={{ color: 'var(--danger)', fontSize: '11.5px' }}>{mobileError}</div>}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setMobileOtpStep(false)} style={{ flex: 1, padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }}>
                    Edit Mobile
                  </button>
                  <button onClick={handleVerifyMobileOtp} disabled={mobileLoading || mobileOtp.length !== 6} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}>
                    Verify & Update
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Link & Verify Email Modal */}
      {activeModal === 'edit_email' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'grid', placeItems: 'center', padding: '20px'
        }}>
          <div 
            className={shakeModal ? 'shake-modal' : ''}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px',
              width: '100%', maxWidth: '440px', padding: '24px', boxShadow: 'var(--surface-shadow)',
              display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <Mail style={{ color: 'var(--accent-teal)', width: '18px', height: '18px' }} />
                <span>Link & Verify Email</span>
              </h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {!emailSent ? (
              <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Current Email Address</span>
                  <input type="text" value={abhaProfile.email || 'Not verified'} disabled style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-muted)', marginTop: '4px', cursor: 'not-allowed' }} />
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>New Email Address</span>
                  <div style={{ position: 'relative', marginTop: '4px' }}>
                    <input 
                      type="email" 
                      placeholder="Enter email address (e.g. name@domain.com)" 
                      disabled={emailLoading || emailCoolingTimer > 0}
                      {...emailForm.register('newEmail', {
                        required: t('Email address is required.'),
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t('Please enter a valid email address (e.g. name@domain.com).') },
                        validate: (val: string) => val !== abhaProfile.email || t('New email cannot be the same as current email.')
                      })}
                      style={{ 
                        width: '100%', padding: '10px 36px 10px 10px', borderRadius: '8px', 
                        border: (emailForm.formState.errors.newEmail || emailError) ? '2px solid var(--danger)' : emailForm.watch('newEmail') && !emailForm.formState.errors.newEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.watch('newEmail') || '') ? '2px solid var(--success)' : '1px solid var(--border-color)', 
                        background: 'var(--bg-primary)', color: 'var(--text-primary)',
                        boxShadow: (emailForm.formState.errors.newEmail || emailError) ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                        animation: (emailForm.formState.errors.newEmail || emailError) ? 'otp-shake 0.4s ease' : 'none',
                        opacity: (emailLoading || emailCoolingTimer > 0) ? 0.6 : 1,
                        cursor: (emailLoading || emailCoolingTimer > 0) ? 'not-allowed' : 'auto'
                      }} 
                    />
                    {emailForm.watch('newEmail') && !emailForm.formState.errors.newEmail && !emailError && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.watch('newEmail') || '') && (
                      <img 
                        src="/assets/check_icon.png" 
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px' }} 
                        alt="Verified" 
                      />
                    )}
                  </div>
                </div>
                {emailForm.formState.errors.newEmail && <div style={{ color: 'var(--danger)', fontSize: '11.5px', fontWeight: 600 }}>{emailForm.formState.errors.newEmail.message as string}</div>}
                {emailError && <div style={{ color: 'var(--danger)', fontSize: '11.5px' }}>{emailError}</div>}
                <button 
                  type="submit" 
                  disabled={emailLoading || emailCoolingTimer > 0} 
                  style={{ 
                    padding: '12px', borderRadius: '8px', border: 'none', 
                    background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: (emailLoading || emailCoolingTimer > 0) ? 'not-allowed' : 'pointer',
                    opacity: (emailLoading || emailCoolingTimer > 0) ? 0.7 : 1
                  }}
                >
                  {emailLoading ? 'Sending link...' : emailCoolingTimer > 0 ? `Resend Link in ${emailCoolingTimer}s` : 'Send Verification Link'}
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(20, 184, 166, 0.1)', color: 'var(--accent-teal)', display: 'grid', placeItems: 'center', margin: '0 auto' }}>
                  <Mail style={{ width: '24px', height: '24px' }} />
                </div>
                <h4 style={{ margin: '8px 0 2px', fontWeight: 800 }}>Verification Link Sent</h4>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0 }}>
                  We have sent a verification email to <strong>{newEmail}</strong>. Please click the link inside the mail to verify.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Update Profile Photo Modal (Max 100 KB constraint) */}
      {activeModal === 'edit_photo' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'grid', placeItems: 'center', padding: '20px'
        }}>
          <div 
            className={shakeModal ? 'shake-modal' : ''}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px',
              width: '100%', maxWidth: '440px', padding: '24px', boxShadow: 'var(--surface-shadow)',
              display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <Camera style={{ color: 'var(--accent-teal)', width: '18px', height: '18px' }} />
                <span>Update Profile Photo</span>
              </h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <form onSubmit={handlePhotoUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '80px', height: '100px', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden', background: 'var(--bg-secondary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <img src={photoPreview || getPhotoSrc(abhaProfile.photo)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Upload JPEG/PNG Photo</span>
                  <span style={{ fontSize: '9.5px', color: 'var(--text-secondary)' }}>File size constraint: <strong>Max 100 KB</strong>. Aspect ratio matching ABHA standard card.</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <input 
                  type="file" 
                  accept="image/jpeg, image/png, image/jpg"
                  onChange={handlePhotoFileChange} 
                  style={{
                    fontSize: '12px', width: '100%', padding: '10px',
                    borderRadius: '8px', border: photoError ? '2px solid var(--danger)' : '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                    boxShadow: photoError ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none'
                  }}
                />
              </div>

              {photoError && <div style={{ color: 'var(--danger)', fontSize: '11px' }}>{photoError}</div>}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setActiveModal(null)} style={{ flex: 1, padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={photoLoading || !photoFile} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}>
                  {photoLoading ? 'Uploading...' : 'Save Picture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Set Security Password Modal (Drawer on Mobile viewports) */}
      {activeModal === 'set_password' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }} className="pass-modal-backdrop">
          
          {/* CSS to convert this to bottom drawer on mobile */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media (max-width: 600px) {
              .pass-modal-backdrop {
                align-items: flex-end !important;
                padding: 0 !important;
              }
              .pass-modal-card {
                border-bottom-left-radius: 0 !important;
                border-bottom-right-radius: 0 !important;
                border-top-left-radius: 24px !important;
                border-top-right-radius: 24px !important;
                width: 100% !important;
                max-width: 100% !important;
                animation: modal-slide-up 0.3s ease-out !important;
              }
            }
          `}} />

          <div 
            className="pass-modal-card shake-modal"
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px',
              width: '100%', maxWidth: '440px', padding: '24px', boxShadow: 'var(--surface-shadow)',
              display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left',
              animation: shakeModal ? 'otp-shake 0.4s ease' : 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <Key style={{ color: 'var(--accent-teal)', width: '18px', height: '18px' }} />
                <span>Set Security Password</span>
              </h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {passSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                <img 
                  src="/assets/check_icon.png" 
                  style={{ width: '48px', height: '48px', display: 'block', margin: '0 auto 12px' }} 
                  alt="Verified" 
                />
                <h4 style={{ margin: '0 0 6px', fontWeight: 800 }}>Password Set Successfully</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>You can now use this password alongside your ABHA address to access clinical dashboards directly.</p>
              </div>
            ) : !passOtpStep ? (
              <form onSubmit={passwordForm.handleSubmit(handleSetPasswordSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Verification Channel</span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <label style={{ flex: 1, padding: '10px', borderRadius: '8px', border: passAuthMethod === 'aadhaar' ? '2px solid var(--accent-teal)' : '1px solid var(--border-color)', background: passAuthMethod === 'aadhaar' ? 'rgba(20, 184, 166, 0.06)' : 'var(--bg-secondary)', cursor: 'pointer', fontSize: '11.5px', fontWeight: 'bold', textAlign: 'center', color: 'var(--text-primary)' }}>
                      <input type="radio" checked={passAuthMethod === 'aadhaar'} onChange={() => setPassAuthMethod('aadhaar')} style={{ display: 'none' }} />
                      Aadhaar Linked Mobile
                    </label>
                    <label style={{ flex: 1, padding: '10px', borderRadius: '8px', border: passAuthMethod === 'abha' ? '2px solid var(--accent-teal)' : '1px solid var(--border-color)', background: passAuthMethod === 'abha' ? 'rgba(20, 184, 166, 0.06)' : 'var(--bg-secondary)', cursor: 'pointer', fontSize: '11.5px', fontWeight: 'bold', textAlign: 'center', color: 'var(--text-primary)' }}>
                      <input type="radio" checked={passAuthMethod === 'abha'} onChange={() => setPassAuthMethod('abha')} style={{ display: 'none' }} />
                      ABHA Linked Mobile
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>New Password</span>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="Minimum 8 characters" 
                      {...passwordForm.register('newPassword', {
                        required: t('Password is required.'),
                        minLength: { value: 8, message: t('Password must be at least 8 characters long.') }
                      })}
                      style={{ 
                        width: '100%', padding: '10px 64px 10px 10px', borderRadius: '8px', 
                        border: passwordForm.formState.errors.newPassword ? '2px solid var(--danger)' : (passwordForm.watch('newPassword') || '').length >= 8 ? '2px solid var(--success)' : '1px solid var(--border-color)', 
                        background: 'var(--bg-primary)', color: 'var(--text-primary)',
                        boxShadow: passwordForm.formState.errors.newPassword ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                        animation: passwordForm.formState.errors.newPassword ? 'otp-shake 0.4s ease' : 'none'
                      }}
                    />
                    <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {(passwordForm.watch('newPassword') || '').length >= 8 && !passwordForm.formState.errors.newPassword && (
                        <img 
                          src="/assets/check_icon.png" 
                          style={{ width: '18px', height: '18px' }} 
                          alt="Verified" 
                        />
                      )}
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', display: 'flex', padding: '4px', cursor: 'pointer' }}>
                        {showPassword ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
                      </button>
                    </div>
                  </div>
                  {passwordForm.formState.errors.newPassword && <div style={{ color: 'var(--danger)', fontSize: '10.5px', fontWeight: 600, marginTop: '2px' }}>{passwordForm.formState.errors.newPassword.message as string}</div>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>Confirm Password</span>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'} 
                      placeholder="Confirm your password" 
                      {...passwordForm.register('confirmPassword', {
                        required: t('Please confirm your password.'),
                        validate: (val: string) => val === passwordForm.watch('newPassword') || t('Passwords do not match.')
                      })}
                      style={{ 
                        width: '100%', padding: '10px 64px 10px 10px', borderRadius: '8px', 
                        border: passwordForm.formState.errors.confirmPassword ? '2px solid var(--danger)' : (passwordForm.watch('confirmPassword') || '').length >= 8 && passwordForm.watch('confirmPassword') === passwordForm.watch('newPassword') ? '2px solid var(--success)' : '1px solid var(--border-color)', 
                        background: 'var(--bg-primary)', color: 'var(--text-primary)',
                        boxShadow: passwordForm.formState.errors.confirmPassword ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                        animation: passwordForm.formState.errors.confirmPassword ? 'otp-shake 0.4s ease' : 'none'
                      }}
                    />
                    <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {(passwordForm.watch('confirmPassword') || '').length >= 8 && passwordForm.watch('confirmPassword') === passwordForm.watch('newPassword') && !passwordForm.formState.errors.confirmPassword && (
                        <img 
                          src="/assets/check_icon.png" 
                          style={{ width: '18px', height: '18px' }} 
                          alt="Verified" 
                        />
                      )}
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', display: 'flex', padding: '4px', cursor: 'pointer' }}>
                        {showConfirmPassword ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
                      </button>
                    </div>
                  </div>
                  {passwordForm.formState.errors.confirmPassword && <div style={{ color: 'var(--danger)', fontSize: '10.5px', fontWeight: 600, marginTop: '2px' }}>{passwordForm.formState.errors.confirmPassword.message as string}</div>}
                </div>

                {passError && <div style={{ color: 'var(--danger)', fontSize: '11px', fontWeight: 600 }}>{passError}</div>}
                
                <button type="submit" disabled={passLoading} style={{ padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer', marginTop: '6px' }}>
                  {passLoading ? 'Requesting OTP...' : 'Send Verification OTP'}
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: 'rgba(20, 184, 166, 0.06)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(20, 184, 166, 0.15)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Enter secure OTP sent to {passAuthMethod === 'aadhaar' ? 'Aadhaar linked phone ending with ******5682' : `ABHA linked phone ending with ******${abhaProfile.mobile?.slice(-4)}`}.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>Enter 6-Digit OTP</span>
                  <OtpInput value={passOtp} onChange={(val) => { setPassError(''); setPassOtp(val); }} error={!!passError} disabled={passLoading} shake={shakeModal} onEnter={handleVerifyPasswordOtp} />
                </div>
                {passError && <div style={{ color: 'var(--danger)', fontSize: '11.5px' }}>{passError}</div>}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setPassOtpStep(false)} style={{ flex: 1, padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }}>
                    Edit Fields
                  </button>
                  <button onClick={handleVerifyPasswordOtp} disabled={passLoading || passOtp.length !== 6} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}>
                    Confirm & Verify
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Re-KYC Verification Modal */}
      {activeModal === 're_kyc' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'grid', placeItems: 'center', padding: '20px'
        }}>
          <div 
            className={shakeModal ? 'shake-modal' : ''}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px',
              width: '100%', maxWidth: '440px', padding: '24px', boxShadow: 'var(--surface-shadow)',
              display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left',
              animation: shakeModal ? 'otp-shake 0.4s ease' : 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <RefreshCw style={{ color: 'var(--accent-teal)', width: '18px', height: '18px' }} />
                <span>Re-KYC Verification</span>
              </h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {reKycSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                <img 
                  src="/assets/check_icon.png" 
                  style={{ width: '48px', height: '48px', display: 'block', margin: '0 auto 12px' }} 
                  alt="Verified" 
                />
                <h4 style={{ margin: '0 0 6px', fontWeight: 800 }}>Re-KYC Complete</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>UIDAI verification resolved. Your demographic verification status is now updated to fully compliant.</p>
              </div>
            ) : !reKycOtpStep ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                  Re-KYC verifies your demographic identity against the central UIDAI registry. We will send an OTP confirmation to your registered mobile ending with <strong>******{abhaProfile.mobile?.slice(-4)}</strong>.
                </p>
                {reKycError && <div style={{ color: 'var(--danger)', fontSize: '11.5px' }}>{reKycError}</div>}
                <button onClick={handleRequestReKycOtp} disabled={reKycLoading} style={{ padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer', width: '100%' }}>
                  {reKycLoading ? 'Requesting OTP...' : 'Send Re-KYC verification OTP'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: 'rgba(20, 184, 166, 0.06)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(20, 184, 166, 0.15)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Re-KYC OTP sent to registered mobile.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>Enter 6-Digit OTP</span>
                  <OtpInput value={reKycOtp} onChange={(val) => { setReKycError(''); setReKycOtp(val); }} error={!!reKycError} disabled={reKycLoading} shake={shakeModal} onEnter={handleVerifyReKycOtp} />
                </div>
                {reKycError && <div style={{ color: 'var(--danger)', fontSize: '11.5px' }}>{reKycError}</div>}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setReKycOtpStep(false)} style={{ flex: 1, padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }}>
                    Back
                  </button>
                  <button onClick={handleVerifyReKycOtp} disabled={reKycLoading || reKycOtp.length !== 6} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}>
                    Verify & Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. Deactivate / Delete ABHA Modal */}
      {activeModal === 'deactivate_delete' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'grid', placeItems: 'center', padding: '20px'
        }}>
          <div 
            className={shakeModal ? 'shake-modal' : ''}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px',
              width: '100%', maxWidth: '480px', padding: '24px', boxShadow: 'var(--surface-shadow)',
              display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left',
              animation: shakeModal ? 'otp-shake 0.4s ease' : 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <ShieldAlert style={{ color: 'var(--danger)', width: '18px', height: '18px' }} />
                <span>Deactivate or Delete ABHA</span>
              </h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {deactivateConfirmed ? (
              <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                  <ShieldAlert style={{ width: '28px', height: '28px' }} />
                </div>
                <h4 style={{ margin: '0 0 6px', fontWeight: 800 }}>Account Closed</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>ABHA record updated. Terminating current active login session...</p>
              </div>
            ) : !deactivateOtpStep ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* Deactivate vs Delete Choice tab header */}
                <div style={{ display: 'flex', background: 'var(--bg-primary)', borderRadius: '10px', padding: '4px', border: '1px solid var(--border-color)' }}>
                  <button type="button" onClick={() => setDeactivateOption('deactivate')} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', background: deactivateOption === 'deactivate' ? 'rgba(239, 68, 68, 0.1)' : 'transparent', color: deactivateOption === 'deactivate' ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer' }}>
                    Deactivate Card
                  </button>
                  <button type="button" onClick={() => setDeactivateOption('delete')} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', background: deactivateOption === 'delete' ? 'rgba(239, 68, 68, 0.1)' : 'transparent', color: deactivateOption === 'delete' ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer' }}>
                    Delete Permanently
                  </button>
                </div>

                {/* Warnings List */}
                {deactivateOption === 'deactivate' ? (
                  <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.06)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.15)', fontSize: '11px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                    <strong style={{ display: 'block', color: 'var(--danger)', marginBottom: '6px' }}>⚠️ Temporary Deactivation Warnings:</strong>
                    <ul style={{ margin: 0, paddingLeft: '14px' }}>
                      <li>You will lose all access to the ABDM application temporarily.</li>
                      <li>You will no longer be able to share your health records over ABDM.</li>
                      <li>You will no longer be able to share health records with any Health Facility.</li>
                    </ul>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Temporary suggestion banner */}
                    <div style={{ background: 'rgba(20, 184, 166, 0.08)', border: '1px solid rgba(20, 184, 166, 0.25)', padding: '10px 14px', borderRadius: '10px', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                      💡 <strong>Suggestion:</strong> Rather than deleting permanently, you can temporarily <strong>deactivate your card</strong> instead, which preserves your data while locking active shares.
                    </div>
                    
                    <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.06)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.15)', fontSize: '11px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                      <strong style={{ display: 'block', color: 'var(--danger)', marginBottom: '6px' }}>🚨 Permanent Deletion Warnings:</strong>
                      <ul style={{ margin: 0, paddingLeft: '14px' }}>
                        <li>Your ABHA number will be permanently deleted, along with all your demographic details.</li>
                        <li>You will not be able to retrieve any information tagged to your ABHA number in the future.</li>
                        <li>You will never be able to access ABDM applications or any health records over ABDM network with this deleted number.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* OTP Method Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Send OTP Channel</span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <label style={{ flex: 1, padding: '8px', borderRadius: '8px', border: deactivateAuthMethod === 'aadhaar' ? '2px solid var(--danger)' : '1px solid var(--border-color)', background: deactivateAuthMethod === 'aadhaar' ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-primary)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', textAlign: 'center', color: 'var(--text-primary)' }}>
                      <input type="radio" checked={deactivateAuthMethod === 'aadhaar'} onChange={() => setDeactivateAuthMethod('aadhaar')} style={{ display: 'none' }} />
                      Aadhaar Mobile
                    </label>
                    <label style={{ flex: 1, padding: '8px', borderRadius: '8px', border: deactivateAuthMethod === 'abha' ? '2px solid var(--danger)' : '1px solid var(--border-color)', background: deactivateAuthMethod === 'abha' ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-primary)', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', textAlign: 'center', color: 'var(--text-primary)' }}>
                      <input type="radio" checked={deactivateAuthMethod === 'abha'} onChange={() => setDeactivateAuthMethod('abha')} style={{ display: 'none' }} />
                      ABHA Mobile
                    </label>
                  </div>
                </div>

                {deactivateError && <div style={{ color: 'var(--danger)', fontSize: '11.5px' }}>{deactivateError}</div>}
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button type="button" onClick={() => setActiveModal(null)} style={{ flex: 1, padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button onClick={handleDeactivateRequest} disabled={deactivateLoading} style={{ flex: 2, padding: '10px', border: 'none', borderRadius: '8px', background: 'var(--danger)', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}>
                    {deactivateLoading ? 'Requesting OTP...' : deactivateOption === 'deactivate' ? 'Deactivate ABHA Card' : 'Delete Permanent'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.06)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.15)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Confirm OTP sent to {deactivateAuthMethod === 'aadhaar' ? 'Aadhaar linked mobile' : 'ABHA linked mobile'}.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>Enter 6-Digit OTP</span>
                  <OtpInput value={deactivateOtp} onChange={(val) => { setDeactivateError(''); setDeactivateOtp(val); }} error={!!deactivateError} disabled={deactivateLoading} shake={shakeModal} onEnter={handleVerifyDeactivateOtp} />
                </div>
                {deactivateError && <div style={{ color: 'var(--danger)', fontSize: '11.5px' }}>{deactivateError}</div>}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setDeactivateOtpStep(false)} style={{ flex: 1, padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }}>
                    Back
                  </button>
                  <button onClick={handleVerifyDeactivateOtp} disabled={deactivateLoading || deactivateOtp.length !== 6} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: 'var(--danger)', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}>
                    Confirm Action
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. Delink Mobile Number Modal */}
      {activeModal === 'delink' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'grid', placeItems: 'center', padding: '20px'
        }}>
          <div 
            className={shakeModal ? 'shake-modal' : ''}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px',
              width: '100%', maxWidth: '440px', padding: '24px', boxShadow: 'var(--surface-shadow)',
              display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left',
              animation: shakeModal ? 'otp-shake 0.4s ease' : 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <UserMinus style={{ color: 'var(--danger)', width: '18px', height: '18px' }} />
                <span>Delink Mobile Number</span>
              </h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {!delinkOtpStep ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.06)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.15)', fontSize: '11.5px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                  <strong>⚠️ Delink Warning:</strong> If this ABHA number does not belong to you or your family members, you can opt to delink your mobile number, which will remove it from the ABHA record.
                </div>
                {delinkError && <div style={{ color: 'var(--danger)', fontSize: '11.5px' }}>{delinkError}</div>}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setActiveModal(null)} style={{ flex: 1, padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button onClick={handleRequestDelinkOtp} disabled={delinkLoading} style={{ flex: 2, padding: '10px', border: 'none', borderRadius: '8px', background: 'var(--danger)', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}>
                    {delinkLoading ? 'Requesting OTP...' : 'Proceed Delink OTP'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.06)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.15)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Enter OTP sent to your linked mobile to delink account permanently.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>Enter 6-Digit OTP</span>
                  <OtpInput value={delinkOtp} onChange={(val) => { setDelinkError(''); setDelinkOtp(val); }} error={!!delinkError} disabled={delinkLoading} shake={shakeModal} onEnter={handleVerifyDelinkOtp} />
                </div>
                {delinkError && <div style={{ color: 'var(--danger)', fontSize: '11.5px' }}>{delinkError}</div>}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setDelinkOtpStep(false)} style={{ flex: 1, padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }}>
                    Back
                  </button>
                  <button onClick={handleVerifyDelinkOtp} disabled={delinkLoading || delinkOtp.length !== 6} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: 'var(--danger)', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}>
                    Confirm Delink
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 9. Photo Crop Modal */}
      {activeModal === 'photo_crop_custom' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'grid', placeItems: 'center', padding: '20px'
        }}>
          <ImageCropper 
            imageSrc={rawImageToCrop}
            onCropComplete={(croppedBase64, sizeKb) => {
              setPhotoPreview(`data:image/jpeg;base64,${croppedBase64}`);
              setPhotoError('');
              setActiveModal(null);
            }}
            onCancel={() => {
              setRawImageToCrop('');
              setActiveModal(null);
            }}
          />
        </div>
      )}

      {/* 10. Response Details Modal */}
      {activeModal === 'photo_response_custom' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'grid', placeItems: 'center', padding: '20px'
        }}>
          <div 
            className="custom-bottom-sheet"
            style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '24px',
              width: '100%', maxWidth: '460px', padding: '24px', boxShadow: 'var(--surface-shadow)',
              display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left',
              position: 'relative', overflowY: 'auto', maxHeight: '85vh'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <Check style={{ color: photoResponseData && !photoResponseData.code ? 'var(--success)' : 'var(--danger)', width: '18px', height: '18px' }} />
                <span>Response Details</span>
              </h3>
              <button onClick={() => { setActiveModal(null); setPhotoResponseData(null); }} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Success / Failure Banner */}
              {photoResponseData && !photoResponseData.code ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px 16px', borderRadius: '12px' }}>
                  <Check style={{ color: 'var(--success)', width: '16px', height: '16px' }} />
                  <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>
                    Profile updated successfully on ABHA card
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px 16px', borderRadius: '12px' }}>
                  <AlertCircle style={{ color: 'var(--danger)', width: '16px', height: '16px' }} />
                  <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>
                    Gateway submission failed
                  </div>
                </div>
              )}

              {/* Data Table */}
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ background: 'var(--bg-primary)', padding: '10px 14px', borderBottom: '1px solid var(--border-color)', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                  API RESPONSE DATA
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '300px', overflowY: 'auto' }}>
                  {photoResponseData ? (
                    Object.entries(photoResponseData).map(([key, val]) => {
                      if (key === 'profilePhoto' || key === 'kycPhoto' || key === 'photo') {
                        return (
                          <div key={key} style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', fontSize: '11px', padding: '10px 14px', background: 'var(--bg-secondary)' }}>
                            <span style={{ width: '140px', fontWeight: 600, color: 'var(--text-secondary)', flexShrink: 0 }}>{key}</span>
                            <span style={{ color: 'var(--text-primary)', wordBreak: 'break-all', fontFamily: 'monospace', flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              [base64 image data - {(typeof val === 'string' ? val.length / 1024 : 0).toFixed(1)} KB]
                            </span>
                          </div>
                        );
                      }
                      return (
                        <div key={key} style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', fontSize: '11px', padding: '10px 14px', background: 'var(--bg-secondary)' }}>
                          <span style={{ width: '140px', fontWeight: 600, color: 'var(--text-secondary)', flexShrink: 0 }}>{key}</span>
                          <span style={{ color: 'var(--text-primary)', wordBreak: 'break-all', fontFamily: 'monospace', flex: 1 }}>
                            {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: '14px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
                      No data received.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sticky Actions Container at Bottom */}
            <div 
              className="sticky-actions-container"
              style={{ 
                display: 'flex', 
                gap: '10px', 
                marginTop: '12px', 
                borderTop: '1px solid var(--border-color)', 
                paddingTop: '16px' 
              }}
            >
              <button 
                type="button" 
                onClick={() => { setActiveModal(null); setPhotoResponseData(null); }} 
                style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '8px', background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: 'pointer', textAlign: 'center' }}
              >
                Close & Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
