import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  /**
   * Encrypt plain text using NHA gateway public key.
   * Mandated algorithm: RSA/ECB/OAEPWithSHA-1AndMGF1Padding
   */
  encryptWithPublicKey(publicKeyRaw: string, plainText: string): string {
    // Standardize the certificate raw base64 string to a PEM block
    let pemKey = publicKeyRaw;
    if (!pemKey.includes('-----BEGIN PUBLIC KEY-----')) {
      // Clean up whitespaces/newlines
      const cleaned = publicKeyRaw.replace(/\s+/g, '');
      const formatted = cleaned.replace(/(.{64})/g, '$1\n');
      pemKey = `-----BEGIN PUBLIC KEY-----\n${formatted.trim()}\n-----END PUBLIC KEY-----\n`;
    }

    const buffer = Buffer.from(plainText, 'utf8');
    const encrypted = crypto.publicEncrypt(
      {
        key: pemKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha1', // Mandated by NHA guidelines
      },
      buffer,
    );
    
    return encrypted.toString('base64');
  }
}
