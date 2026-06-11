"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbdmController = void 0;
const common_1 = require("@nestjs/common");
const abdm_service_1 = require("./abdm.service");
const auth_service_1 = require("../auth/auth.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const crypto_service_1 = require("./crypto.service");
const crypto = __importStar(require("crypto"));
const express = __importStar(require("express"));
function getCookie(cookieHeader, name) {
    if (!cookieHeader)
        return '';
    const cookies = cookieHeader.split(';');
    for (const cookie of cookies) {
        const [key, val] = cookie.trim().split('=');
        if (key === name) {
            return decodeURIComponent(val || '');
        }
    }
    return '';
}
let AbdmController = class AbdmController {
    abdmService;
    authService;
    cryptoService;
    lastEmailRequestTime = new Map();
    constructor(abdmService, authService, cryptoService) {
        this.abdmService = abdmService;
        this.authService = authService;
        this.cryptoService = cryptoService;
    }
    async adminLogin(body) {
        const { email, password } = body;
        return this.authService.validateAndLogin(email, password);
    }
    async getSessions(res) {
        try {
            const result = await this.abdmService.getGatewaySession();
            if (result.status === 'success') {
                res.cookie('session_id', result.tokenPreview, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 3600 * 1000
                });
                res.cookie('public_key', result.publicKey || '', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 3600 * 1000
                });
            }
            return res.status(common_1.HttpStatus.OK).json(result);
        }
        catch (error) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                status: 'error',
                message: error.message || 'Failed to retrieve gateway session.'
            });
        }
    }
    async generateSession(res) {
        try {
            const result = await this.abdmService.generateSessionToken();
            if (result.status === 'success') {
                res.cookie('session_id', result.tokenPreview, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 3600 * 1000
                });
                try {
                    const config = await this.abdmService.getConfig();
                    res.cookie('public_key', config.ABDM_PUBLIC_KEY || '', {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                        maxAge: 3600 * 1000
                    });
                }
                catch (e) { }
            }
            return res.status(common_1.HttpStatus.OK).json(result);
        }
        catch (error) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                status: 'error',
                message: error.message || 'Failed to generate session token.'
            });
        }
    }
    async fetchPublicKey(res) {
        try {
            const result = await this.abdmService.syncPublicKeyFromGateway();
            if (result.status === 'success') {
                res.cookie('public_key', result.publicKey, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 3600 * 1000
                });
            }
            return res.status(common_1.HttpStatus.OK).json(result);
        }
        catch (error) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                status: 'error',
                message: error.message || 'Failed to sync public key.'
            });
        }
    }
    async enroll(body, res, req) {
        const { action, aadhaar, mobile, otp, txnId } = body;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        const userAgent = req.headers['user-agent'] || '';
        const context = { ip, userAgent };
        if (action === 'request-otp') {
            const result = await this.abdmService.requestAadhaarOtp(aadhaar, context);
            if (result.status === 'error') {
                return res.status(common_1.HttpStatus.BAD_REQUEST).json(result);
            }
            return res.status(common_1.HttpStatus.OK).json(result);
        }
        if (action === 'verify-otp') {
            const result = await this.abdmService.verifyAadhaarOtp(otp, txnId, mobile, aadhaar, context);
            if (result.status === 'error') {
                return res.status(common_1.HttpStatus.BAD_REQUEST).json(result);
            }
            return res.status(common_1.HttpStatus.OK).json(result);
        }
        if (action === 'request-mobile-otp') {
            const result = await this.abdmService.requestMobileOtp(mobile, undefined, context);
            if (result.status === 'error') {
                return res.status(common_1.HttpStatus.BAD_REQUEST).json(result);
            }
            return res.status(common_1.HttpStatus.OK).json(result);
        }
        if (action === 'verify-mobile-otp') {
            const result = await this.abdmService.verifyMobileOtp(otp, txnId, mobile, context);
            if (result.status === 'error') {
                return res.status(common_1.HttpStatus.BAD_REQUEST).json(result);
            }
            return res.status(common_1.HttpStatus.OK).json(result);
        }
        if (action === 'enrol-by-document') {
            const result = await this.abdmService.enrolByDocument(body, context);
            if (result.status === 'error') {
                return res.status(common_1.HttpStatus.BAD_REQUEST).json(result);
            }
            return res.status(common_1.HttpStatus.OK).json(result);
        }
        return res.status(common_1.HttpStatus.BAD_REQUEST).json({ status: 'error', message: 'Invalid onboarding action.' });
    }
    async v3RequestOtp(body, res, req) {
        const { loginHint, loginId } = body;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        const userAgent = req.headers['user-agent'] || '';
        const context = { ip, userAgent };
        if (loginHint === 'aadhaar') {
            const result = await this.abdmService.requestAadhaarOtp(loginId, context);
            if (result.status === 'error') {
                return res.status(common_1.HttpStatus.BAD_REQUEST).json(result);
            }
            return res.status(common_1.HttpStatus.OK).json({
                status: 'success',
                txnId: result.txnId,
                message: result.message || 'OTP sent to Aadhaar-linked mobile.'
            });
        }
        else if (loginHint === 'mobile') {
            if (body.currentMobile && loginId === body.currentMobile) {
                return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                    status: 'error',
                    message: 'New mobile number cannot be the same as your current mobile number.'
                });
            }
            const txnId = getCookie(req.headers.cookie, 'txn_id') || body.txnId || '';
            const result = await this.abdmService.requestMobileOtp(loginId, txnId, context);
            if (result.status === 'error') {
                return res.status(common_1.HttpStatus.BAD_REQUEST).json(result);
            }
            return res.status(common_1.HttpStatus.OK).json({
                status: 'success',
                txnId: result.txnId,
                message: result.message || 'OTP sent to mobile number.'
            });
        }
        return res.status(common_1.HttpStatus.BAD_REQUEST).json({ status: 'error', message: 'Invalid loginHint.' });
    }
    async v3EnrolByAadhaar(body, res, req) {
        const { txnId, authData } = body;
        const otp = authData?.otp?.otpValue;
        const mobile = authData?.otp?.mobile;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        const userAgent = req.headers['user-agent'] || '';
        const context = { ip, userAgent };
        const result = await this.abdmService.verifyAadhaarOtp(otp, txnId, mobile, undefined, context);
        if (result.status === 'error') {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json(result);
        }
        if (result.tokens?.token) {
            res.cookie('session_id', result.tokens.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: result.tokens.expiresIn * 1000
            });
            res.cookie('x_token', result.tokens.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: result.tokens.expiresIn * 1000
            });
        }
        if (result.tokens?.refreshToken) {
            res.cookie('refresh_token', result.tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: result.tokens.refreshExpiresIn * 1000
            });
        }
        try {
            const config = await this.abdmService.getConfig();
            if (config.ABDM_PUBLIC_KEY) {
                res.cookie('public_key', config.ABDM_PUBLIC_KEY, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 3600 * 1000
                });
            }
        }
        catch (e) { }
        if (result.txnId) {
            res.cookie('txn_id', result.txnId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 3600 * 1000
            });
        }
        return res.status(common_1.HttpStatus.OK).json(result);
    }
    async v3AuthByAbdm(body, res, req) {
        const { txnId, authData } = body;
        const otp = authData?.otp?.otpValue || body.otp?.otpValue;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        const userAgent = req.headers['user-agent'] || '';
        const context = { ip, userAgent };
        const result = await this.abdmService.verifyMobileOtp(otp, txnId, undefined, context);
        if (result.status === 'error') {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json(result);
        }
        if (result.tokens?.token) {
            res.cookie('session_id', result.tokens.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: result.tokens.expiresIn * 1000
            });
            res.cookie('x_token', result.tokens.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: result.tokens.expiresIn * 1000
            });
        }
        if (result.tokens?.refreshToken) {
            res.cookie('refresh_token', result.tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: result.tokens.refreshExpiresIn * 1000
            });
        }
        return res.status(common_1.HttpStatus.OK).json(result);
    }
    async v3ProfileLoginRequestOtp(body, res, req) {
        const { scope, loginHint, loginId, otpSystem } = body;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        const userAgent = req.headers['user-agent'] || '';
        const context = { ip, userAgent };
        const result = await this.abdmService.requestProfileLoginOtp(loginId, scope, loginHint, otpSystem, context);
        if (result.scope === 'Invalid Scope' || result.loginId === 'Invalid LoginId' || result.loginHint === 'Invalid Login Hint') {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json(result);
        }
        if (result.code === '900901') {
            return res.status(common_1.HttpStatus.UNAUTHORIZED).json(result);
        }
        if (result.status === 'error') {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json(result);
        }
        return res.status(common_1.HttpStatus.OK).json(result);
    }
    async v3ProfileLoginVerify(body, res, req) {
        const { scope, authData } = body;
        const otp = authData?.otp?.otpValue;
        const txnId = authData?.otp?.txnId;
        const authMethods = authData?.authMethods;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        const userAgent = req.headers['user-agent'] || '';
        const context = { ip, userAgent };
        const result = await this.abdmService.verifyProfileLoginOtp(otp, txnId, scope, authMethods, context);
        if (result.scope === 'Invalid Scope' || result.authMethods === 'Invalid Auth Method' || result.txnId === 'Invalid Transaction Id' || result.otpValue === 'Invalid OTP Value') {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json(result);
        }
        if (result.code === '900901') {
            return res.status(common_1.HttpStatus.UNAUTHORIZED).json(result);
        }
        if (result.authResult === 'failed') {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json(result);
        }
        if (result.status === 'error') {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json(result);
        }
        if (result.token) {
            res.cookie('x_token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: (result.expiresIn || 300) * 1000
            });
            res.cookie('session_id', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: (result.expiresIn || 300) * 1000
            });
        }
        return res.status(common_1.HttpStatus.OK).json(result);
    }
    async downloadAbhaCard(req, res) {
        const xToken = getCookie(req.headers.cookie, 'x_token');
        console.log('[downloadAbhaCard] X-Token cookie length:', xToken ? xToken.length : 0);
        if (!xToken) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                status: 'error',
                message: 'X-token is missing or expired. Please re-verify profile.'
            });
        }
        let gatewayToken = '';
        try {
            const sessionRes = await this.abdmService.getGatewaySession();
            gatewayToken = sessionRes.tokenPreview;
            console.log('[downloadAbhaCard] Gateway Session Token length:', gatewayToken ? gatewayToken.length : 0);
        }
        catch (err) {
            console.error('[downloadAbhaCard] Failed to retrieve gateway session:', err.message);
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                status: 'error',
                message: 'Failed to retrieve gateway session token: ' + err.message
            });
        }
        const result = await this.abdmService.downloadAbhaCard(xToken, gatewayToken);
        if (result.status === 'error') {
            console.error('[downloadAbhaCard] NHA Gateway returned error:', result.message, result.details);
            const code = result.details?.code || '400';
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                status: 'error',
                code: code,
                message: result.message,
                description: result.details?.description || result.message
            });
        }
        res.setHeader('Content-Type', result.contentType);
        res.setHeader('Content-Disposition', 'attachment; filename=abha-card.png');
        return res.send(Buffer.from(result.data));
    }
    async requestEmailVerificationLink(body, req, res) {
        const { email, currentEmail } = body;
        if (currentEmail && email === currentEmail) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                status: 'error',
                message: 'New email address cannot be the same as your current email address.'
            });
        }
        const xToken = getCookie(req.headers.cookie, 'x_token');
        if (!xToken) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                status: 'error',
                message: 'X-token is missing or expired. Please re-verify profile.'
            });
        }
        const now = Date.now();
        const lastRequest = this.lastEmailRequestTime.get(xToken);
        if (lastRequest && (now - lastRequest) < 60000) {
            const remaining = Math.ceil((60000 - (now - lastRequest)) / 1000);
            return res.status(common_1.HttpStatus.TOO_MANY_REQUESTS).json({
                status: 'error',
                message: `Please wait ${remaining} seconds before requesting another email verification link.`
            });
        }
        this.lastEmailRequestTime.set(xToken, now);
        let gatewayToken = '';
        try {
            const sessionRes = await this.abdmService.getGatewaySession();
            gatewayToken = sessionRes.tokenPreview;
        }
        catch (err) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                status: 'error',
                message: 'Failed to retrieve gateway session token: ' + err.message
            });
        }
        const result = await this.abdmService.requestEmailVerificationLink(email, xToken, gatewayToken);
        if (result.status === 'error') {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json(result);
        }
        return res.status(common_1.HttpStatus.OK).json(result);
    }
    async v3EnrolByDocument(body, res, req) {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        const userAgent = req.headers['user-agent'] || '';
        const context = { ip, userAgent };
        const txnId = body.txnId || '';
        const doc = body.authData?.document;
        const documentType = body.documentType || doc?.documentType || 'DRIVING_LICENCE';
        const documentId = body.documentId || doc?.documentId || '';
        const firstName = body.firstName || doc?.firstName || '';
        const middleName = body.middleName || doc?.middleName || '';
        const lastName = body.lastName || doc?.lastName || '';
        const dob = body.dob || doc?.dob || '';
        const gender = body.gender || doc?.gender || '';
        const frontSidePhoto = body.frontSidePhoto || doc?.frontSidePhoto || '';
        const backSidePhoto = body.backSidePhoto || doc?.backSidePhoto || '';
        const address = body.address || doc?.address || '';
        const state = body.state || doc?.state || '';
        const district = body.district || doc?.district || '';
        const pinCode = body.pinCode || doc?.pinCode || '';
        const mobile = body.mobile || doc?.mobile || '';
        const demographics = {
            txnId,
            documentType,
            documentId,
            firstName,
            middleName,
            lastName,
            dob,
            gender,
            frontSidePhoto,
            backSidePhoto,
            address,
            state,
            district,
            pinCode,
            mobile
        };
        const result = await this.abdmService.enrolByDocument(demographics, context);
        if (result.status === 'error') {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json(result);
        }
        return res.status(common_1.HttpStatus.OK).json(result);
    }
    async getConfig() {
        const config = await this.abdmService.getConfig();
        return { status: 'success', config };
    }
    async saveConfig(body) {
        return this.abdmService.saveConfig(body);
    }
    async getLogs() {
        const logs = await this.abdmService.getLogs();
        return { status: 'success', logs };
    }
    async addLog(body) {
        const { event, status, details } = body;
        await this.abdmService.addLog(event, status, details);
        return { status: 'success' };
    }
    async addTransaction(body) {
        return this.abdmService.addTransaction(body);
    }
    async getTransactions() {
        const transactions = await this.abdmService.getTransactions();
        return { status: 'success', transactions };
    }
    async getProducts() {
        const products = await this.abdmService.getProducts();
        return { status: 'success', products };
    }
    async addProduct(body) {
        return this.abdmService.saveProduct(body);
    }
    async updateProduct(body) {
        return this.abdmService.saveProduct(body);
    }
    async deleteProduct(id) {
        return this.abdmService.deleteProduct(id);
    }
    async getPolicies() {
        const policies = await this.abdmService.getPolicies();
        return { status: 'success', policies };
    }
    async addPolicy(body) {
        return this.abdmService.savePolicy(body);
    }
    async updatePolicy(body) {
        return this.abdmService.savePolicy(body);
    }
    async deletePolicy(id) {
        return this.abdmService.deletePolicy(id);
    }
    async getLabPackages() {
        const labPackages = await this.abdmService.getLabPackages();
        return { status: 'success', labPackages };
    }
    async addLabPackage(body) {
        return this.abdmService.saveLabPackage(body);
    }
    async updateLabPackage(body) {
        return this.abdmService.saveLabPackage(body);
    }
    async deleteLabPackage(id) {
        return this.abdmService.deleteLabPackage(id);
    }
    async hip(body, res, req) {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        const userAgent = req.headers['user-agent'] || '';
        const context = { ip, userAgent };
        const result = await this.abdmService.handleHip(body, context);
        if (result.status === 'error') {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json(result);
        }
        return res.status(common_1.HttpStatus.OK).json(result);
    }
    async consent(body, res, req) {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        const userAgent = req.headers['user-agent'] || '';
        const context = { ip, userAgent };
        const result = await this.abdmService.handleConsent(body, context);
        if (result.status === 'error') {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json(result);
        }
        return res.status(common_1.HttpStatus.OK).json(result);
    }
    async scanShare(body, res, req) {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        const userAgent = req.headers['user-agent'] || '';
        const context = { ip, userAgent };
        const result = await this.abdmService.handleScanShare(body, context);
        if (result.status === 'error') {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json(result);
        }
        return res.status(common_1.HttpStatus.OK).json(result);
    }
    async uhi(body, res, req) {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        const userAgent = req.headers['user-agent'] || '';
        const context = { ip, userAgent };
        const result = await this.abdmService.handleUhi(body, context);
        if (result.status === 'error') {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json(result);
        }
        return res.status(common_1.HttpStatus.OK).json(result);
    }
    async nhcx(body, res, req) {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        const userAgent = req.headers['user-agent'] || '';
        const context = { ip, userAgent };
        const result = await this.abdmService.handleNhcx(body, context);
        if (result.status === 'error') {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json(result);
        }
        return res.status(common_1.HttpStatus.OK).json(result);
    }
    async hpr(body, res, req) {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        const userAgent = req.headers['user-agent'] || '';
        const context = { ip, userAgent };
        const result = await this.abdmService.handleHpr(body, context);
        if (result.status === 'error') {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json(result);
        }
        return res.status(common_1.HttpStatus.OK).json(result);
    }
    async tests(res, req) {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        const userAgent = req.headers['user-agent'] || '';
        const context = { ip, userAgent };
        const result = await this.abdmService.runTests(context);
        if (result.status === 'error') {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json(result);
        }
        return res.status(common_1.HttpStatus.OK).json(result);
    }
    async getSpecialtiesMatrix(res) {
        try {
            const data = await this.abdmService.getSpecialtiesMatrix();
            return res.status(common_1.HttpStatus.OK).json({ status: 'success', specialties: data });
        }
        catch (error) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
        }
    }
    async getDoctors(medicalSystem, speciality, specialistRole, search, res) {
        try {
            const data = await this.abdmService.getDoctors(medicalSystem, speciality, specialistRole, search);
            return res.status(common_1.HttpStatus.OK).json({ status: 'success', doctors: data });
        }
        catch (error) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
        }
    }
    async saveDoctor(body, res) {
        try {
            const data = await this.abdmService.saveDoctor(body);
            return res.status(common_1.HttpStatus.OK).json(data);
        }
        catch (error) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
        }
    }
    async deleteDoctor(id, res) {
        try {
            const data = await this.abdmService.deleteDoctor(Number(id));
            return res.status(common_1.HttpStatus.OK).json(data);
        }
        catch (error) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
        }
    }
    async getDlSession(req, res) {
        try {
            const result = await this.abdmService.getDlGatewaySession();
            if (result && result.accessToken) {
                res.cookie('dl_access_token', result.accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: (result.expiresIn || 1200) * 1000
                });
                return res.status(common_1.HttpStatus.OK).json({ status: 'success', ...result });
            }
            throw new Error('Invalid gateway session response.');
        }
        catch (error) {
            const mockToken = 'mock-dl-access-token-jwt-style-abc123xyz';
            res.cookie('dl_access_token', mockToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 1200 * 1000
            });
            return res.status(common_1.HttpStatus.OK).json({
                status: 'success',
                accessToken: mockToken,
                expiresIn: 1200,
                refreshExpiresIn: 1800,
                refreshToken: 'mock-dl-refresh-token',
                tokenType: 'bearer',
                warning: 'Gateway call failed: ' + (error.message || 'unknown error') + '. Mock session used.'
            });
        }
    }
    async requestDlOtp(body, req, res) {
        try {
            const { mobileNumber, dlNumber } = body;
            const dlToken = getCookie(req.headers.cookie, 'dl_access_token');
            if (!dlToken) {
                return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                    status: 'error',
                    message: 'Driving License session (dl_access_token cookie) is missing or expired. Please request session first.'
                });
            }
            const result = await this.abdmService.requestDlOtp(mobileNumber, dlToken, {
                ip: req.ip,
                userAgent: req.headers['user-agent']
            });
            if (result.txnId) {
                res.cookie('dl_txn_id', result.txnId, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 3600 * 1000
                });
            }
            return res.status(common_1.HttpStatus.OK).json(result);
        }
        catch (error) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
        }
    }
    async verifyDlOtp(body, req, res) {
        try {
            const { otp } = body;
            const txnId = getCookie(req.headers.cookie, 'dl_txn_id');
            const result = await this.abdmService.verifyDlOtp(otp, txnId);
            if (result.status === 'error') {
                return res.status(common_1.HttpStatus.BAD_REQUEST).json(result);
            }
            return res.status(common_1.HttpStatus.OK).json(result);
        }
        catch (error) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
        }
    }
    async enrolByDl(body, req, res) {
        try {
            const dlToken = getCookie(req.headers.cookie, 'dl_access_token');
            if (!dlToken) {
                return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                    status: 'error',
                    message: 'DL Access Token cookie is missing or expired.'
                });
            }
            const result = await this.abdmService.enrolByDl(body);
            if (result.status === 'error') {
                return res.status(common_1.HttpStatus.BAD_REQUEST).json(result);
            }
            return res.status(common_1.HttpStatus.OK).json(result);
        }
        catch (error) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({ status: 'error', message: error.message });
        }
    }
    async getCryptoPublicKey(req) {
        let pubKey = getCookie(req.headers.cookie, 'public_key');
        if (!pubKey) {
            try {
                const config = await this.abdmService.getConfig();
                pubKey = config.ABDM_PUBLIC_KEY || '';
            }
            catch (e) { }
        }
        return { status: 'success', publicKey: pubKey };
    }
    async encryptData(body, req) {
        try {
            let pubKey = body.publicKey;
            if (!pubKey) {
                pubKey = getCookie(req.headers.cookie, 'public_key');
            }
            if (!pubKey) {
                try {
                    const config = await this.abdmService.getConfig();
                    pubKey = config.ABDM_PUBLIC_KEY || '';
                }
                catch (e) { }
            }
            if (!pubKey) {
                throw new Error('No active public key found. Please provide a public key or ensure a gateway session is active.');
            }
            const cipherText = this.cryptoService.encryptWithPublicKey(pubKey, body.plainText);
            return { status: 'success', cipherText };
        }
        catch (error) {
            return { status: 'error', message: error.message || 'Encryption failed.' };
        }
    }
    decryptData(body) {
        try {
            if (!body.privateKey) {
                throw new Error('Private key is required for decryption.');
            }
            const plainText = this.cryptoService.decryptWithPrivateKey(body.privateKey, body.cipherText);
            return { status: 'success', plainText };
        }
        catch (error) {
            return { status: 'error', message: error.message || 'Decryption failed.' };
        }
    }
    generateKeyPair() {
        try {
            const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
                modulusLength: 2048,
                publicKeyEncoding: {
                    type: 'spki',
                    format: 'pem'
                },
                privateKeyEncoding: {
                    type: 'pkcs8',
                    format: 'pem'
                }
            });
            return { status: 'success', publicKey, privateKey };
        }
        catch (error) {
            return { status: 'error', message: error.message || 'Key pair generation failed.' };
        }
    }
};
exports.AbdmController = AbdmController;
__decorate([
    (0, common_1.Post)('admin/login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "adminLogin", null);
__decorate([
    (0, common_1.Get)('sessions'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "getSessions", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('admin/session/generate'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "generateSession", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('admin/fetch-public-key'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "fetchPublicKey", null);
__decorate([
    (0, common_1.Post)('enroll'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "enroll", null);
__decorate([
    (0, common_1.Post)('v3/enrollment/request/otp'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "v3RequestOtp", null);
__decorate([
    (0, common_1.Post)('v3/enrollment/enrol/byAadhaar'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "v3EnrolByAadhaar", null);
__decorate([
    (0, common_1.Post)('v3/enrollment/auth/byAbdm'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "v3AuthByAbdm", null);
__decorate([
    (0, common_1.Post)('v3/profile/login/request/otp'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "v3ProfileLoginRequestOtp", null);
__decorate([
    (0, common_1.Post)('v3/profile/login/verify'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "v3ProfileLoginVerify", null);
__decorate([
    (0, common_1.Get)('v3/profile/account/abha-card'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "downloadAbhaCard", null);
__decorate([
    (0, common_1.Post)('v3/profile/account/request/emailVerificationLink'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "requestEmailVerificationLink", null);
__decorate([
    (0, common_1.Post)('v3/enrollment/enrol/byDocument'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "v3EnrolByDocument", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('admin/config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "getConfig", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('admin/config'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "saveConfig", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('admin/logs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "getLogs", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('admin/logs'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "addLog", null);
__decorate([
    (0, common_1.Post)('appointments/transaction'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "addTransaction", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('admin/transactions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)('pharmacy/products'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "getProducts", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('pharmacy/products'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "addProduct", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('pharmacy/products'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('pharmacy/products'),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "deleteProduct", null);
__decorate([
    (0, common_1.Get)('insurance/policies'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "getPolicies", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('insurance/policies'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "addPolicy", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('insurance/policies'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "updatePolicy", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('insurance/policies'),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "deletePolicy", null);
__decorate([
    (0, common_1.Get)('lab-tests/packages'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "getLabPackages", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('lab-tests/packages'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "addLabPackage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('lab-tests/packages'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "updateLabPackage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('lab-tests/packages'),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "deleteLabPackage", null);
__decorate([
    (0, common_1.Post)('hip'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "hip", null);
__decorate([
    (0, common_1.Post)('consent'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "consent", null);
__decorate([
    (0, common_1.Post)('scan-share'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "scanShare", null);
__decorate([
    (0, common_1.Post)('uhi'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "uhi", null);
__decorate([
    (0, common_1.Post)('nhcx'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "nhcx", null);
__decorate([
    (0, common_1.Post)('hpr'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "hpr", null);
__decorate([
    (0, common_1.Get)('tests'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "tests", null);
__decorate([
    (0, common_1.Get)('doctor-consultation/specialties'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "getSpecialtiesMatrix", null);
__decorate([
    (0, common_1.Get)('doctor-consultation/doctors'),
    __param(0, (0, common_1.Query)('medicalSystem')),
    __param(1, (0, common_1.Query)('speciality')),
    __param(2, (0, common_1.Query)('specialistRole')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "getDoctors", null);
__decorate([
    (0, common_1.Post)('doctor-consultation/doctors'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "saveDoctor", null);
__decorate([
    (0, common_1.Delete)('doctor-consultation/doctors'),
    __param(0, (0, common_1.Query)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "deleteDoctor", null);
__decorate([
    (0, common_1.Post)('v3/enrollment/dl/session'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "getDlSession", null);
__decorate([
    (0, common_1.Post)('v3/enrollment/dl/request/otp'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "requestDlOtp", null);
__decorate([
    (0, common_1.Post)('v3/enrollment/dl/verify/otp'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "verifyDlOtp", null);
__decorate([
    (0, common_1.Post)('v3/enrollment/enrol/byDl'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "enrolByDl", null);
__decorate([
    (0, common_1.Get)('crypto/public-key'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "getCryptoPublicKey", null);
__decorate([
    (0, common_1.Post)('crypto/encrypt'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "encryptData", null);
__decorate([
    (0, common_1.Post)('crypto/decrypt'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AbdmController.prototype, "decryptData", null);
__decorate([
    (0, common_1.Post)('crypto/generate-keypair'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AbdmController.prototype, "generateKeyPair", null);
exports.AbdmController = AbdmController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [abdm_service_1.AbdmService,
        auth_service_1.AuthService,
        crypto_service_1.CryptoService])
], AbdmController);
//# sourceMappingURL=abdm.controller.js.map