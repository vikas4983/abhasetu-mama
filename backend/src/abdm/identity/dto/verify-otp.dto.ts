import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsOptional()
  txnId?: string;

  @IsObject()
  @IsNotEmpty()
  authData: {
    otp: {
      otpValue: string;
      txnId?: string;
      mobile?: string;
    };
    authMethods?: string[];
  };
}
