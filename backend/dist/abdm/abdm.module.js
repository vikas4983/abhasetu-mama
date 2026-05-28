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
const abha_controller_1 = require("./controllers/abha.controller");
const webhook_controller_1 = require("./controllers/webhook.controller");
const consent_controller_1 = require("./controllers/consent.controller");
const hie_controller_1 = require("./controllers/hie.controller");
const crypto_service_1 = require("./services/crypto.service");
const gateway_client_service_1 = require("./services/gateway-client.service");
const rsa_service_1 = require("./services/rsa.service");
let AbdmModule = class AbdmModule {
};
exports.AbdmModule = AbdmModule;
exports.AbdmModule = AbdmModule = __decorate([
    (0, common_1.Module)({
        controllers: [abha_controller_1.AbhaController, webhook_controller_1.WebhookController, consent_controller_1.ConsentController, hie_controller_1.HieController],
        providers: [crypto_service_1.CryptoService, gateway_client_service_1.GatewayClientService, rsa_service_1.RsaService],
        exports: [crypto_service_1.CryptoService, rsa_service_1.RsaService],
    })
], AbdmModule);
//# sourceMappingURL=abdm.module.js.map