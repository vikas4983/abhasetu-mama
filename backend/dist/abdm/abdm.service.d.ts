import { CryptoService } from './crypto.service';
export declare class AbdmService {
    private readonly cryptoService;
    private dbPath;
    constructor(cryptoService: CryptoService);
    private readDb;
    private writeDb;
    getConfig(): any;
    saveConfig(newConfig: any): {
        status: string;
        message: string;
    };
    getLogs(): any;
    addLog(event: string, status: string, details: string): void;
    getProducts(): any;
    saveProduct(product: any): {
        status: string;
        message: string;
        data?: undefined;
    } | {
        status: string;
        data: any;
        message?: undefined;
    };
    deleteProduct(id: string): {
        status: string;
    };
    getPolicies(): any;
    getLabPackages(): any;
    getGatewaySession(): Promise<{
        status: string;
        sandboxMode: boolean;
        tokenPreview: any;
    }>;
    requestAadhaarOtp(aadhaar: string): Promise<{
        status: string;
        message: string;
        txnId?: undefined;
    } | {
        status: string;
        txnId: `${string}-${string}-${string}-${string}-${string}`;
        message: string;
    }>;
    verifyAadhaarOtp(otp: string, txnId: string): Promise<any>;
}
