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
exports.HieController = void 0;
const common_1 = require("@nestjs/common");
const crypto_service_1 = require("../services/crypto.service");
let HieController = class HieController {
    constructor(cryptoService) {
        this.cryptoService = cryptoService;
    }
    async executeHieTransfer(payload) {
        console.log(`[ABDM M3 HIE] Executing secure Weierstrass clinical payload encryption for Consent ID: ${payload.consentId}`);
        const clinicalResource = payload.clinicalPayload || JSON.stringify({
            resourceType: 'Bundle',
            type: 'document',
            entry: [
                {
                    resourceType: 'Prescription',
                    id: 'rx-2026-9901',
                    status: 'active',
                    medicationCodeableConcept: { text: 'Amoxicillin 500mg TDS' },
                    authoredOn: new Date().toISOString()
                }
            ]
        }, null, 2);
        const hipMaterial = this.cryptoService.generateKeyMaterial();
        const hiuMaterial = this.cryptoService.generateKeyMaterial();
        const sharedSecretBuffer = this.cryptoService.computeSharedSecret(hipMaterial.privateKey, hiuMaterial.publicKey);
        const hipNonceBuf = Buffer.from(hipMaterial.nonce, 'base64');
        const hiuNonceBuf = Buffer.from(hiuMaterial.nonce, 'base64');
        const mixedMaterial = this.cryptoService.deriveSaltAndIV(hipNonceBuf, hiuNonceBuf);
        const sessionKey = this.cryptoService.deriveSessionKey(sharedSecretBuffer, mixedMaterial.salt);
        const encryptionOutput = this.cryptoService.encryptPayload(clinicalResource, sessionKey, mixedMaterial.iv);
        return {
            status: 'TRANSFERRED',
            consentId: payload.consentId,
            cipherSuite: 'AES-256-GCM',
            curveType: 'Weierstrass Short Curve25519 equivalent',
            fideliusParameters: {
                hipEphemeralPublicKey: hipMaterial.publicKey,
                hipNonce: hipMaterial.nonce,
                hiuEphemeralPublicKey: hiuMaterial.publicKey,
                hiuNonce: hiuMaterial.nonce,
                computedSharedSecretAgreedX: sharedSecretBuffer.toString('base64'),
                derivedSaltHex: mixedMaterial.salt.toString('hex'),
                derivedIvHex: mixedMaterial.iv.toString('hex'),
                derivedSessionKeyBase64: sessionKey.toString('base64'),
            },
            encryptedData: encryptionOutput.encryptedData,
            authTag: encryptionOutput.tag,
            message: 'Clinical FHIR resource packed and encrypted successfully compliant with DPDP Act 2023 Fidelius protocol.'
        };
    }
};
exports.HieController = HieController;
__decorate([
    (0, common_1.Post)('transfer'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HieController.prototype, "executeHieTransfer", null);
exports.HieController = HieController = __decorate([
    (0, common_1.Controller)('abha/hie'),
    __metadata("design:paramtypes", [crypto_service_1.CryptoService])
], HieController);
//# sourceMappingURL=hie.controller.js.map