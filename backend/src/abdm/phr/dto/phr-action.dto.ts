/**
 * @file        phr-action.dto.ts
 * @description DTO for unified PHR action requests
 * @module      abdm/phr
 * @layer       dto
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class PhrActionDto {
  @IsString()
  action!: string;

  @IsOptional()
  @IsString()
  loginId?: string;

  @IsOptional()
  @IsString()
  txnId?: string;

  @IsOptional()
  @IsString()
  otp?: string;

  @IsOptional()
  @IsString()
  abhaAddress?: string;

  @IsOptional()
  @IsString()
  xToken?: string;

  @IsOptional()
  @IsString()
  pin?: string;

  @IsOptional()
  @IsString()
  oldPin?: string;

  @IsOptional()
  @IsString()
  newPin?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  consentRequestId?: string;

  @IsOptional()
  @IsString()
  lockerId?: string;

  @IsOptional()
  @IsArray()
  scope?: string[];

  @IsOptional()
  @IsBoolean()
  useAbhaProfile?: boolean;

  @IsOptional()
  @IsString()
  status?: string;
}
