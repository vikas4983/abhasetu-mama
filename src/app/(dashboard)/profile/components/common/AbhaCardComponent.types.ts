/**
 * @file        AbhaCardComponent.types.ts
 * @description Types and interfaces for the shared, reusable ABHA Card Component.
 * @module      profile/components/common
 * @layer       types
 * @author      Platform Team
 * @created     2026-06-24
 */

export interface AbhaCardComponentProps {
  abhaProfile: {
    name?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    abhaNumber?: string;
    ABHANumber?: string;
    preferredAbhaAddress?: string;
    preferredAddress?: string;
    abhaAddress?: string;
    abhaId?: string;
    phrAddress?: string[];
    gender?: string;
    dob?: string;
    mobile?: string;
    districtName?: string;
    districtCode?: string;
    address?: string;
    stateName?: string;
    stateCode?: string;
    distLgd?: string;
    distlgd?: string;
    stateLgd?: string;
    statelgd?: string;
    profilePhoto?: string;
    photo?: string;
    kycPhoto?: string;
  };
  currentUser?: {
    name?: string;
    photo?: string;
  };
  getPhotoSrc: (photo: string | undefined) => string;
  getGenderDisplay?: (gender: string | undefined) => string;
  copyToClipboard: (text: string, fieldName: string) => void;
  triggerPhotoSelect?: () => void;
  triggerMobileEdit?: () => void;
  isEditable?: boolean;
  isBack?: boolean;
}
