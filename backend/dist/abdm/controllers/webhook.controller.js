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
exports.WebhookController = void 0;
const common_1 = require("@nestjs/common");
let WebhookController = class WebhookController {
    async onConsentInit(payload, signature) {
        console.log(`[ABDM Webhook] Received /consent-requests/on-init callback`);
        return { status: 'ACCEPTED' };
    }
    async discoverCareContexts(payload) {
        const transactionId = payload?.transactionId;
        const patientAddress = payload?.patient?.id;
        console.log(`[ABDM Webhook] Care Context Discovery request for patient: ${patientAddress}, txn: ${transactionId}`);
        return { status: 'ACCEPTED' };
    }
    async initiateLinkage(payload) {
        const patientId = payload?.patient?.id;
        console.log(`[ABDM Webhook] Context Linkage initiation requested for patient: ${patientId}`);
        return { status: 'ACCEPTED' };
    }
};
exports.WebhookController = WebhookController;
__decorate([
    (0, common_1.Post)('consent-requests/on-init'),
    (0, common_1.HttpCode)(202),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-hip-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "onConsentInit", null);
__decorate([
    (0, common_1.Post)('care-contexts/discover'),
    (0, common_1.HttpCode)(202),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "discoverCareContexts", null);
__decorate([
    (0, common_1.Post)('links/link/init'),
    (0, common_1.HttpCode)(202),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "initiateLinkage", null);
exports.WebhookController = WebhookController = __decorate([
    (0, common_1.Controller)('v0.5')
], WebhookController);
//# sourceMappingURL=webhook.controller.js.map