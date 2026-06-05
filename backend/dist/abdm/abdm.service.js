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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbdmService = void 0;
const common_1 = require("@nestjs/common");
const crypto_service_1 = require("./crypto.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const axios_1 = __importDefault(require("axios"));
let AbdmService = class AbdmService {
    cryptoService;
    dbPath = path.join(process.cwd(), '../src/data/db.json');
    constructor(cryptoService) {
        this.cryptoService = cryptoService;
    }
    readDb() {
        try {
            if (!fs.existsSync(this.dbPath)) {
                return { config: {}, auditLogs: [], products: [], policies: [], labPackages: [] };
            }
            const raw = fs.readFileSync(this.dbPath, 'utf8');
            return JSON.parse(raw);
        }
        catch (e) {
            return { config: {}, auditLogs: [], products: [], policies: [], labPackages: [] };
        }
    }
    writeDb(data) {
        try {
            fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2), 'utf8');
        }
        catch (e) {
            console.error('Failed to write to static DB:', e);
        }
    }
    getConfig() {
        const db = this.readDb();
        return db.config || {};
    }
    saveConfig(newConfig) {
        const db = this.readDb();
        db.config = { ...db.config, ...newConfig };
        this.writeDb(db);
        return { status: 'success', message: 'Config updated successfully' };
    }
    getLogs() {
        const db = this.readDb();
        return db.auditLogs || [];
    }
    addLog(event, status, details) {
        const db = this.readDb();
        if (!db.auditLogs)
            db.auditLogs = [];
        db.auditLogs.unshift({
            id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            timestamp: new Date().toISOString(),
            event,
            status,
            details,
        });
        if (db.auditLogs.length > 100) {
            db.auditLogs = db.auditLogs.slice(0, 100);
        }
        this.writeDb(db);
    }
    getProducts() {
        return this.readDb().products || [];
    }
    saveProduct(product) {
        const db = this.readDb();
        if (!db.products)
            db.products = [];
        if (product.id) {
            const idx = db.products.findIndex((p) => p.id === product.id);
            if (idx !== -1) {
                db.products[idx] = { ...db.products[idx], ...product };
            }
            else {
                return { status: 'error', message: 'Product not found' };
            }
        }
        else {
            const newProduct = {
                ...product,
                id: `MED-${Date.now()}`,
            };
            db.products.push(newProduct);
        }
        this.writeDb(db);
        return { status: 'success', data: product };
    }
    deleteProduct(id) {
        const db = this.readDb();
        if (!db.products)
            db.products = [];
        db.products = db.products.filter((p) => p.id !== id);
        this.writeDb(db);
        return { status: 'success' };
    }
    getPolicies() {
        return this.readDb().policies || [];
    }
    getLabPackages() {
        return this.readDb().labPackages || [];
    }
    async getGatewaySession() {
        const config = this.getConfig();
        const clientId = config.ABDM_CLIENT_ID || '';
        const clientSecret = config.ABDM_CLIENT_SECRET || '';
        if (!clientId || !clientSecret) {
            return {
                status: 'success',
                sandboxMode: true,
                tokenPreview: 'sbx-jwt-simulated-access-token-placeholder',
            };
        }
        try {
            const response = await axios_1.default.post('https://dev.abdm.gov.in/api/hiecm/gateway/v3/sessions', {
                clientId,
                clientSecret,
                grantType: 'client_credentials',
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'REQUEST-ID': crypto.randomUUID(),
                    TIMESTAMP: new Date().toISOString(),
                },
            });
            return {
                status: 'success',
                sandboxMode: true,
                tokenPreview: response.data.accessToken,
            };
        }
        catch (err) {
            console.warn('ABDM Sandbox Gateway offline or rejected credentials. Falling back to simulation.', err.message);
            return {
                status: 'success',
                sandboxMode: true,
                tokenPreview: `sbx-jwt-simulated-fallback-${clientId.slice(0, 5)}`,
            };
        }
    }
    async fetchLivePublicKey(token) {
        if (!token || token.startsWith('sbx-jwt-simulated-access-token-placeholder') || token.startsWith('sbx-jwt-simulated-fallback-')) {
            return 'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAstWB95C5pHLXiYW59qyO4Xb+59KYVm9Hywbo77qETZVAyc6VIsxU+UWhd/k/YtjZibCznB+HaXWX9TVTFs9Nwgv7LRGq5uLczpZQDrU7dnGkl/urRA8p0Jv/f8T0MZdFWQgks91uFffeBmJOb58u68ZRxSYGMPe4hb9XXKDVsgoSJaRNYviH7RgAI2QhTCwLEiMqIaUX3p1SAc178ZlN8qHXSSGXvhDR1GKM+y2DIyJqlzfik7lD14mDY/I4lcbftib8cv7llkybtjX1AayfZp4XpmIXKWv8nRM488/jOAF81Bi13paKgpjQUUuwq9tb5Qd/DChytYgBTBTJFe7irDFCmTIcqPr8+IMB7tXA3YXPp3z605Z6cGoYxezUm2Nz2o6oUmarDUntDhq/PnkNergmSeSvS8gD9DHBuJkJWZweG3xOPXiKQAUBr92mdFhJGm6fitO5jsBxgpmulxpG0oKDy9lAOLWSqK92JMcbMNHn4wRikdI9HSiXrrI7fLhJYTbyU3I4v5ESdEsayHXuiwO/1C8y56egzKSw44GAtEpbAkTNEEfK5H5R0QnVBIXOvfeF4tzGvmkfOO6nNXU3o/WAdOyV3xSQ9dqLY5MEL4sJCGY1iJBIAQ452s8v0ynJG5Yq+8hNhsCVnklCzAlsIzQpnSVDUVEzv17grVAw078CAwEAAQ==';
        }
        try {
            const response = await axios_1.default.get('https://abhasbx.abdm.gov.in/abha/api/v3/profile/public/certificate', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'REQUEST-ID': crypto.randomUUID(),
                    TIMESTAMP: new Date().toISOString(),
                    'X-CM-ID': 'sbx',
                },
            });
            return response.data.publicKey || '';
        }
        catch (err) {
            console.warn('Failed to fetch ABDM public key certificate:', err.message);
            throw new Error(`Failed to fetch ABDM public key certificate: ${err.message}`);
        }
    }
    async requestAadhaarOtp(aadhaar) {
        if (!aadhaar || aadhaar.length !== 12 || !/^\d+$/.test(aadhaar)) {
            return { status: 'error', message: 'Invalid 12-digit Aadhaar number.' };
        }
        const sessionRes = await this.getGatewaySession();
        const token = sessionRes.tokenPreview;
        let publicKey = '';
        try {
            publicKey = await this.fetchLivePublicKey(token);
        }
        catch (e) {
            return { status: 'error', message: e.message || 'Failed to fetch ABDM public key certificate' };
        }
        const encryptedAadhaar = this.cryptoService.encryptWithPublicKey(publicKey, aadhaar);
        const txnId = crypto.randomUUID();
        const enrollmentUrl = 'https://abhasbx.abdm.gov.in/abha/api/v3/enrollment/request/otp';
        try {
            if (!token || token.startsWith('sbx-jwt-simulated-access-token-placeholder') || token.startsWith('sbx-jwt-simulated-fallback-')) {
                throw new Error('Simulated mode');
            }
            await axios_1.default.post(enrollmentUrl, {
                txnId: '',
                scope: ['abha-enrol'],
                loginHint: 'aadhaar',
                loginId: encryptedAadhaar,
                otpSystem: 'aadhaar',
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'REQUEST-ID': crypto.randomUUID(),
                    TIMESTAMP: new Date().toISOString(),
                    'X-CM-ID': 'sbx',
                    'Authorization': `Bearer ${token}`
                },
            });
            this.addLog('Aadhaar OTP Requested', 'SUCCESS', `Aadhaar encrypted successfully and OTP request dispatched to Gateway (Txn ID: ${txnId})`);
            return { status: 'success', txnId, message: 'OTP sent to Aadhaar-linked mobile.' };
        }
        catch (e) {
            this.addLog('Aadhaar OTP Requested (Simulated)', 'SUCCESS', `Gateway simulated OTP sent to Aadhaar-linked mobile (Txn ID: ${txnId})`);
            return { status: 'success', txnId, message: 'OTP sent to Aadhaar-linked mobile (Simulated Sandbox).' };
        }
    }
    async verifyAadhaarOtp(otp, txnId) {
        if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
            return { status: 'error', message: 'Invalid 6-digit OTP.' };
        }
        const sessionRes = await this.getGatewaySession();
        const token = sessionRes.tokenPreview;
        let publicKey = '';
        try {
            publicKey = await this.fetchLivePublicKey(token);
        }
        catch (e) {
            return { status: 'error', message: e.message || 'Failed to fetch ABDM public key certificate' };
        }
        const encryptedOtp = this.cryptoService.encryptWithPublicKey(publicKey, otp);
        const verifyUrl = 'https://abhasbx.abdm.gov.in/abha/api/v3/enrollment/enrol/byAadhaar';
        try {
            if (!token || token.startsWith('sbx-jwt-simulated-access-token-placeholder') || token.startsWith('sbx-jwt-simulated-fallback-')) {
                throw new Error('Simulated mode');
            }
            const response = await axios_1.default.post(verifyUrl, {
                txnId,
                otp: encryptedOtp,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'REQUEST-ID': crypto.randomUUID(),
                    TIMESTAMP: new Date().toISOString(),
                    'X-CM-ID': 'sbx',
                    'Authorization': `Bearer ${token}`
                },
            });
            this.addLog('Aadhaar OTP Verified', 'SUCCESS', `ABHA Number successfully issued: ${response.data.abhaNumber}`);
            return { status: 'success', ...response.data };
        }
        catch (e) {
            const mockAbhaNumber = `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
            const mockAbhaAddress = `aarav.sharma.${Date.now().toString().slice(-4)}@sbx`;
            const payload = {
                status: 'success',
                abhaNumber: mockAbhaNumber,
                abhaAddress: mockAbhaAddress,
                profile: {
                    name: 'Aarav Sharma',
                    gender: 'Male',
                    dob: '12-04-1994',
                    mobile: '9876543210',
                    photo: '',
                    address: 'H-402, Green Valley Apartments, Sector 56, Gurgaon, Haryana - 122011',
                },
            };
            this.addLog('Aadhaar OTP Verified (Simulated)', 'SUCCESS', `ABHA Number successfully generated: ${mockAbhaNumber} (Address: ${mockAbhaAddress})`);
            return payload;
        }
    }
};
exports.AbdmService = AbdmService;
exports.AbdmService = AbdmService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [crypto_service_1.CryptoService])
], AbdmService);
//# sourceMappingURL=abdm.service.js.map