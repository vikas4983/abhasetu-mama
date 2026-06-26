import { IsString, IsOptional, IsArray, IsIn } from 'class-validator';

/**
 * @description DTO for account action OTP requests (password, deactivate, delink)
 */
export class AccountActionOtpDto {
  @IsArray()
  scope: string[];

  @IsString()
  @IsIn(['aadhaar', 'mobile', 'abha-number'])
  loginHint: 'aadhaar' | 'mobile' | 'abha-number';

  @IsString()
  loginId: string;

  @IsString()
  @IsOptional()
  @IsIn(['aadhaar', 'abdm'])
  otpSystem?: 'aadhaar' | 'abdm';
}
