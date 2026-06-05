import { AbdmService } from './abdm.service';
import * as express from 'express';
export declare class AbdmController {
    private readonly abdmService;
    constructor(abdmService: AbdmService);
    getSessions(): Promise<{
        status: string;
        sandboxMode: boolean;
        tokenPreview: any;
    }>;
    enroll(body: any, res: express.Response): Promise<express.Response<any, Record<string, any>>>;
    getConfig(): any;
    saveConfig(body: any): {
        status: string;
        message: string;
    };
    getLogs(): any;
    addLog(body: any): {
        status: string;
    };
    getProducts(): any;
    addProduct(body: any): {
        status: string;
        message: string;
        data?: undefined;
    } | {
        status: string;
        data: any;
        message?: undefined;
    };
    updateProduct(body: any): {
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
}
