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
exports.ConsentController = void 0;
const common_1 = require("@nestjs/common");
let ConsentController = class ConsentController {
    async initConsentRequest(payload) {
        console.log(`[ABDM M2 Consent] Initiating gateway consent request for: ${payload.abhaAddress}`);
        const consentRequestId = crypto.randomUUID();
        return {
            status: 'REQUESTED',
            consentRequestId,
            message: 'ABDM Consent Request pushed successfully. Awaiting patient confirmation callback.',
            details: {
                purpose: payload.purposeCode || 'REFERRAL',
                hiTypes: payload.hiTypes || ['OPConsultation', 'Prescription'],
                expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            }
        };
    }
    async listConsents() {
        console.log('[ABDM M2 Consent] Pulling active consent registries');
        return [
            {
                consentId: 'abdm-consent-8812-99a0',
                abhaAddress: 'ayesha.ali@abdm',
                status: 'GRANTED',
                purpose: 'TELECONSULTATION',
                hiTypes: ['Prescription', 'OPConsultation'],
                validFrom: '2026-05-01T00:00:00Z',
                validTo: '2026-06-01T00:00:00Z',
                createdAt: new Date().toISOString(),
            },
            {
                consentId: 'abdm-consent-4402-12b1',
                abhaAddress: 'ayesha.ali@abdm',
                status: 'REQUESTED',
                purpose: 'OUTPATIENT_VISIT',
                hiTypes: ['DischargeSummary'],
                validFrom: '2026-05-28T00:00:00Z',
                validTo: '2026-06-28T00:00:00Z',
                createdAt: new Date().toISOString(),
            }
        ];
    }
};
exports.ConsentController = ConsentController;
__decorate([
    (0, common_1.Post)('request'),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConsentController.prototype, "initConsentRequest", null);
__decorate([
    (0, common_1.Get)('list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConsentController.prototype, "listConsents", null);
exports.ConsentController = ConsentController = __decorate([
    (0, common_1.Controller)('abha/consent')
], ConsentController);
//# sourceMappingURL=consent.controller.js.map