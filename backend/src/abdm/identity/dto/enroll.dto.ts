import { IsString, IsOptional } from 'class-validator';

export class EnrollDto {
  @IsString()
  action: string;

  @IsString()
  @IsOptional()
  aadhaar?: string;

  @IsString()
  @IsOptional()
  mobile?: string;

  @IsString()
  @IsOptional()
  otp?: string;

  @IsString()
  @IsOptional()
  txnId?: string;

  // Allow document enrollment and other legacy fields through validation
  [key: string]: unknown;
}
