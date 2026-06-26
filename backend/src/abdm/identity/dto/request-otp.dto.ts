import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class RequestOtpDto {
  @IsString()
  @IsNotEmpty()
  loginHint: string;

  @IsString()
  @IsNotEmpty()
  loginId: string;

  @IsString()
  @IsOptional()
  currentMobile?: string;

  @IsString()
  @IsOptional()
  txnId?: string;

  @IsArray()
  @IsOptional()
  scope?: string[];

  @IsString()
  @IsOptional()
  otpSystem?: string;
}
