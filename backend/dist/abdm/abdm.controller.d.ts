import { AbdmService } from './abdm.service';
import { AuthService } from '../auth/auth.service';
import * as express from 'express';
export declare class AbdmController {
    private readonly abdmService;
    private readonly authService;
    constructor(abdmService: AbdmService, authService: AuthService);
    adminLogin(body: any): Promise<{
        status: string;
        token: string;
        user: {
            email: any;
            role: any;
            name: any;
        };
    }>;
    getSessions(res: express.Response): Promise<express.Response<any, Record<string, any>>>;
    generateSession(res: express.Response): Promise<express.Response<any, Record<string, any>>>;
    fetchPublicKey(res: express.Response): Promise<express.Response<any, Record<string, any>>>;
    enroll(body: any, res: express.Response, req: express.Request): Promise<express.Response<any, Record<string, any>>>;
    v3RequestOtp(body: any, res: express.Response, req: express.Request): Promise<express.Response<any, Record<string, any>>>;
    v3EnrolByAadhaar(body: any, res: express.Response, req: express.Request): Promise<express.Response<any, Record<string, any>>>;
    v3AuthByAbdm(body: any, res: express.Response, req: express.Request): Promise<express.Response<any, Record<string, any>>>;
    v3EnrolByDocument(body: any, res: express.Response, req: express.Request): Promise<express.Response<any, Record<string, any>>>;
    getConfig(): Promise<{
        status: string;
        config: any;
    }>;
    saveConfig(body: any): Promise<{
        status: string;
        message: string;
    }>;
    getLogs(): Promise<{
        status: string;
        logs: {
            id: any;
            timestamp: any;
            event: any;
            status: any;
            details: any;
        }[];
    }>;
    addLog(body: any): Promise<{
        status: string;
    }>;
    getProducts(): Promise<{
        status: string;
        products: {
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
        }[];
    }>;
    addProduct(body: any): Promise<{
        status: string;
        message: string;
        data?: undefined;
    } | {
        status: string;
        data: any;
        message?: undefined;
    }>;
    updateProduct(body: any): Promise<{
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
        status: string;
        policies: {
            id: any;
            name: any;
            provider: any;
            monthlyPremium: number;
            csr: any;
            networkHospitals: any;
            coverageAmount: any;
            copay: any;
            features: any;
        }[];
    }>;
    addPolicy(body: any): Promise<{
        status: string;
        message: string;
        data?: undefined;
    } | {
        status: string;
        data: any;
        message?: undefined;
    }>;
    updatePolicy(body: any): Promise<{
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
        status: string;
        labPackages: {
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
        }[];
    }>;
    addLabPackage(body: any): Promise<{
        status: string;
        message: string;
        data?: undefined;
    } | {
        status: string;
        data: any;
        message?: undefined;
    }>;
    updateLabPackage(body: any): Promise<{
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
    hip(body: any, res: express.Response, req: express.Request): Promise<express.Response<any, Record<string, any>>>;
    consent(body: any, res: express.Response, req: express.Request): Promise<express.Response<any, Record<string, any>>>;
    scanShare(body: any, res: express.Response, req: express.Request): Promise<express.Response<any, Record<string, any>>>;
    uhi(body: any, res: express.Response, req: express.Request): Promise<express.Response<any, Record<string, any>>>;
    nhcx(body: any, res: express.Response, req: express.Request): Promise<express.Response<any, Record<string, any>>>;
    hpr(body: any, res: express.Response, req: express.Request): Promise<express.Response<any, Record<string, any>>>;
    tests(res: express.Response, req: express.Request): Promise<express.Response<any, Record<string, any>>>;
    getSpecialtiesMatrix(res: express.Response): Promise<express.Response<any, Record<string, any>>>;
    getDoctors(medicalSystem: string, speciality: string, specialistRole: string, search: string, res: express.Response): Promise<express.Response<any, Record<string, any>>>;
    saveDoctor(body: any, res: express.Response): Promise<express.Response<any, Record<string, any>>>;
    deleteDoctor(id: string, res: express.Response): Promise<express.Response<any, Record<string, any>>>;
}
