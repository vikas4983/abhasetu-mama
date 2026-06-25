/**
 * @file        EditProfileTab.tsx
 * @description Renders the 'Edit Profile' tab which contains mobile updating, email updating, and photo cropping components.
 * @module      profile/components/edit_profile
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-24
 * @modified    2026-06-24
 */

import React from 'react';
import { Phone, Mail, Camera, Pencil, Check, X } from 'lucide-react';
import { EditProfileTabProps } from './EditProfileTab.types';
import * as S from './EditProfileTab.styles';

/**
 * @description Component providing separate sub-tabs to edit mobile, email, and profile picture.
 * @param {EditProfileTabProps} props - Component properties
 * @returns {React.ReactElement} The rendered component
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
    <S.EditProfileContainer>
      <S.EditProfileCard>
        {/* Mobile close header */}
        <S.MobileHeader>
          <S.MobileHeaderTitle>
            {t('Edit Profile')}
          </S.MobileHeaderTitle>
          <S.CloseButton onClick={() => setActiveTab('my_profile')}>
            <X style={{ width: '20px', height: '20px' }} />
          </S.CloseButton>
        </S.MobileHeader>

        {/* Inner Sub-Tabs for Edit Profile */}
        <S.SubTabContainer>
          <S.SubTabButton
            type="button"
            onClick={() => setEditProfileSubTab('mobile')}
            $active={editProfileSubTab === 'mobile'}
          >
            <Phone style={{ width: '13px', height: '13px' }} />
            {t('Mobile')}
          </S.SubTabButton>
          <S.SubTabButton
            type="button"
            onClick={() => setEditProfileSubTab('email')}
            $active={editProfileSubTab === 'email'}
          >
            <Mail style={{ width: '13px', height: '13px' }} />
            {t('Email')}
          </S.SubTabButton>
          <S.SubTabButton
            type="button"
            onClick={() => setEditProfileSubTab('picture')}
            $active={editProfileSubTab === 'picture'}
          >
            <Camera style={{ width: '13px', height: '13px' }} />
            {t('Photo')}
          </S.SubTabButton>
        </S.SubTabContainer>

        {/* Sub-tab 1: Update Mobile Number */}
        {editProfileSubTab === 'mobile' && (
          <S.SubTabSection>
            <S.SectionTitle>
              <Phone style={{ color: 'var(--accent-teal)', width: '16px', height: '16px' }} />
              <span>Update Mobile Number</span>
            </S.SectionTitle>
            <S.FormContainer onSubmit={mobileForm.handleSubmit(handleMobileSubmit)}>
              <S.FormGroup>
                <S.InputLabel>Current Mobile Number</S.InputLabel>
                <S.MobileCurrentInput type="text" value={abhaProfile.mobile || 'N/A'} disabled />
              </S.FormGroup>
              <S.FormGroup>
                <S.ActiveInputLabel>New Mobile Number</S.ActiveInputLabel>
                <S.InputWrapper>
                  {(() => {
                    const { onChange: onMobileChange, ...mobileReg } = mobileForm.register('newMobile', {
                      required: t('Mobile number is required.'),
                      pattern: { value: /^\d{10}$/, message: t('Please enter a valid 10-digit mobile number.') },
                      validate: (val: string) => val !== abhaProfile.mobile || t('New mobile cannot be the same as current mobile.')
                    });
                    return (
                      <S.MobileNewInput 
                        type="tel" 
                        maxLength={10}
                        placeholder="Enter 10-digit mobile number" 
                        disabled={mobileLoading || mobileCoolingTimer > 0}
                        $error={!!mobileForm.formState.errors.newMobile || !!mobileError}
                        $valid={mobileForm.watch('newMobile')?.length === 10 && !mobileForm.formState.errors.newMobile}
                        {...mobileReg}
                        onChange={async (e) => {
                          const cleaned = e.target.value.replace(/\D/g, '');
                          e.target.value = cleaned;
                          await onMobileChange(e);
                          setMobileError('');
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
                </S.InputWrapper>
              </S.FormGroup>
              {mobileForm.formState.errors.newMobile && <S.ErrorText>{mobileForm.formState.errors.newMobile.message as string}</S.ErrorText>}
              {mobileError && <S.ErrorText>{mobileError}</S.ErrorText>}
              <S.SubmitButton 
                type="submit" 
                disabled={mobileLoading || mobileCoolingTimer > 0} 
              >
                {mobileLoading ? 'Sending...' : mobileCoolingTimer > 0 ? `Resend OTP in ${mobileCoolingTimer}s` : 'Request OTP / ओटीपी प्राप्त करें'}
              </S.SubmitButton>
            </S.FormContainer>
          </S.SubTabSection>
        )}

        {/* Sub-tab 2: Link & Verify Email */}
        {editProfileSubTab === 'email' && (
          <S.SubTabSection>
            <S.SectionTitle>
              <Mail style={{ color: 'var(--accent-teal)', width: '16px', height: '16px' }} />
              <span>Link & Verify Email</span>
            </S.SectionTitle>
            
            <S.FormContainer onSubmit={emailForm.handleSubmit(handleEmailSubmit)}>
              <S.FormGroup>
                <S.InputLabel>Current Email Address</S.InputLabel>
                <S.CurrentInput type="text" value={abhaProfile.email || 'Not verified'} disabled />
              </S.FormGroup>
              <S.FormGroup>
                <S.ActiveInputLabel>New Email Address</S.ActiveInputLabel>
                <S.InputWrapper>
                  <S.NewInput 
                    type="email" 
                    placeholder="Enter email address (e.g. name@domain.com)" 
                    disabled={emailLoading || emailCoolingTimer > 0}
                    $error={!!emailForm.formState.errors.newEmail || !!emailError}
                    $valid={emailForm.watch('newEmail') && !emailForm.formState.errors.newEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.watch('newEmail') || '')}
                    {...emailForm.register('newEmail', {
                      required: t('Email address is required.'),
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t('Please enter a valid email address (e.g. name@domain.com).') },
                      validate: (val: string) => val !== abhaProfile.email || t('New email cannot be the same as current email.')
                    })}
                  />
                  {/* Green check circle for valid filled state */}
                  {emailForm.watch('newEmail') && !emailForm.formState.errors.newEmail && !emailError && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.watch('newEmail') || '') && (
                    <img 
                      src="/assets/check_icon.png" 
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px' }} 
                      alt="Verified" 
                    />
                  )}
                </S.InputWrapper>
              </S.FormGroup>
              {emailForm.formState.errors.newEmail && <S.ErrorText>{emailForm.formState.errors.newEmail.message as string}</S.ErrorText>}
              {emailError && <S.ErrorText>{emailError}</S.ErrorText>}
              
              <S.SubmitButton 
                type="submit" 
                disabled={emailLoading || emailCoolingTimer > 0} 
              >
                {emailLoading ? 'Sending link...' : emailCoolingTimer > 0 ? `Resend Link in ${emailCoolingTimer}s` : 'Send Verification Link'}
              </S.SubmitButton>
            </S.FormContainer>

            {emailSent && (
              <S.EmailSentBox>
                <S.EmailSentIcon>
                  <Mail style={{ width: '20px', height: '20px' }} />
                </S.EmailSentIcon>
                <S.EmailSentTitle>Verification Link Sent</S.EmailSentTitle>
                <S.EmailSentDesc>
                  We have sent a verification email to <strong>{newEmail}</strong>. Please click the link inside the mail to verify.
                </S.EmailSentDesc>
              </S.EmailSentBox>
            )}
          </S.SubTabSection>
        )}

        {/* Sub-tab 3: Update Profile Photo */}
        {editProfileSubTab === 'picture' && (
          <S.SubTabSection>
            <S.SectionTitle>
              <Camera style={{ color: 'var(--accent-teal)', width: '16px', height: '16px' }} />
              <span>Update Profile Photo</span>
            </S.SectionTitle>
            
            <S.PhotoForm onSubmit={handlePhotoUploadSubmit}>
              {/* Single Large Photo Container */}
              <S.PhotoPreviewCard $hasPreview={!!photoPreview}>
                <S.PhotoImageWrapper>
                  <S.PhotoPreviewImage 
                    src={photoPreview || getPhotoSrc(abhaProfile.photo || abhaProfile.profilePhoto || currentUser?.photo)} 
                    alt="Profile photo"
                  />
                </S.PhotoImageWrapper>
                
                {/* Pencil button (blue) to upload/edit image */}
                <S.PhotoEditButton
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload Photo"
                >
                  <Pencil style={{ width: '14px', height: '14px' }} />
                </S.PhotoEditButton>
              </S.PhotoPreviewCard>

              <input 
                ref={fileInputRef}
                id="custom-file-upload-input"
                type="file" 
                accept="image/jpeg, image/jpg"
                onChange={handlePhotoFileChange} 
                style={{ display: 'none' }}
              />

              {/* Brief Instruction */}
              <S.PhotoInstruction>
                Please upload JPG, JPEG file types. Maximum size allowed for the attachment is 100KB.
              </S.PhotoInstruction>

              {photoError && <S.ErrorText>{photoError}</S.ErrorText>}

              {/* Once cropped, ask to save and upload */}
              {photoPreview && (
                <S.PhotoCroppedBox>
                  <S.PhotoCroppedText>
                    <Check style={{ width: '14px', height: '14px' }} />
                    <span>Photo cropped successfully! Click save to upload.</span>
                  </S.PhotoCroppedText>
                  
                  <S.PhotoCroppedActions>
                    <S.CancelButton 
                      type="button"
                      onClick={() => {
                        setPhotoPreview('');
                        setPhotoFile(null);
                      }}
                    >
                      Cancel
                    </S.CancelButton>
                    
                    <S.SaveButton 
                      type="submit" 
                      disabled={photoLoading} 
                    >
                      {photoLoading ? (
                        <>
                          <div className="spinner" style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                          <span>Saving...</span>
                        </>
                      ) : 'Save & Upload'}
                    </S.SaveButton>
                  </S.PhotoCroppedActions>
                </S.PhotoCroppedBox>
              )}
            </S.PhotoForm>
          </S.SubTabSection>
        )}

      </S.EditProfileCard>
    </S.EditProfileContainer>
  );
};
