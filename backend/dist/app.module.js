"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const abdm_module_1 = require("./abdm/abdm.module");
const db_module_1 = require("./database/db.module");
const auth_module_1 = require("./modules/auth/auth.module");
const abdm_integration_module_1 = require("./integrations/abdm/abdm-integration.module");
const abha_module_1 = require("./modules/abha/abha.module");
const consent_module_1 = require("./modules/consent/consent.module");
const records_module_1 = require("./modules/records/records.module");
const scan_share_module_1 = require("./modules/scan-share/scan-share.module");
const facility_module_1 = require("./modules/facility/facility.module");
const tenant_module_1 = require("./modules/tenant/tenant.module");
const webhooks_module_1 = require("./modules/webhooks/webhooks.module");
const audit_module_1 = require("./modules/audit/audit.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            db_module_1.DbModule,
            auth_module_1.AuthModule,
            abdm_integration_module_1.AbdmIntegrationModule,
            abdm_module_1.AbdmModule,
            abha_module_1.AbhaModule,
            consent_module_1.ConsentModule,
            records_module_1.RecordsModule,
            scan_share_module_1.ScanShareModule,
            facility_module_1.FacilityModule,
            tenant_module_1.TenantModule,
            webhooks_module_1.WebhooksModule,
            audit_module_1.AuditModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map