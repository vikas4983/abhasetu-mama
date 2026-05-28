"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAbhaProfileDto = exports.VerifyOtpDto = exports.GenerateOtpDto = exports.DL_REGEX = exports.EMAIL_REGEX = exports.UUID_REGEX = exports.PASSWORD_REGEX = exports.OTP_REGEX = exports.ABHA_NUMBER_REGEX = exports.ABHA_ADDRESS_REGEX = exports.DOB_REGEX = exports.MOBILE_REGEX = void 0;
const class_validator_1 = require("class-validator");
exports.MOBILE_REGEX = /^(\+91|0)?[1-9][0-9]{9}$/;
exports.DOB_REGEX = /^\d{4}-(0[0-9]|1[012])-(0[0-9]|[12][0-9]|3[01])$/;
exports.ABHA_ADDRESS_REGEX = /^[a-zA-Z0-9]+[._]?[a-zA-Z0-9]+$/;
exports.ABHA_NUMBER_REGEX = /^\d{2}-\d{4}-\d{4}-\d{4}$/;
exports.OTP_REGEX = /^[0-9]{6}$/;
exports.PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*-])[A-Za-z\d!@#$%^&*-]{8,}$/;
exports.UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
exports.EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,7}$/;
exports.DL_REGEX = /^[a-zA-Z0-9]+([-\s]{0,1})[a-zA-Z0-9]+$/;
class GenerateOtpDto {
}
exports.GenerateOtpDto = GenerateOtpDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{12}$/, { message: 'Aadhaar must be exactly 12 digits' }),
    __metadata("design:type", String)
], GenerateOtpDto.prototype, "aadhaar", void 0);
class VerifyOtpDto {
}
exports.VerifyOtpDto = VerifyOtpDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(exports.UUID_REGEX, { message: 'Transaction ID must be a valid UUID' }),
    __metadata("design:type", String)
], VerifyOtpDto.prototype, "transactionId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(exports.OTP_REGEX, { message: 'OTP must be exactly 6 numeric digits' }),
    __metadata("design:type", String)
], VerifyOtpDto.prototype, "otp", void 0);
class CreateAbhaProfileDto {
}
exports.CreateAbhaProfileDto = CreateAbhaProfileDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(exports.ABHA_NUMBER_REGEX, { message: 'ABHA Number must follow format 11-XXXX-XXXX-XXXX' }),
    __metadata("design:type", String)
], CreateAbhaProfileDto.prototype, "abhaNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(exports.ABHA_ADDRESS_REGEX, { message: 'ABHA Address must be 8-18 alphanumeric characters and start/end with letters' }),
    __metadata("design:type", String)
], CreateAbhaProfileDto.prototype, "abhaAddress", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAbhaProfileDto.prototype, "fullName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAbhaProfileDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(exports.DOB_REGEX, { message: 'DOB must be in YYYY-MM-DD format' }),
    __metadata("design:type", String)
], CreateAbhaProfileDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(exports.MOBILE_REGEX, { message: 'Mobile number must be a valid 10-digit Indian number' }),
    __metadata("design:type", String)
], CreateAbhaProfileDto.prototype, "mobile", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(exports.PASSWORD_REGEX, { message: 'Password must contain at least 8 chars, 1 uppercase, 1 digit, and 1 special character' }),
    __metadata("design:type", String)
], CreateAbhaProfileDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(exports.EMAIL_REGEX, { message: 'Email must be a valid email format' }),
    __metadata("design:type", String)
], CreateAbhaProfileDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(exports.DL_REGEX, { message: 'Driving license must contain only valid alphanumeric and optional divider' }),
    __metadata("design:type", String)
], CreateAbhaProfileDto.prototype, "drivingLicense", void 0);
//# sourceMappingURL=milestone1.dto.js.map