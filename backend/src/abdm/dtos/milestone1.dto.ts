import { IsString, Matches, IsOptional } from 'class-validator';

// 1. Mobile Number Regex
export const MOBILE_REGEX = /^(\+91|0)?[1-9][0-9]{9}$/;

// 2. Date of Birth Regex (YYYY-MM-DD)
export const DOB_REGEX = /^\d{4}-(0[0-9]|1[012])-(0[0-9]|[12][0-9]|3[01])$/;

// 3. ABHA Address Regex (8 to 18 characters, alphanumeric, optional dot or underscore)
export const ABHA_ADDRESS_REGEX = /^[a-zA-Z0-9]+[._]?[a-zA-Z0-9]+$/;

// 4. ABHA Number Regex (11-XXXX-XXXX-XXXX / \d{2}-\d{4}-\d{4}-\d{4})
export const ABHA_NUMBER_REGEX = /^\d{2}-\d{4}-\d{4}-\d{4}$/;

// 5. OTP Regex (exactly 6 digits)
export const OTP_REGEX = /^[0-9]{6}$/;

// 6. Password Regex (At least 8 chars, 1 uppercase, 1 digit, 1 special char from !@#$%^&*-)
export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*-])[A-Za-z\d!@#$%^&*-]{8,}$/;

// 7. UUID & Transaction ID Regex
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

// 8. Email Regex
export const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,7}$/;

// 9. Driving License Regex
export const DL_REGEX = /^[a-zA-Z0-9]+([-\s]{0,1})[a-zA-Z0-9]+$/;

export class GenerateOtpDto {
  @IsString()
  @Matches(/^\d{12}$/, { message: 'Aadhaar must be exactly 12 digits' })
  aadhaar: string;
}

export class VerifyOtpDto {
  @IsString()
  @Matches(UUID_REGEX, { message: 'Transaction ID must be a valid UUID' })
  transactionId: string;

  @IsString()
  @Matches(OTP_REGEX, { message: 'OTP must be exactly 6 numeric digits' })
  otp: string;
}

export class CreateAbhaProfileDto {
  @IsString()
  @Matches(ABHA_NUMBER_REGEX, { message: 'ABHA Number must follow format 11-XXXX-XXXX-XXXX' })
  abhaNumber: string;

  @IsString()
  @Matches(ABHA_ADDRESS_REGEX, { message: 'ABHA Address must be 8-18 alphanumeric characters and start/end with letters' })
  abhaAddress: string;

  @IsString()
  fullName: string;

  @IsString()
  gender: string;

  @IsString()
  @Matches(DOB_REGEX, { message: 'DOB must be in YYYY-MM-DD format' })
  dateOfBirth: string;

  @IsString()
  @Matches(MOBILE_REGEX, { message: 'Mobile number must be a valid 10-digit Indian number' })
  mobile: string;

  @IsString()
  @Matches(PASSWORD_REGEX, { message: 'Password must contain at least 8 chars, 1 uppercase, 1 digit, and 1 special character' })
  password: string;

  @IsString()
  @IsOptional()
  @Matches(EMAIL_REGEX, { message: 'Email must be a valid email format' })
  email?: string;

  @IsString()
  @IsOptional()
  @Matches(DL_REGEX, { message: 'Driving license must contain only valid alphanumeric and optional divider' })
  drivingLicense?: string;
}
