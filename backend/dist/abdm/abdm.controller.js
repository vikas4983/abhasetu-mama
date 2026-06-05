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
const express = __importStar(require("express"));
let AbdmController = class AbdmController {
    abdmService;
    constructor(abdmService) {
        this.abdmService = abdmService;
    }
    async getSessions() {
        return this.abdmService.getGatewaySession();
    }
    async enroll(body, res) {
        const { action, aadhaar, otp, txnId } = body;
        if (action === 'request-otp') {
            const result = await this.abdmService.requestAadhaarOtp(aadhaar);
            if (result.status === 'error') {
                return res.status(common_1.HttpStatus.BAD_REQUEST).json(result);
            }
            return res.status(common_1.HttpStatus.OK).json(result);
        }
        if (action === 'verify-otp') {
            const result = await this.abdmService.verifyAadhaarOtp(otp, txnId);
            if (result.status === 'error') {
                return res.status(common_1.HttpStatus.BAD_REQUEST).json(result);
            }
            return res.status(common_1.HttpStatus.OK).json(result);
        }
        return res.status(common_1.HttpStatus.BAD_REQUEST).json({ status: 'error', message: 'Invalid onboarding action.' });
    }
    getConfig() {
        return this.abdmService.getConfig();
    }
    saveConfig(body) {
        return this.abdmService.saveConfig(body);
    }
    getLogs() {
        return this.abdmService.getLogs();
    }
    addLog(body) {
        const { event, status, details } = body;
        this.abdmService.addLog(event, status, details);
        return { status: 'success' };
    }
    getProducts() {
        return this.abdmService.getProducts();
    }
    addProduct(body) {
        return this.abdmService.saveProduct(body);
    }
    updateProduct(body) {
        return this.abdmService.saveProduct(body);
    }
    deleteProduct(id) {
        return this.abdmService.deleteProduct(id);
    }
    getPolicies() {
        return this.abdmService.getPolicies();
    }
    getLabPackages() {
        return this.abdmService.getLabPackages();
    }
};
exports.AbdmController = AbdmController;
__decorate([
    (0, common_1.Get)('sessions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "getSessions", null);
__decorate([
    (0, common_1.Post)('enroll'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AbdmController.prototype, "enroll", null);
__decorate([
    (0, common_1.Get)('admin/config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AbdmController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Post)('admin/config'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AbdmController.prototype, "saveConfig", null);
__decorate([
    (0, common_1.Get)('admin/logs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AbdmController.prototype, "getLogs", null);
__decorate([
    (0, common_1.Post)('admin/logs'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AbdmController.prototype, "addLog", null);
__decorate([
    (0, common_1.Get)('pharmacy/products'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AbdmController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Post)('pharmacy/products'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AbdmController.prototype, "addProduct", null);
__decorate([
    (0, common_1.Put)('pharmacy/products'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AbdmController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Delete)('pharmacy/products'),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AbdmController.prototype, "deleteProduct", null);
__decorate([
    (0, common_1.Get)('insurance/policies'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AbdmController.prototype, "getPolicies", null);
__decorate([
    (0, common_1.Get)('lab-tests/packages'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AbdmController.prototype, "getLabPackages", null);
exports.AbdmController = AbdmController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [abdm_service_1.AbdmService])
], AbdmController);
//# sourceMappingURL=abdm.controller.js.map