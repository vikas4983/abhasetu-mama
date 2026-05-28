export declare class GatewayClientService {
    private activeToken;
    private tokenExpiry;
    getGatewayToken(): Promise<string>;
    dispatchGatewayRequest(endpoint: string, payload: any): Promise<boolean>;
}
