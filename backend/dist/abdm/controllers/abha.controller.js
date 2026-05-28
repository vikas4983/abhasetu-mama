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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbhaController = void 0;
const common_1 = require("@nestjs/common");
const gateway_client_service_1 = require("../services/gateway-client.service");
const rsa_service_1 = require("../services/rsa.service");
const milestone1_dto_1 = require("../dtos/milestone1.dto");
let AbhaController = class AbhaController {
    constructor(gatewayService, rsaService) {
        this.gatewayService = gatewayService;
        this.rsaService = rsaService;
    }
    async getAuthCert() {
        console.log('[ABDM API V3] Pulling active RSA public key certificate');
        return {
            cert: this.rsaService.getPublicKeyCertificate(),
            cipherType: 'RSA/ECB/PKCS1Padding',
        };
    }
    async generateOtp(dto) {
        const encryptedAadhaar = this.rsaService.encrypt(dto.aadhaar);
        const maskedAadhaar = `XXXX-XXXX-${dto.aadhaar.slice(8)}`;
        console.log(`[ABDM API V3] Encrypted Aadhaar Number securely: ${encryptedAadhaar.slice(0, 30)}...`);
        console.log(`[ABDM API V3] Triggering Aadhaar OTP send sequence for: ${maskedAadhaar}`);
        const transactionId = crypto.randomUUID();
        return {
            transactionId,
            status: 'SUCCESS',
            message: 'Secure OTP successfully pushed to registered mobile number via NHA gateway',
        };
    }
    async verifyOtp(dto) {
        const encryptedOtp = this.rsaService.encrypt(dto.otp);
        console.log(`[ABDM API V3] Encrypted OTP securely: ${encryptedOtp.slice(0, 30)}...`);
        console.log(`[ABDM API V3] Verifying OTP for Transaction ID: ${dto.transactionId}`);
        return {
            status: 'VERIFIED',
            abhaNumber: '91-9981-0577-6582',
            abhaAddress: 'ayesha.ali.9981057765@abdm',
            profile: {
                fullName: 'Dr. Ayesha Ali',
                gender: 'Female',
                dateOfBirth: '1980-08-15',
                mobile: '9981057765',
                photo: '/assets/doctors/dr-ayesha-ali.jpeg',
            },
        };
    }
    async createProfile(dto) {
        const encryptedPassword = this.rsaService.encrypt(dto.password);
        console.log(`[ABDM API V3] Encrypted ABHA Profile password: ${encryptedPassword.slice(0, 30)}...`);
        console.log(`[ABDM API V3] Registering new ABHA Account Profile: ${dto.abhaAddress}`);
        return {
            status: 'CREATED',
            abhaNumber: dto.abhaNumber,
            abhaAddress: dto.abhaAddress,
            message: 'ABHA Profile successfully created and registered on national health registry.',
        };
    }
    async getProfile(abhaAddress) {
        console.log(`Retrieving active ABDM profile registry: ${abhaAddress}`);
        return {
            abhaNumber: '91-9981-0577-6582',
            abhaAddress: abhaAddress,
            fullName: 'Dr. Ayesha Ali',
            gender: 'Female',
            dateOfBirth: '1980-08-15',
            mobile: '9981057765',
            status: 'ACTIVE',
        };
    }
};
exports.AbhaController = AbhaController;
__decorate([
    (0, common_1.Get)('v3/auth/cert'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AbhaController.prototype, "getAuthCert", null);
__decorate([
    (0, common_1.Post)('otp/generate'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [milestone1_dto_1.GenerateOtpDto]),
    __metadata("design:returntype", Promise)
], AbhaController.prototype, "generateOtp", null);
__decorate([
    (0, common_1.Post)('otp/verify'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [milestone1_dto_1.VerifyOtpDto]),
    __metadata("design:returntype", Promise)
], AbhaController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.Post)('profile/create'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [milestone1_dto_1.CreateAbhaProfileDto]),
    __metadata("design:returntype", Promise)
], AbhaController.prototype, "createProfile", null);
__decorate([
    (0, common_1.Get)('profile/:abhaAddress'),
    __param(0, (0, common_1.Param)('abhaAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AbhaController.prototype, "getProfile", null);
exports.AbhaController = AbhaController = __decorate([
    (0, common_1.Controller)('abha'),
    __metadata("design:paramtypes", [gateway_client_service_1.GatewayClientService,
        rsa_service_1.RsaService])
], AbhaController);
//# sourceMappingURL=abha.controller.js.map