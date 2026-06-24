/**
 * @file        EditProfileTab.tsx
 * @description Renders the 'Edit Profile' tab which contains mobile updating, email updating, and photo cropping components.
 * @module      profile/components
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-24
 */

import React from 'react';
import { Phone, Mail, Camera, Pencil, Check, X } from 'lucide-react';

interface EditProfileTabProps {
  abhaProfile: any;
  currentUser: any;
  t: (key: string) => string;
  setActiveTab: (tab: any) => void;
  editProfileSubTab: 'mobile' | 'email' | 'picture';
  setEditProfileSubTab: (subTab: 'mobile' | 'email' | 'picture') => void;
  mobileLoading: boolean;
  mobileCoolingTimer: number;
  mobileForm: any;
  handleMobileSubmit: (formData: { newMobile: string }) => Promise<void>;
  mobileError: string;
  setMobileError: (err: string) => void;
  emailLoading: boolean;
  emailCoolingTimer: number;
  emailForm: any;
  handleEmailSubmit: (formData: { newEmail: string }) => Promise<void>;
  emailError: string;
  emailSent: boolean;
  newEmail: string;
  photoPreview: string;
  setPhotoPreview: (preview: string) => void;
  setPhotoFile: (file: File | null) => void;
  photoLoading: boolean;
  photoError: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handlePhotoUploadSubmit: (e: React.FormEvent) => Promise<void>;
  handlePhotoFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  getPhotoSrc: (photo: string | undefined) => string;
}

/**
 * Component providing separate sub-tabs to edit mobile, email, and profile picture.
 */
