import React from 'react';
import { Download, Printer, CreditCard, Share2, ChevronDown, ChevronRight, Check, RefreshCw, AlertCircle } from 'lucide-react';
import Badge from '../../../../../components/common/Badge';
import { AbhaCardComponent } from '../common/AbhaCardComponent';
import { MyProfileTabProps } from './MyProfileTab.types';
import * as S from './MyProfileTab.styles';

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
  profileDetails,
  profileDetailsLoading,
  profileDetailsError,
  fetchProfileDetails,
  getDobString,
}) => {
  // Pre-format profile data for the shared ABHA Card component using live details if available
  const getFormattedProfile = () => {
    if (!profileDetails?.data) return abhaProfile;
    const data = profileDetails.data;
    
    // Fallback logic for gender display matching the main page logic
    const genderDisplay = data.gender === 'M' ? 'Male' : data.gender === 'F' ? 'Female' : data.gender || 'N/A';
    
    return {
      ...abhaProfile,
      ...data,
      dob: getDobString(data),
      gender: genderDisplay,
      // Ensure photos are mapped correctly
      photo: data.profilePhoto || abhaProfile.photo || abhaProfile.profilePhoto,
      kycPhoto: data.kycPhoto || abhaProfile.kycPhoto,
    };
  };

  const formattedProfile = getFormattedProfile();

  return (
    <S.TabContainer>
      <S.LayoutContainer>
        {/* Welcome Header & Actions Row */}
        <S.WelcomeRow>
          <S.WelcomeTitle>
            Welcome, {formattedProfile.name || [formattedProfile.firstName, formattedProfile.middleName, formattedProfile.lastName].filter(Boolean).join(' ') || currentUser?.name || "Ashish Patel"}
          </S.WelcomeTitle>
          <S.WelcomeLinksContainer>
            <S.ActionLinkButton onClick={fetchProfileDetails} disabled={profileDetailsLoading}>
              <RefreshCw 
                style={{ 
                  width: '15px', 
                  height: '15px', 
                  color: '#c2410c',
                  animation: profileDetailsLoading ? 'spin 1s linear infinite' : 'none'
                }} 
              />
              <span>{profileDetailsLoading ? t('Refreshing...') : t('Refresh Details')}</span>
            </S.ActionLinkButton>
            <S.ActionLinkButton onClick={handleDownloadCard}>
              <Download style={{ width: '15px', height: '15px', color: '#c2410c' }} />
              <span>Download</span>
            </S.ActionLinkButton>
            <S.ActionLinkButton onClick={handlePrintCard}>
              <Printer style={{ width: '15px', height: '15px', color: '#c2410c' }} />
              <span>Print</span>
            </S.ActionLinkButton>
            <S.ActionLinkButton onClick={() => setActiveModal('print_pvc')}>
              <CreditCard style={{ width: '15px', height: '15px', color: '#c2410c' }} />
              <span>Print PVC</span>
            </S.ActionLinkButton>
            <S.ActionLinkButton onClick={handleShareCard}>
              <Share2 style={{ width: '15px', height: '15px', color: '#c2410c' }} />
              <span>Share</span>
            </S.ActionLinkButton>
          </S.WelcomeLinksContainer>
        </S.WelcomeRow>
        
        <S.CardCaptureWrapper id="abha-card-capture-profile">
          {/* Shared, reusable printable ABHA card */}
          <AbhaCardComponent
            abhaProfile={formattedProfile}
            currentUser={currentUser}
            getPhotoSrc={getPhotoSrc}
            getGenderDisplay={getGenderDisplay}
            copyToClipboard={copyToClipboard}
            triggerPhotoSelect={triggerPhotoSelect}
            triggerMobileEdit={triggerMobileEdit}
            isEditable={true}
          />
        </S.CardCaptureWrapper>
      </S.LayoutContainer>

      {/* Collapsible Demographics Card */}
      <S.CollapsibleCard>
        <S.ToggleButton onClick={() => setIsDemographicsExpanded(!isDemographicsExpanded)}>
          <S.ToggleLabelText>
            {isDemographicsExpanded ? (
              <ChevronDown style={{ width: '14px', height: '14px', color: 'var(--accent-teal)' }} />
            ) : (
              <ChevronRight style={{ width: '14px', height: '14px', color: 'var(--text-muted)' }} />
            )}
            <span>{t('Demographic Details')}</span>
          </S.ToggleLabelText>

          {/* ABHA Status Active badge if active */}
          {(formattedProfile.abhaStatus === 'ACTIVE' || formattedProfile.status === 'ACTIVE' || formattedProfile.abhaStatus === undefined) && (
            <Badge variant="success" icon={<Check style={{ width: '10px', height: '10px' }} />}>
              {t('ACTIVE')}
            </Badge>
          )}
        </S.ToggleButton>

        {isDemographicsExpanded && (
          <S.DemographicsContent>
            <div>
              <S.FieldLabel>{t('Mobile Number')}</S.FieldLabel>
              <S.FieldValue>{formattedProfile.mobile || 'N/A'}</S.FieldValue>
            </div>
            <div>
              <S.FieldLabel>{t('Email Address')}</S.FieldLabel>
              <S.FieldValue>{formattedProfile.email || 'Not verified'}</S.FieldValue>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <S.FieldLabel>{t('Street Address')}</S.FieldLabel>
              <S.FieldValue>{formattedProfile.address || 'N/A'}</S.FieldValue>
            </div>
            <div>
              <S.FieldLabel>{t('District & State')}</S.FieldLabel>
              <S.FieldValue>{(formattedProfile.districtName || formattedProfile.district) || 'N/A'}, {(formattedProfile.stateName || formattedProfile.state) || 'N/A'}</S.FieldValue>
            </div>
            <div>
              <S.FieldLabel>{t('Pin Code')}</S.FieldLabel>
              <S.FieldValue>{formattedProfile.pinCode || formattedProfile.pincode || 'N/A'}</S.FieldValue>
            </div>
          </S.DemographicsContent>
        )}
      </S.CollapsibleCard>

      {/* Live ABDM Profile Details Section */}
      {profileDetailsLoading && !profileDetails && (
        <S.LoadingContainer>
          <S.SpinnerLarge />
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>{t('Fetching secure profile data from ABDM...')}</p>
        </S.LoadingContainer>
      )}

      {profileDetailsError && !profileDetailsLoading && (
        <S.ErrorContainer>
          <S.ErrorTitleWrapper>
            <AlertCircle style={{ width: '20px', height: '20px' }} />
            <strong style={{ fontSize: '14px' }}>{t('Failed to fetch details')}</strong>
          </S.ErrorTitleWrapper>
          <p style={{ fontSize: '13px', margin: 0 }}>{profileDetailsError}</p>
          <S.ErrorButton onClick={fetchProfileDetails}>
            {t('Try Again')}
          </S.ErrorButton>
        </S.ErrorContainer>
      )}

      {profileDetails && (
        <S.InfoSection>
          <S.InfoSectionTitle>
            {t('Profile Information Details')}
          </S.InfoSectionTitle>
          
          <S.MetadataGrid>
            <div>
              <S.GridLabel>{t('Verification Status')}</S.GridLabel>
              <S.GridValueFlex>
                {profileDetails.data?.verificationStatus === 'VERIFIED' ? (
                  <Check style={{ width: '14px', height: '14px', color: 'var(--accent-teal)' }} />
                ) : (
                  profileDetails.data?.verificationStatus || 'N/A'
                )}
              </S.GridValueFlex>
            </div>

            <div>
              <S.GridLabel>{t('Verification Type')}</S.GridLabel>
              <S.GridValueBlock>
                {profileDetails.data?.verificationType === 'AADHAAR' ? 'AADHAAR / आधार' : (profileDetails.data?.verificationType || 'N/A')}
              </S.GridValueBlock>
            </div>

            <div>
              <S.GridLabel>{t('KYC Verified')}</S.GridLabel>
              <S.GridValueFlex>
                {profileDetails.data?.kycVerified ? (
                  <Check style={{ width: '14px', height: '14px', color: 'var(--accent-teal)' }} />
                ) : t('NO')}
              </S.GridValueFlex>
            </div>

            <div>
              <S.GridLabel>{t('Mobile Number')}</S.GridLabel>
              <S.GridValueBlock>
                {profileDetails.data?.mobile || 'N/A'}
              </S.GridValueBlock>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <S.GridLabel>{t('Full Address')}</S.GridLabel>
              <S.GridValueLineHeight>
                <span style={{ display: 'block', fontWeight: 700 }}>{profileDetails.data?.address || 'N/A'}</span>
                {profileDetails.data?.localizedDetails && (
                  <S.GridValueItalic>
                    {[profileDetails.data?.localizedDetails?.villageName || profileDetails.data?.localizedDetails?.townName, profileDetails.data?.localizedDetails?.wardName, profileDetails.data?.localizedDetails?.districtName, profileDetails.data?.localizedDetails?.stateName].filter(Boolean).join(', ')}
                  </S.GridValueItalic>
                )}
              </S.GridValueLineHeight>
            </div>

            <div>
              <S.GridLabel>{t('District & Subdistrict')}</S.GridLabel>
              <S.GridValueBlock>
                <span style={{ display: 'block' }}>{profileDetails.data?.districtName || 'N/A'} {profileDetails.data?.subdistrictName ? `(${profileDetails.data.subdistrictName})` : ''}</span>
                {profileDetails.data?.localizedDetails?.districtName && (
                  <S.GridValueSubText>
                    {profileDetails.data?.localizedDetails?.districtName}
                  </S.GridValueSubText>
                )}
              </S.GridValueBlock>
            </div>

            <div>
              <S.GridLabel>{t('State Name')}</S.GridLabel>
              <S.GridValueBlock>
                <span style={{ display: 'block' }}>{profileDetails.data?.stateName || 'N/A'}</span>
                {profileDetails.data?.localizedDetails?.stateName && (
                  <S.GridValueSubText>
                    {profileDetails.data?.localizedDetails?.stateName}
                  </S.GridValueSubText>
                )}
              </S.GridValueBlock>
            </div>

            <div>
              <S.GridLabel>{t('Pin Code')}</S.GridLabel>
              <S.GridValueBlock>
                {profileDetails.data?.pincode || 'N/A'}
              </S.GridValueBlock>
            </div>

            <div>
              <S.GridLabel>{t('Account Status')}</S.GridLabel>
              <S.GridStatusValue $isActive={profileDetails.data?.status === 'ACTIVE'}>
                {profileDetails.data?.status || 'N/A'}
              </S.GridStatusValue>
            </div>

            <div>
              <S.GridLabel>{t('Created Date')}</S.GridLabel>
              <S.GridValueBlock>
                {profileDetails.data?.createdDate || 'N/A'}
              </S.GridValueBlock>
            </div>
          </S.MetadataGrid>

          {/* Verification Photos Section */}
          <S.PhotosSection>
            <S.GridLabel style={{ marginBottom: '6px' }}>
              {t('ABHA Verification Photos')}
            </S.GridLabel>
            <S.PhotosFlex>
              <S.PhotoItemCard>
                <S.PhotoThumbnail>
                  <img 
                    src={getPhotoSrc(profileDetails.data?.profilePhoto)} 
                    alt="Profile Photo" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </S.PhotoThumbnail>
                <S.PhotoItemTextContainer>
                  <S.PhotoItemLabel>{t('Profile Photo')}</S.PhotoItemLabel>
                  <S.PhotoItemName>{t('ABHA Photo')}</S.PhotoItemName>
                </S.PhotoItemTextContainer>
              </S.PhotoItemCard>
              <S.PhotoItemCard>
                <S.PhotoThumbnail>
                  <img 
                    src={getPhotoSrc(profileDetails.data?.kycPhoto)} 
                    alt="KYC Photo" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </S.PhotoThumbnail>
                <S.PhotoItemTextContainer>
                  <S.PhotoItemLabel>{t('KYC Photo')}</S.PhotoItemLabel>
                  <S.PhotoItemName>{t('Aadhaar Photo')}</S.PhotoItemName>
                </S.PhotoItemTextContainer>
              </S.PhotoItemCard>
            </S.PhotosFlex>
          </S.PhotosSection>

          {/* Auth Methods List */}
          <S.AuthMethodsSection>
            <S.GridLabel style={{ marginBottom: '6px' }}>
              {t('Available Authentication Methods')}
            </S.GridLabel>
            <S.AuthMethodsFlex>
              {profileDetails.data?.authMethods?.map((method: string) => (
                <S.AuthMethodBadge key={method}>
                  {method}
                </S.AuthMethodBadge>
              )) || <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{t('None')}</span>}
            </S.AuthMethodsFlex>
          </S.AuthMethodsSection>
        </S.InfoSection>
      )}
    </S.TabContainer>
  );
};

