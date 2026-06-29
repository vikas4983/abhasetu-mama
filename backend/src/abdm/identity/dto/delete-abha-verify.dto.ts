/**
 * @file        delete-abha-verify.dto.ts
 * @description DTO for isolated ABHA delete verify (OTP or password)
 * @module      abdm/identity/dto
 * @layer       dto
 * @author      Platform Team
 * @created     2026-06-26
 */

import { IsArray, IsOptional, IsString, Length } from 'class-validator';

export class DeleteAbhaVerifyDto {
  @IsArray()
  @IsString({ each: true })
  reasons: string[];

  @IsOptional()
  @IsString()
  txnId?: string;

  @IsOptional()
  @IsString()
  @Length(6, 6)
  otp?: string;

  @IsOptional()
  @IsString()
  password?: string;
}
