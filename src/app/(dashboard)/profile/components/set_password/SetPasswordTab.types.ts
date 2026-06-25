/**
 * @file        SetPasswordTab.types.ts
 * @description Types and interfaces for the Set Password Tab Component.
 * @module      profile/components/set_password
 * @layer       types
 * @author      Platform Team
 * @created     2026-06-24
 */

export interface SetPasswordTabProps {
  t: (key: string) => string;
  setActiveTab: (tab: any) => void;
  passSuccess: boolean;
  passAuthMethod: 'aadhaar' | 'abha';
  setPassAuthMethod: (method: 'aadhaar' | 'abha') => void;
  passwordForm: any;
  handleSetPasswordSubmit: (formData: any) => Promise<void>;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
  passError: string;
  passLoading: boolean;
}
