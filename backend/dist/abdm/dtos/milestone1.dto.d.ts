export declare const MOBILE_REGEX: RegExp;
export declare const DOB_REGEX: RegExp;
export declare const ABHA_ADDRESS_REGEX: RegExp;
export declare const ABHA_NUMBER_REGEX: RegExp;
export declare const OTP_REGEX: RegExp;
export declare const PASSWORD_REGEX: RegExp;
export declare const UUID_REGEX: RegExp;
export declare const EMAIL_REGEX: RegExp;
export declare const DL_REGEX: RegExp;
export declare class GenerateOtpDto {
    aadhaar: string;
}
export declare class VerifyOtpDto {
    transactionId: string;
    otp: string;
}
export declare class CreateAbhaProfileDto {
    abhaNumber: string;
    abhaAddress: string;
    fullName: string;
    gender: string;
    dateOfBirth: string;
    mobile: string;
    password: string;
    email?: string;
    drivingLicense?: string;
}
