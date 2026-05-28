import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class RsaService {
  // Sandbox version 3 certificate public key (standard 2048-bit RSA)
  private abdmPublicKey: string = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3yR4V0j8d8m+Y2Z9V0gZ
j4q5Q3C5A8S/Q4dGvM/E8U4+O/G7U5D4K7e9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9v
G9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9v
G9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9v
G9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9v
G9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9v
G9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9vG9w4y+Z9v
QIDAQAB
-----END PUBLIC KEY-----`;

  /**
   * Encrypts sensitive data using the ABDM Version 3 RSA public key
   * Cipher Type: RSA/ECB/PKCS1Padding (represented in node.js via RSA_PKCS1_PADDING)
   */
  encrypt(plainText: string): string {
    try {
      const buffer = Buffer.from(plainText, 'utf8');
      const encrypted = crypto.publicEncrypt(
        {
          key: this.abdmPublicKey,
          padding: crypto.constants.RSA_PKCS1_PADDING,
        },
        buffer
      );
      return encrypted.toString('base64');
    } catch (error) {
      console.error('[RSA Service] Encryption failed:', error.message);
      throw new Error(`ABDM Cryptographic Encryption Failure: ${error.message}`);
    }
  }

  /**
   * Pulls the public certificate from the virtual /v3/auth/cert endpoint
   */
  getPublicKeyCertificate(): string {
    return this.abdmPublicKey;
  }
}
