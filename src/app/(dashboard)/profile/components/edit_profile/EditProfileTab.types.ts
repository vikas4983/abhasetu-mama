/**
 * @file        EditProfileTab.types.ts
 * @description Types and interfaces for the Edit Profile Tab Component.
 * @module      profile/components/edit_profile
 * @layer       types
 * @author      Platform Team
 * @created     2026-06-24
 */

import React from 'react';

export interface EditProfileTabProps {
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
