/**
 * @file        deactivate-abha.constants.ts
 * @description BFF paths mirroring ABDM profile/account/request/otp + verify
 * @module      abha-deactivate
 * @layer       constants
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

/** @description ABDM gateway scope for temporary ABHA deactivate (Postman M1) */
export const ABHA_DEACTIVATE_SCOPE = ['abha-profile', 'de-activate'] as const;

/** @description Same path as ABDM — scope in body selects deactivate flow */
export const DEACTIVATE_ABHA_REQUEST_OTP_PATH = '/v3/profile/account/request/otp' as const;

/** @description Same path as ABDM — scope in body selects deactivate verify */
export const DEACTIVATE_ABHA_VERIFY_PATH = '/v3/profile/account/verify' as const;

/** @description Legacy BFF alias (backward compatible) */
export const DEACTIVATE_ABHA_REQUEST_OTP_ALIAS =
  '/v3/profile/account/deactivate/request-otp' as const;

/** @description Legacy BFF alias (backward compatible) */
export const DEACTIVATE_ABHA_VERIFY_ALIAS = '/v3/profile/account/deactivate/verify' as const;

/** @description Profile account API — source for ABHANumber before deactivate OTP */
export const PROFILE_ACCOUNT_PATH = '/v3/profile/account' as const;
