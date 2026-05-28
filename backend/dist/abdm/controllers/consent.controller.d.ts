export declare class ConsentController {
    initConsentRequest(payload: any): Promise<{
        status: string;
        consentRequestId: `${string}-${string}-${string}-${string}-${string}`;
        message: string;
        details: {
            purpose: any;
            hiTypes: any;
            expiry: string;
        };
    }>;
    listConsents(): Promise<{
        consentId: string;
        abhaAddress: string;
        status: string;
        purpose: string;
        hiTypes: string[];
        validFrom: string;
        validTo: string;
        createdAt: string;
    }[]>;
}
