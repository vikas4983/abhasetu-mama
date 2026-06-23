import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class EnrollDto {
  @IsString()
  @IsNotEmpty()
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
}
