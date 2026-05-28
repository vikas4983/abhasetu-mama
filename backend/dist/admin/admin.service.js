"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
let AdminService = class AdminService {
    async login(dto) {
        const { email, password } = dto;
        if (email === 'admin@abhasetu.com' && password === 'MasterAdminPassword1!') {
            const token = `ABHA_ADMIN_JWT_${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
            return {
                statusCode: 200,
                message: 'Master Admin authenticated successfully',
                accessToken: token,
                role: 'MASTER_ADMIN',
                expiresIn: 1800,
            };
        }
        throw new common_1.UnauthorizedException('Invalid administrator credentials. Access Denied.');
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)()
], AdminService);
//# sourceMappingURL=admin.service.js.map