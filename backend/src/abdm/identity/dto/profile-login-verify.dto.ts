import { IsString, IsNotEmpty, IsOptional, IsArray, IsObject } from 'class-validator';

export class ProfileLoginVerifyDto {
  @IsArray()
  @IsNotEmpty()
  scope: string[];

  @IsString()
  @IsOptional()
  txnId?: string;

  @IsObject()
  @IsOptional()
  consent?: Record<string, unknown>;

  @IsObject()
  @IsNotEmpty()
  authData: {
    otp: {
      otpValue: string;
      txnId: string;
    };
    authMethods?: string[];
  };
}
