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
exports.CryptoService = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
const elliptic_1 = require("elliptic");
const hash = require("hash.js");
const ShortCurve = require('elliptic/lib/elliptic/curve/short');
const BN = require('bn.js');
let CryptoService = class CryptoService {
    constructor() {
        const customCurveInstance = new ShortCurve({
            p: '7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffed',
            a: '2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa984914a144',
            b: '7b425ed097b425ed097b425ed097b425ed097b425ed097b4260b5e9c7710c864',
            n: '1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed',
        });
        const G = customCurveInstance.point('2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa984914a144', '7b425ed097b425ed097b425ed097b425ed097b425ed097b4260b5e9c7710c864');
        this.ecInstance = new elliptic_1.ec({
            curve: {
                curve: customCurveInstance,
                g: G,
                n: new BN('1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed', 16),
                hash: hash.sha256
            }
        });
    }
    generateKeyMaterial() {
        const keyPair = this.ecInstance.genKeyPair();
        const publicKeyBase64 = Buffer.from(keyPair.getPublic().encode('array', false)).toString('base64');
        const privateKeyBase64 = keyPair.getPrivate().toArrayLike(Buffer, 'be', 32).toString('base64');
        const nonce = crypto.randomBytes(32).toString('base64');
        return {
            publicKey: publicKeyBase64,
            privateKey: privateKeyBase64,
            nonce,
        };
    }
    computeSharedSecret(ourPrivateKey, theirPublicKey) {
        const ourKey = this.ecInstance.keyFromPrivate(Buffer.from(ourPrivateKey, 'base64'));
        const theirKey = this.ecInstance.keyFromPublic(Buffer.from(theirPublicKey, 'base64')).getPublic();
        const sharedPoint = ourKey.derive(theirKey);
        return sharedPoint.toArrayLike(Buffer, 'be', 32);
    }
    deriveSaltAndIV(ourNonce, theirNonce) {
        if (ourNonce.length !== 32 || theirNonce.length !== 32) {
            throw new Error('Nonces must be exactly 32 bytes.');
        }
        const xor = Buffer.alloc(32);
        for (let i = 0; i < 32; i++) {
            xor[i] = ourNonce[i] ^ theirNonce[i];
        }
        return {
            salt: xor.subarray(0, 20),
            iv: xor.subarray(20, 32),
        };
    }
    deriveSessionKey(sharedSecret, salt) {
        return Buffer.from(crypto.hkdfSync('sha256', sharedSecret, salt, Buffer.alloc(0), 32));
    }
    encryptPayload(payload, sessionKey, iv) {
        const cipher = crypto.createCipheriv('aes-256-gcm', sessionKey, iv);
        let encrypted = cipher.update(payload, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const tag = cipher.getAuthTag().toString('base64');
        const encryptedData = Buffer.from(encrypted, 'hex').toString('base64');
        return {
            encryptedData,
            tag,
        };
    }
    decryptPayload(encryptedData, sessionKey, iv, tag) {
        const decipher = crypto.createDecipheriv('aes-256-gcm', sessionKey, iv);
        decipher.setAuthTag(Buffer.from(tag, 'base64'));
        let decrypted = decipher.update(Buffer.from(encryptedData, 'base64').toString('hex'), 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
};
exports.CryptoService = CryptoService;
exports.CryptoService = CryptoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CryptoService);
//# sourceMappingURL=crypto.service.js.map