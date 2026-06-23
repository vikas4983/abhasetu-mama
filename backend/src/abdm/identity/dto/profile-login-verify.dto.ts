import { IsString, IsNotEmpty, IsOptional, IsArray, IsObject } from 'class-validator';

export class ProfileLoginVerifyDto {
  @IsArray()
  @IsNotEmpty()
  scope: string[];

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
