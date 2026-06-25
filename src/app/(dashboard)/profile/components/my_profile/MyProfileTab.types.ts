/**
 * @file        MyProfileTab.types.ts
 * @description Types and interfaces for the My Profile Tab Component.
 * @module      profile/components/my_profile
 * @layer       types
 * @author      Platform Team
 * @created     2026-06-24
 * @modified    2026-06-24
 */

import { AbdmProfile } from '../../page';

export interface MyProfileTabProps {
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
  // Live profile details API integration
  profileDetails: { status: string; data: AbdmProfile } | null;
  profileDetailsLoading: boolean;
  profileDetailsError: string | null;
  fetchProfileDetails: () => Promise<void>;
  getDobString: (profileData: Partial<AbdmProfile> | undefined) => string;
}
