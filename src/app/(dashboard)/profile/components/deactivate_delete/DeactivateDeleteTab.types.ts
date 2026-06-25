/**
 * @file        DeactivateDeleteTab.types.ts
 * @description Types and interfaces for the Deactivate/Delete Tab Component.
 * @module      profile/components/deactivate_delete
 * @layer       types
 * @author      Platform Team
 * @created     2026-06-24
 */

export interface DeactivateDeleteTabProps {
  deactivateOption: 'deactivate' | 'delete';
  setDeactivateOption: (opt: 'deactivate' | 'delete') => void;
  deactivateAuthMethod: 'aadhaar' | 'abha';
  setDeactivateAuthMethod: (method: 'aadhaar' | 'abha') => void;
  deactivateError: string;
  deactivateLoading: boolean;
  handleDeactivateRequest: () => Promise<void>;
}
