/**
 * @file        profile-account-request-otp.dto.ts
 * @description DTO for ABDM profile/account/request/otp (re-kyc, deactivate, delete by scope)
 * @module      abdm/identity/dto
 * @layer       dto
 * @author      Platform Team
 * @created     2026-06-26
 */

import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

export class ProfileAccountRequestOtpDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scope?: string[];

  @IsOptional()
  @IsString()
  abhaNumber?: string;

  /** @description ABHANumber attribute from profile account API */
  @IsOptional()
  @IsString()
  ABHANumber?: string;

  @IsOptional()
  @IsIn(['aadhaar', 'abdm'])
  otpSystem?: 'aadhaar' | 'abdm';

  @IsOptional()
  @IsString()
  loginHint?: string;
}
