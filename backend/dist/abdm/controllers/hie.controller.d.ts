import { CryptoService } from '../services/crypto.service';
export declare class HieController {
    private readonly cryptoService;
    constructor(cryptoService: CryptoService);
    executeHieTransfer(payload: any): Promise<{
        status: string;
        consentId: any;
        cipherSuite: string;
        curveType: string;
        fideliusParameters: {
            hipEphemeralPublicKey: string;
            hipNonce: string;
            hiuEphemeralPublicKey: string;
            hiuNonce: string;
            computedSharedSecretAgreedX: string;
            derivedSaltHex: string;
            derivedIvHex: string;
            derivedSessionKeyBase64: string;
        };
        encryptedData: string;
        authTag: string;
        message: string;
    }>;
}
