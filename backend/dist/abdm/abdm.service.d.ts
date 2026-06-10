import { CryptoService } from './crypto.service';
import { DbService } from '../db/db.service';
export declare class AbdmService {
    private readonly cryptoService;
    private readonly db;
    private cachedToken;
    private cachedTokenExpiry;
    getGatewayBaseUrl(): Promise<string>;
    getAbhaBaseUrl(): Promise<string>;
    constructor(cryptoService: CryptoService, db: DbService);
    getConfig(): Promise<any>;
    saveConfig(newConfig: any): Promise<{
        status: string;
        message: string;
    }>;
    getLogs(): Promise<{
        id: any;
        timestamp: any;
        event: any;
        status: any;
        details: any;
    }[]>;
    addLog(event: string, status: string, details: string): Promise<void>;
    getTransactions(): Promise<any[]>;
    addTransaction(txn: any): Promise<{
        status: string;
        id: any;
    }>;
    addDetailedLog(event: string, status: string, message: string, metadata: {
        mobile?: string;
        aadhaar?: string;
        abhaId?: string;
        abhaNumber?: string;
        email?: string;
        request?: any;
        response?: any;
        clientId?: string;
        clientIp?: string;
        userAgent?: string;
    }): Promise<void>;
    getProducts(): Promise<{
        id: any;
        name: any;
        category: any;
        brand: any;
        form: any;
        price: number;
        originalPrice: number;
        discount: any;
        rating: number;
        image: any;
        description: any;
        salt: any;
    }[]>;
    saveProduct(product: any): Promise<{
        status: string;
        message: string;
        data?: undefined;
    } | {
        status: string;
        data: any;
        message?: undefined;
    }>;
    deleteProduct(id: string): Promise<{
        status: string;
    }>;
    getPolicies(): Promise<{
        id: any;
        name: any;
        provider: any;
        monthlyPremium: number;
        csr: any;
        networkHospitals: any;
        coverageAmount: any;
        copay: any;
        features: any;
    }[]>;
    savePolicy(policy: any): Promise<{
        status: string;
        message: string;
        data?: undefined;
    } | {
        status: string;
        data: any;
        message?: undefined;
    }>;
    deletePolicy(id: string): Promise<{
        status: string;
    }>;
    getLabPackages(): Promise<{
        id: any;
        name: any;
        parameters: any;
        provider: any;
        price: number;
        originalPrice: number;
        discount: any;
        reportHours: any;
        sampleType: any;
        description: any;
        image: any;
    }[]>;
    saveLabPackage(lab: any): Promise<{
        status: string;
        message: string;
        data?: undefined;
    } | {
        status: string;
        data: any;
        message?: undefined;
    }>;
    deleteLabPackage(id: string): Promise<{
        status: string;
    }>;
    getGatewaySession(): Promise<{
        status: string;
        tokenPreview: any;
        publicKey: any;
        expiresIn: any;
        refreshExpiresIn: any;
    }>;
    generateSessionToken(): Promise<{
        status: string;
        tokenPreview: any;
        message: string;
    }>;
    syncPublicKeyFromGateway(): Promise<{
        status: string;
        publicKey: any;
    }>;
    getOrFetchPublicKey(token: string): Promise<string>;
    requestAadhaarOtp(aadhaar: string, context?: {
        ip?: string;
        userAgent?: string;
    }): Promise<any>;
    verifyAadhaarOtp(otp: string, txnId: string, mobile?: string, aadhaar?: string, context?: {
        ip?: string;
        userAgent?: string;
    }): Promise<any>;
    requestMobileOtp(mobile: string, txnId?: string, context?: {
        ip?: string;
        userAgent?: string;
    }): Promise<any>;
    verifyMobileOtp(otp: string, txnId: string, mobile?: string, context?: {
        ip?: string;
        userAgent?: string;
    }): Promise<any>;
    enrolByDocument(demographics: any, context?: {
        ip?: string;
        userAgent?: string;
    }): Promise<any>;
    handleHip(body: any, context?: {
        ip?: string;
        userAgent?: string;
    }): Promise<any>;
    handleConsent(body: any, context?: {
        ip?: string;
        userAgent?: string;
    }): Promise<any>;
    handleScanShare(body: any, context?: {
        ip?: string;
        userAgent?: string;
    }): Promise<any>;
    handleUhi(body: any, context?: {
        ip?: string;
        userAgent?: string;
    }): Promise<any>;
    handleNhcx(body: any, context?: {
        ip?: string;
        userAgent?: string;
    }): Promise<any>;
    handleHpr(body: any, context?: {
        ip?: string;
        userAgent?: string;
    }): Promise<any>;
    runTests(context?: {
        ip?: string;
        userAgent?: string;
    }): Promise<{
        status: string;
        summary: {
            total: number;
            passed: number;
            failed: number;
            successRate: number;
            durationMs: number;
            coveragePercent: number;
            timestamp: string;
        };
        results: any[];
    }>;
    getSpecialtiesMatrix(): Promise<any>;
    getDoctors(medicalSystem?: string, speciality?: string, specialistRole?: string, search?: string): Promise<any>;
    saveDoctor(doctor: any): Promise<{
        status: string;
        message: string;
        data?: undefined;
    } | {
        status: string;
        data: any;
        message?: undefined;
    }>;
    deleteDoctor(id: number): Promise<{
        status: string;
    }>;
    downloadAbhaCard(xToken: string, token: string): Promise<any>;
    requestEmailVerificationLink(email: string, xToken: string, gatewayToken: string): Promise<any>;
}
