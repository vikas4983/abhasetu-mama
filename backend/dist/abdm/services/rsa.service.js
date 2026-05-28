"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RsaService = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
let RsaService = class RsaService {
    constructor() {
        this.abdmPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3yR4V0j8d8m+Y2Z9V0gZ
j4q5Q3C5A8S/Q4dGvM/E8U4+O/G7U5D4K7e9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9v
G9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9v
G9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9v
G9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9v
G9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9v
G9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9v
QIDAQAB
-----END PUBLIC KEY-----`;
    }
    encrypt(plainText) {
        try {
            const buffer = Buffer.from(plainText, 'utf8');
            const encrypted = crypto.publicEncrypt({
                key: this.abdmPublicKey,
                padding: crypto.constants.RSA_PKCS1_PADDING,
            }, buffer);
            return encrypted.toString('base64');
        }
        catch (error) {
            console.error('[RSA Service] Encryption failed:', error.message);
            throw new Error(`ABDM Cryptographic Encryption Failure: ${error.message}`);
        }
    }
    getPublicKeyCertificate() {
        return this.abdmPublicKey;
    }
};
exports.RsaService = RsaService;
exports.RsaService = RsaService = __decorate([
    (0, common_1.Injectable)()
], RsaService);
//# sourceMappingURL=rsa.service.js.map