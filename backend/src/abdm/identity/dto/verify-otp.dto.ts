import { IsString, IsNotEmpty, IsOptional, IsObject, IsArray } from 'class-validator';

class ConsentDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  version?: string;
}

export class VerifyOtpDto {
  @IsString()
  @IsOptional()
  txnId?: string;

  @IsArray()
  @IsOptional()
  scope?: string[];

  @IsObject()
  @IsOptional()
  consent?: ConsentDto;

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
