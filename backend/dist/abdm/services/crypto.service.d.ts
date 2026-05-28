export declare class CryptoService {
    private ecInstance;
    constructor();
    generateKeyMaterial(): {
        publicKey: string;
        privateKey: string;
        nonce: string;
    };
    computeSharedSecret(ourPrivateKey: string, theirPublicKey: string): Buffer;
    deriveSaltAndIV(ourNonce: Buffer, theirNonce: Buffer): {
        salt: Buffer;
        iv: Buffer;
    };
    deriveSessionKey(sharedSecret: Buffer, salt: Buffer): Buffer;
    encryptPayload(payload: string, sessionKey: Buffer, iv: Buffer): {
        encryptedData: string;
        tag: string;
    };
    decryptPayload(encryptedData: string, sessionKey: Buffer, iv: Buffer, tag: string): string;
}
