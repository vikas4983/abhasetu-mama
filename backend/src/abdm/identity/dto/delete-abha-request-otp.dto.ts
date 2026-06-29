/**
 * @file        delete-abha-request-otp.dto.ts
 * @description DTO for isolated ABHA delete OTP request
 * @module      abdm/identity/dto
 * @layer       dto
 * @author      Platform Team
 * @created     2026-06-26
 */

import { IsIn, IsOptional, IsString } from 'class-validator';

export class DeleteAbhaRequestOtpDto {
  @IsOptional()
  @IsString()
  abhaNumber?: string;

  /** @description ABHANumber from GET /v3/profile/account — server re-validates and encrypts as loginId */
  @IsOptional()
  @IsString()
  ABHANumber?: string;

  @IsIn(['aadhaar', 'abdm'])
  otpSystem: 'aadhaar' | 'abdm';
}
