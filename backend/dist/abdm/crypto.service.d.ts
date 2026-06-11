interface EphemeralKeys {
    privateKey: string;
    publicKey: string;
    nonce: string;
}
export declare class CryptoService {
    encryptWithPublicKey(publicKeyRaw: string, plainText: string): string;
    generateEphemeralKeys(): EphemeralKeys;
    deriveFideliusSymmetricKey(privateKeyB64: string, peerPublicKeyB64: string, ourNonceB64: string, peerNonceB64: string): {
        aesKey: Buffer;
        iv: Buffer;
    };
    decryptFhirPayload(encryptedDataB64: string, aesKey: Buffer, iv: Buffer, authTagB64?: string): string;
    decryptWithPrivateKey(privateKeyPem: string, cipherTextB64: string): string;
}
export {};
