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
const crypto_module_1 = require("./crypto/crypto.module");
const session_module_1 = require("./session/session.module");
const identity_module_1 = require("./identity/identity.module");
const hip_linking_module_1 = require("./hip-linking/hip-linking.module");
const consent_hiu_module_1 = require("./consent-hiu/consent-hiu.module");
const uhi_module_1 = require("./uhi/uhi.module");
const nhcx_module_1 = require("./nhcx/nhcx.module");
const hpr_module_1 = require("./hpr/hpr.module");
const clinical_module_1 = require("./clinical/clinical.module");
const admin_module_1 = require("./admin/admin.module");
const tests_module_1 = require("./tests/tests.module");
let AbdmModule = class AbdmModule {
};
exports.AbdmModule = AbdmModule;
exports.AbdmModule = AbdmModule = __decorate([
    (0, common_1.Module)({
        imports: [
            crypto_module_1.CryptoModule,
            session_module_1.SessionModule,
            identity_module_1.IdentityModule,
            hip_linking_module_1.HipLinkingModule,
            consent_hiu_module_1.ConsentHiuModule,
            uhi_module_1.UhiModule,
            nhcx_module_1.NhcxModule,
            hpr_module_1.HprModule,
            clinical_module_1.ClinicalModule,
            admin_module_1.AdminModule,
            tests_module_1.TestsModule,
        ],
        exports: [
            crypto_module_1.CryptoModule,
            session_module_1.SessionModule,
            identity_module_1.IdentityModule,
            hip_linking_module_1.HipLinkingModule,
            consent_hiu_module_1.ConsentHiuModule,
            uhi_module_1.UhiModule,
            nhcx_module_1.NhcxModule,
            hpr_module_1.HprModule,
            clinical_module_1.ClinicalModule,
            admin_module_1.AdminModule,
            tests_module_1.TestsModule,
        ],
    })
], AbdmModule);
//# sourceMappingURL=abdm.module.js.map