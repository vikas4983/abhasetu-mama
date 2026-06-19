"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbdmModule = void 0;
const common_1 = require("@nestjs/common");
const abdm_service_1 = require("./abdm.service");
const crypto_service_1 = require("./crypto.service");
const auth_module_1 = require("../modules/auth/auth.module");
const tenant_module_1 = require("../modules/tenant/tenant.module");
const audit_module_1 = require("../modules/audit/audit.module");
const abha_module_1 = require("../modules/abha/abha.module");
const consent_module_1 = require("../modules/consent/consent.module");
const records_module_1 = require("../modules/records/records.module");
const scan_share_module_1 = require("../modules/scan-share/scan-share.module");
const admin_controller_1 = require("./controllers/admin.controller");
const sessions_controller_1 = require("./controllers/sessions.controller");
const enrollment_controller_1 = require("./controllers/enrollment.controller");
const profile_controller_1 = require("./controllers/profile.controller");
const catalog_controller_1 = require("./controllers/catalog.controller");
const doctor_controller_1 = require("./controllers/doctor.controller");
const gateway_controller_1 = require("./controllers/gateway.controller");
const crypto_controller_1 = require("./controllers/crypto.controller");
const utility_controller_1 = require("./controllers/utility.controller");
let AbdmModule = class AbdmModule {
};
exports.AbdmModule = AbdmModule;
exports.AbdmModule = AbdmModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            tenant_module_1.TenantModule,
            audit_module_1.AuditModule,
            abha_module_1.AbhaModule,
            consent_module_1.ConsentModule,
            records_module_1.RecordsModule,
            scan_share_module_1.ScanShareModule,
        ],
        controllers: [
            admin_controller_1.AbdmAdminController,
            sessions_controller_1.AbdmSessionController,
            enrollment_controller_1.AbdmEnrollmentController,
            profile_controller_1.AbdmProfileController,
            catalog_controller_1.AbdmCatalogController,
            doctor_controller_1.AbdmDoctorController,
            gateway_controller_1.AbdmGatewayController,
            crypto_controller_1.AbdmCryptoController,
            utility_controller_1.AbdmUtilityController,
        ],
        providers: [abdm_service_1.AbdmService, crypto_service_1.CryptoService],
        exports: [abdm_service_1.AbdmService],
    })
], AbdmModule);
//# sourceMappingURL=abdm.module.js.map