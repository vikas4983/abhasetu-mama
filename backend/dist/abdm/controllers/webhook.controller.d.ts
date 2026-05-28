export declare class WebhookController {
    onConsentInit(payload: any, signature: string): Promise<{
        status: string;
    }>;
    discoverCareContexts(payload: any): Promise<{
        status: string;
    }>;
    initiateLinkage(payload: any): Promise<{
        status: string;
    }>;
}