export const EditProfileTab: React.FC<EditProfileTabProps> = ({
  abhaProfile,
  currentUser,
  t,
  setActiveTab,
  editProfileSubTab,
  setEditProfileSubTab,
  mobileLoading,
  mobileCoolingTimer,
  mobileForm,
  handleMobileSubmit,
  mobileError,
  setMobileError,
  emailLoading,
  emailCoolingTimer,
  emailForm,
  handleEmailSubmit,
  emailError,
  emailSent,
  newEmail,
  photoPreview,
  setPhotoPreview,
  setPhotoFile,
  photoLoading,
  photoError,
  fileInputRef,
  handlePhotoUploadSubmit,
  handlePhotoFileChange,
  getPhotoSrc,
}) => {
  return (
    <div className="edit-profile-container">
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 900px) {
          .edit-profile-container {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            top: 0 !important;
            background: rgba(15, 23, 42, 0.6) !important;
            backdrop-filter: blur(8px) !important;
            z-index: 9995 !important;
            display: flex !important;
            align-items: flex-end !important;
            justify-content: center !important;
          }
          .edit-profile-card {
            border-bottom-left-radius: 0 !important;
            border-bottom-right-radius: 0 !important;
            border-top-left-radius: 24px !important;
            border-top-right-radius: 24px !important;
            width: 100% !important;
            max-width: 100% !important;
            background: var(--bg-card) !important;
            padding: 24px !important;
            animation: modal-slide-up 0.3s ease-out !important;
            box-shadow: 0 -10px 25px rgba(0,0,0,0.15) !important;
            max-height: 85vh !important;
            overflow-y: auto !important;
          }
          .edit-profile-mobile-header {
            display: flex !important;
          }
        }
      `}} />
      <div 
        className="edit-profile-card"
        style={{
          display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left',
          width: '100%'
        }}
      >
        {/* Mobile close header */}
        <div className="edit-profile-mobile-header" style={{ display: 'none', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {t('Edit Profile')}
          </h3>
          <button 
            onClick={() => setActiveTab('my_profile')} 
            style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Inner Sub-Tabs for Edit Profile */}
        <div style={{ 
          display: 'flex', 
          gap: '4px', 
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '4px',
          width: '100%',
          maxWidth: '440px',
          overflowX: 'auto'
        }}>
          <button
            type="button"
            onClick={() => setEditProfileSubTab('mobile')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: editProfileSubTab === 'mobile' ? 'var(--accent-teal)' : 'transparent',
              color: editProfileSubTab === 'mobile' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <Phone style={{ width: '13px', height: '13px' }} />
            {t('Mobile')}
          </button>
          <button
            type="button"
            onClick={() => setEditProfileSubTab('email')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: editProfileSubTab === 'email' ? 'var(--accent-teal)' : 'transparent',
              color: editProfileSubTab === 'email' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <Mail style={{ width: '13px', height: '13px' }} />
            {t('Email')}
          </button>
          <button
            type="button"
            onClick={() => setEditProfileSubTab('picture')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: editProfileSubTab === 'picture' ? 'var(--accent-teal)' : 'transparent',
              color: editProfileSubTab === 'picture' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <Camera style={{ width: '13px', height: '13px' }} />
            {t('Photo')}
          </button>
        </div>

        {/* Sub-tab 1: Update Mobile Number */}
        {editProfileSubTab === 'mobile' && (
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', animation: 'fadeIn 0.25s ease' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone style={{ color: 'var(--accent-teal)', width: '16px', height: '16px' }} />
              <span>Update Mobile Number</span>
            </h4>
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
                          opacity: (mobileLoading || mobileCoolingTimer > 0) ? 0.6 : 1,
                          cursor: (mobileLoading || mobileCoolingTimer > 0) ? 'not-allowed' : 'auto',
                          letterSpacing: '2px', fontSize: '13px'
                        }} 
                      />
                    );
                  })()}
                  {/* Green check circle for valid filled state */}
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
              <button 
                type="submit" 
                disabled={mobileLoading || mobileCoolingTimer > 0} 
                style={{ 
                  width: 'fit-content', padding: '10px 20px', borderRadius: '8px', border: 'none', 
                  background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: (mobileLoading || mobileCoolingTimer > 0) ? 'not-allowed' : 'pointer',
                  opacity: (mobileLoading || mobileCoolingTimer > 0) ? 0.7 : 1
                }}
              >
                {mobileLoading ? 'Sending...' : mobileCoolingTimer > 0 ? `Resend OTP in ${mobileCoolingTimer}s` : 'Request OTP / ओटीपी प्राप्त करें'}
              </button>
            </form>
          </div>
        )}

        {/* Sub-tab 2: Link & Verify Email */}
        {editProfileSubTab === 'email' && (
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', animation: 'fadeIn 0.25s ease' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail style={{ color: 'var(--accent-teal)', width: '16px', height: '16px' }} />
              <span>Link & Verify Email</span>
            </h4>
            
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
                  {/* Green check circle for valid filled state */}
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
                  width: 'fit-content', padding: '10px 20px', borderRadius: '8px', border: 'none', 
                  background: 'var(--accent-teal)', color: '#ffffff', fontWeight: 800, cursor: (emailLoading || emailCoolingTimer > 0) ? 'not-allowed' : 'pointer',
                  opacity: (emailLoading || emailCoolingTimer > 0) ? 0.7 : 1
                }}
              >
                {emailLoading ? 'Sending link...' : emailCoolingTimer > 0 ? `Resend Link in ${emailCoolingTimer}s` : 'Send Verification Link'}
              </button>
            </form>

            {emailSent && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'center', maxWidth: '400px', margin: '20px auto 0 auto', padding: '16px', background: 'rgba(20, 184, 166, 0.04)', borderRadius: '12px', border: '1px dashed var(--accent-teal)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(20, 184, 166, 0.1)', color: 'var(--accent-teal)', display: 'grid', placeItems: 'center', margin: '0 auto' }}>
                  <Mail style={{ width: '20px', height: '20px' }} />
                </div>
                <h5 style={{ margin: '4px 0 2px', fontWeight: 800 }}>Verification Link Sent</h5>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                  We have sent a verification email to <strong>{newEmail}</strong>. Please click the link inside the mail to verify.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Sub-tab 3: Update Profile Photo */}
        {editProfileSubTab === 'picture' && (
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', animation: 'fadeIn 0.25s ease' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Camera style={{ color: 'var(--accent-teal)', width: '16px', height: '16px' }} />
              <span>Update Profile Photo</span>
            </h4>
            
            <form onSubmit={handlePhotoUploadSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              {/* Single Large Photo Container */}
              <div style={{ position: 'relative', width: '140px', height: '175px', borderRadius: '12px', border: photoPreview ? '2px solid var(--accent-teal)' : '1px solid var(--border-color)', overflow: 'visible', background: 'var(--bg-primary)', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '10px', overflow: 'hidden' }}>
                  <img 
                    src={photoPreview || getPhotoSrc(abhaProfile.photo || abhaProfile.profilePhoto || currentUser?.photo)} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    alt="Profile photo"
                  />
                </div>
                
                {/* Pencil button (blue) to upload/edit image */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: 'absolute',
                    bottom: '-8px',
                    right: '-8px',
                    background: '#2563eb',
                    border: '2px solid #ffffff',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#ffffff',
                    boxShadow: '0 4px 6px rgba(37, 99, 235, 0.25)',
                    transition: 'all 0.2s ease',
                    zIndex: 10
                  }}
                  title="Upload Photo"
                >
                  <Pencil style={{ width: '14px', height: '14px' }} />
                </button>
              </div>

              <input 
                ref={fileInputRef}
                id="custom-file-upload-input"
                type="file" 
                accept="image/jpeg, image/jpg"
                onChange={handlePhotoFileChange} 
                style={{ display: 'none' }}
              />

              {/* Brief Instruction */}
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '300px', lineHeight: '1.4', margin: '0' }}>
                Please upload JPG, JPEG file types. Maximum size allowed for the attachment is 100KB.
              </p>

              {photoError && <div style={{ color: 'var(--danger)', fontSize: '11px', animation: 'fadeIn 0.2s' }}>{photoError}</div>}

              {/* Once cropped, ask to save and upload */}
              {photoPreview && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%', animation: 'fadeIn 0.25s ease' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--accent-teal)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check style={{ width: '14px', height: '14px' }} />
                    <span>Photo cropped successfully! Click save to upload.</span>
                  </span>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      type="button"
                      onClick={() => {
                        setPhotoPreview('');
                        setPhotoFile(null);
                      }}
                      style={{
                        padding: '10px 20px', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '8px', 
                        background: 'var(--bg-primary)', 
                        color: 'var(--text-primary)', 
                        fontWeight: 700, 
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Cancel
                    </button>
                    
                    <button 
                      type="submit" 
                      disabled={photoLoading} 
                      style={{ 
                        padding: '10px 24px', 
                        border: 'none', 
                        borderRadius: '8px', 
                        background: 'var(--accent-teal)', 
                        color: '#ffffff', 
                        fontWeight: 800, 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '12px',
                        boxShadow: '0 4px 12px rgba(20, 184, 166, 0.2)'
                      }}
                    >
                      {photoLoading ? (
                        <>
                          <div className="spinner" style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                          <span>Saving...</span>
                        </>
                      ) : 'Save & Upload'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
