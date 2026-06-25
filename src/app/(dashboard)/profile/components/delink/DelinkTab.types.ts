/**
 * @file        DelinkTab.types.ts
 * @description Types and interfaces for the Delink Tab Component.
 * @module      profile/components/delink
 * @layer       types
 * @author      Platform Team
 * @created     2026-06-24
 */

export interface DelinkTabProps {
  delinkError: string;
  handleRequestDelinkOtp: () => Promise<void>;
  delinkLoading: boolean;
}
