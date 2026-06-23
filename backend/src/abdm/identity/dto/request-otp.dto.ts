import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

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
}
