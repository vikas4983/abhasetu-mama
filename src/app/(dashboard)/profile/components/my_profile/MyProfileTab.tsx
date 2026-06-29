import React, { useState } from 'react';
import { Download, Printer, CreditCard, Share2, Check, RefreshCw, AlertCircle, Pencil, X } from 'lucide-react';
import Badge from '../../../../../components/common/Badge';
import { AbhaCardComponent } from '../common/AbhaCardComponent';
import { MyProfileTabProps } from './MyProfileTab.types';
import * as S from './MyProfileTab.styles';

type PhotoLightbox = {
  src: string;
  title: string;
  editable?: boolean;
} | null;

export const MyProfileTab: React.FC<MyProfileTabProps> = ({
  abhaProfile,
  currentUser,
  t,
  getPhotoSrc,
  getProfilePhotoSrc,
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
  const [photoLightbox, setPhotoLightbox] = useState<PhotoLightbox>(null);

  const getFormattedProfile = () => {
    if (!profileDetails?.data) return abhaProfile;
    const data = profileDetails.data;
    const genderDisplay = data.gender === 'M' ? 'Male' : data.gender === 'F' ? 'Female' : data.gender || 'N/A';
    return {
      ...abhaProfile,
      ...data,
      dob: getDobString(data),
      gender: genderDisplay,
      profilePhoto: data.profilePhoto ?? abhaProfile.profilePhoto,
      kycPhoto: data.kycPhoto || abhaProfile.kycPhoto,
    };
  };

  const formattedProfile = getFormattedProfile();
  const data = profileDetails?.data;
  const displayName =
    data?.name ||
    formattedProfile.name ||
    [data?.firstName, data?.middleName, data?.lastName].filter(Boolean).join(' ') ||
    currentUser?.name ||
    '—';

  const openPhoto = (src: string | undefined, title: string, editable = false) => {
    if (!src) return;
    setPhotoLightbox({ src: getPhotoSrc(src), title, editable });
  };

  return (
    <S.TabContainer>
      <S.LayoutContainer>
        <S.WelcomeRow>
          <S.WelcomeTitle>
            Welcome, {displayName}
          </S.WelcomeTitle>
          <S.WelcomeLinksContainer>
            <S.ActionLinkButton onClick={fetchProfileDetails} disabled={profileDetailsLoading}>
              <RefreshCw
                style={{
                  width: '15px',
                  height: '15px',
                  color: '#c2410c',
                  animation: profileDetailsLoading ? 'spin 1s linear infinite' : 'none',
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

      {profileDetailsLoading && !profileDetails && (
        <S.LoadingContainer>
          <S.SpinnerLarge />
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>
            {t('Fetching secure profile data from ABDM...')}
          </p>
        </S.LoadingContainer>
      )}

      {profileDetailsError && !profileDetailsLoading && (
        <S.ErrorContainer>
          <S.ErrorTitleWrapper>
            <AlertCircle style={{ width: '20px', height: '20px' }} />
            <strong style={{ fontSize: '14px' }}>{t('Failed to fetch details')}</strong>
          </S.ErrorTitleWrapper>
          <p style={{ fontSize: '13px', margin: 0 }}>{profileDetailsError}</p>
          <S.ErrorButton onClick={fetchProfileDetails}>{t('Try Again')}</S.ErrorButton>
        </S.ErrorContainer>
      )}

      {profileDetails && data && (
        <S.InfoSection>
          <S.InfoSectionTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{t('Demographic Details')}</span>
            {(data.status === 'ACTIVE' || !data.status) && (
              <Badge variant="success" icon={<Check style={{ width: '10px', height: '10px' }} />}>
                {t('ACTIVE')}
              </Badge>
            )}
          </S.InfoSectionTitle>

          <S.MetadataGrid>
            <div>
              <S.GridLabel>{t('Name')}</S.GridLabel>
              <S.GridValueBlock style={{ fontWeight: 800 }}>{displayName}</S.GridValueBlock>
            </div>
            <div>
              <S.GridLabel>{t('Abha number')}</S.GridLabel>
              <S.GridValueBlock style={{ fontWeight: 800, fontFamily: 'monospace' }}>
                {data.ABHANumber || '—'}
              </S.GridValueBlock>
            </div>
            <div>
              <S.GridLabel>{t('Abha address')}</S.GridLabel>
              <S.GridValueBlock style={{ fontWeight: 800, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {data.preferredAbhaAddress || '—'}
              </S.GridValueBlock>
            </div>
            <div>
              <S.GridLabel>{t('Mobile number')}</S.GridLabel>
              <S.GridValueBlock>
                {data.mobile || '—'}
                {data.mobileVerified && (
                  <Check style={{ width: '12px', height: '12px', color: 'var(--accent-teal)', marginLeft: '4px', display: 'inline' }} />
                )}
              </S.GridValueBlock>
            </div>
            <div>
              <S.GridLabel>{t('Email address')}</S.GridLabel>
              <S.GridValueBlock>
                {data.email || t('Not linked')}
                {data.emailVerified && data.email && (
                  <span style={{ fontSize: '10px', color: 'var(--accent-teal)', marginLeft: '6px' }}>({t('Verified')})</span>
                )}
              </S.GridValueBlock>
            </div>
            <div>
              <S.GridLabel>{t('Gender')}</S.GridLabel>
              <S.GridValueBlock>{getGenderDisplay(data.gender)}</S.GridValueBlock>
            </div>
            <div>
              <S.GridLabel>{t('Date of birth')}</S.GridLabel>
              <S.GridValueBlock style={{ fontWeight: 800 }}>{getDobString(data)}</S.GridValueBlock>
            </div>
            <div>
              <S.GridLabel>{t('Verification status')}</S.GridLabel>
              <S.GridValueFlex>
                {data.verificationStatus === 'VERIFIED' ? (
                  <Check style={{ width: '14px', height: '14px', color: 'var(--accent-teal)' }} />
                ) : (
                  data.verificationStatus || '—'
                )}
              </S.GridValueFlex>
            </div>
            <div>
              <S.GridLabel>{t('Verification type')}</S.GridLabel>
              <S.GridValueBlock>
                {data.verificationType === 'AADHAAR' ? 'Aadhaar / आधार' : data.verificationType || '—'}
              </S.GridValueBlock>
            </div>
            <div>
              <S.GridLabel>{t('KYC verified')}</S.GridLabel>
              <S.GridValueFlex>
                {data.kycVerified ? (
                  <Check style={{ width: '14px', height: '14px', color: 'var(--accent-teal)' }} />
                ) : (
                  t('No')
                )}
              </S.GridValueFlex>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <S.GridLabel>{t('Full address')}</S.GridLabel>
              <S.GridValueLineHeight>
                <span style={{ display: 'block', fontWeight: 700 }}>{data.address || '—'}</span>
                {data.localizedDetails && (
                  <S.GridValueItalic>
                    {[data.localizedDetails.villageName || data.localizedDetails.townName, data.localizedDetails.wardName, data.localizedDetails.districtName, data.localizedDetails.stateName].filter(Boolean).join(', ')}
                  </S.GridValueItalic>
                )}
              </S.GridValueLineHeight>
            </div>
            <div>
              <S.GridLabel>{t('District & subdistrict')}</S.GridLabel>
              <S.GridValueBlock>
                {data.districtName || '—'}
                {data.subdistrictName ? ` (${data.subdistrictName})` : ''}
              </S.GridValueBlock>
            </div>
            <div>
              <S.GridLabel>{t('Town / village')}</S.GridLabel>
              <S.GridValueBlock>{data.townName || data.localizedDetails?.townName || '—'}</S.GridValueBlock>
            </div>
            <div>
              <S.GridLabel>{t('State')}</S.GridLabel>
              <S.GridValueBlock>{data.stateName || '—'}</S.GridValueBlock>
            </div>
            <div>
              <S.GridLabel>{t('Pin code')}</S.GridLabel>
              <S.GridValueBlock>{data.pincode || '—'}</S.GridValueBlock>
            </div>
            <div>
              <S.GridLabel>{t('Account status')}</S.GridLabel>
              <S.GridStatusValue $isActive={data.status === 'ACTIVE'}>{data.status || '—'}</S.GridStatusValue>
            </div>
            <div>
              <S.GridLabel>{t('Created date')}</S.GridLabel>
              <S.GridValueBlock>{data.createdDate || '—'}</S.GridValueBlock>
            </div>
            {data.source && (
              <div>
                <S.GridLabel>{t('Source')}</S.GridLabel>
                <S.GridValueBlock>{data.source}</S.GridValueBlock>
              </div>
            )}
          </S.MetadataGrid>

          <S.PhotosSection>
            <S.GridLabel style={{ marginBottom: '8px' }}>{t('ABHA verification photos')}</S.GridLabel>
            <S.PhotosFlex>
              <S.PhotoItemCard
                type="button"
                aria-label={t('View profile photo')}
                onClick={() => openPhoto(data.profilePhoto, t('Profile photo'), true)}
              >
                <S.PhotoThumbnail>
                  <img
                    src={getPhotoSrc(data.profilePhoto)}
                    alt={t('Profile photo')}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <S.PhotoEditBadge aria-hidden="true">
                    <Pencil style={{ width: '10px', height: '10px' }} />
                  </S.PhotoEditBadge>
                </S.PhotoThumbnail>
                <S.PhotoItemTextContainer>
                  <S.PhotoItemLabel>{t('Profile photo')}</S.PhotoItemLabel>
                  <S.PhotoItemName>{t('ABHA photo')}</S.PhotoItemName>
                </S.PhotoItemTextContainer>
              </S.PhotoItemCard>
              <S.PhotoItemCard
                type="button"
                aria-label={t('View KYC photo')}
                onClick={() => openPhoto(data.kycPhoto, t('KYC photo'))}
              >
                <S.PhotoThumbnail>
                  <img
                    src={getPhotoSrc(data.kycPhoto)}
                    alt={t('KYC photo')}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </S.PhotoThumbnail>
                <S.PhotoItemTextContainer>
                  <S.PhotoItemLabel>{t('KYC photo')}</S.PhotoItemLabel>
                  <S.PhotoItemName>{t('Aadhaar photo')}</S.PhotoItemName>
                </S.PhotoItemTextContainer>
              </S.PhotoItemCard>
            </S.PhotosFlex>
          </S.PhotosSection>

          <S.AuthMethodsSection>
            <S.GridLabel style={{ marginBottom: '6px' }}>{t('Available authentication methods')}</S.GridLabel>
            <S.AuthMethodsFlex>
              {data.authMethods?.map((method: string) => (
                <S.AuthMethodBadge key={method}>{method}</S.AuthMethodBadge>
              )) || <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{t('None')}</span>}
            </S.AuthMethodsFlex>
          </S.AuthMethodsSection>
        </S.InfoSection>
      )}

      {photoLightbox && (
        <S.LightboxOverlay
          role="dialog"
          aria-modal="true"
          aria-labelledby="photo-lightbox-title"
          onClick={() => setPhotoLightbox(null)}
        >
          <S.LightboxPanel onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong id="photo-lightbox-title" style={{ fontSize: '14px' }}>{photoLightbox.title}</strong>
              <button
                type="button"
                onClick={() => setPhotoLightbox(null)}
                aria-label={t('Close')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            <S.LightboxImage src={photoLightbox.src} alt={photoLightbox.title} />
            {photoLightbox.editable && (
              <button
                type="button"
                onClick={() => {
                  setPhotoLightbox(null);
                  triggerPhotoSelect();
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  alignSelf: 'center',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#2563eb',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Pencil style={{ width: '14px', height: '14px' }} />
                {t('Edit photo')}
              </button>
            )}
          </S.LightboxPanel>
        </S.LightboxOverlay>
      )}
    </S.TabContainer>
  );
};
