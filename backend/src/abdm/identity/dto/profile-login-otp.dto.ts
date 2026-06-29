import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class ProfileLoginOtpDto {
  @IsArray()
  @IsOptional()
  scope?: string[];

  @IsString()
  @IsNotEmpty()
  loginHint: string;

  @IsString()
  @IsNotEmpty()
  loginId: string;

  @IsString()
  @IsOptional()
  otpSystem?: string;
}
