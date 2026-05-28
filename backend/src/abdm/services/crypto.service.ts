import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { ec as EC } from 'elliptic';
import * as hash from 'hash.js';

// Import raw curve class and BigNumber library directly
const ShortCurve = require('elliptic/lib/elliptic/curve/short');
const BN = require('bn.js');

@Injectable()
export class CryptoService {
  private ecInstance: EC;

  constructor() {
    // Instantiate Custom Weierstrass Curve25519 directly (bypasses PresetCurve validations)
    const customCurveInstance = new ShortCurve({
      p: '7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffed',
      a: '2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa984914a144',
      b: '7b425ed097b425ed097b425ed097b425ed097b425ed097b4260b5e9c7710c864',
      n: '1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed',
    });

    // Construct the Weierstrass base point G manually on this curve
    const G = customCurveInstance.point(
      '2aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa984914a144',
      '7b425ed097b425ed097b425ed097b425ed097b425ed097b4260b5e9c7710c864'
    );

    // Pass the custom preset structure directly to the EC constructor
    this.ecInstance = new EC({
      curve: {
        curve: customCurveInstance,
        g: G,
        n: new BN('1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed', 16),
        hash: hash.sha256
      }
    } as any);
  }



  /**
   * Generates ephemeral Curve25519 keypair in uncompressed Weierstrass format (65 bytes)
   * and a cryptographically secure random 32-byte nonce (RAND).
   */
  generateKeyMaterial() {
    const keyPair = this.ecInstance.genKeyPair();
    // Export uncompressed public key starting with '04' prefix (65 bytes)
    const publicKeyBase64 = Buffer.from(keyPair.getPublic().encode('array', false)).toString('base64');
    const privateKeyBase64 = keyPair.getPrivate().toArrayLike(Buffer, 'be', 32).toString('base64');
    const nonce = crypto.randomBytes(32).toString('base64');

    return {
      publicKey: publicKeyBase64,
      privateKey: privateKeyBase64,
      nonce,
    };
  }

  /**
   * Computes ECDH Shared Secret (X-coordinate of the Weierstrass agreed point)
   */
  computeSharedSecret(ourPrivateKey: string, theirPublicKey: string): Buffer {
    const ourKey = this.ecInstance.keyFromPrivate(Buffer.from(ourPrivateKey, 'base64'));
    
    // Parse their public key uncompressed point (handles '04' prefix automatically)
    const theirKey = this.ecInstance.keyFromPublic(Buffer.from(theirPublicKey, 'base64')).getPublic();
    
    // Compute ECDH shared secret point
    const sharedPoint = ourKey.derive(theirKey);
    
    // Extract specifically the 32-byte X-coordinate as raw shared secret
    return sharedPoint.toArrayLike(Buffer, 'be', 32);
  }

  /**
   * XORs sender and receiver nonces to derive HKDF Salt (first 20 bytes) and AES-GCM IV (last 12 bytes)
   */
  deriveSaltAndIV(ourNonce: Buffer, theirNonce: Buffer): { salt: Buffer; iv: Buffer } {
    if (ourNonce.length !== 32 || theirNonce.length !== 32) {
      throw new Error('Nonces must be exactly 32 bytes.');
    }
    const xor = Buffer.alloc(32);
    for (let i = 0; i < 32; i++) {
      xor[i] = ourNonce[i] ^ theirNonce[i];
    }
    return {
      salt: xor.subarray(0, 20), // First 20 bytes used as HKDF salt
      iv: xor.subarray(20, 32),   // Last 12 bytes used as AES-GCM IV
    };
  }

  /**
   * Derives symmetric session key using HKDF-SHA256
   */
  deriveSessionKey(sharedSecret: Buffer, salt: Buffer): Buffer {
    return Buffer.from(
      crypto.hkdfSync(
        'sha256',
        sharedSecret,
        salt,
        Buffer.alloc(0), // empty info parameter
        32 // 256-bit symmetric session key size
      )
    );
  }

  /**
   * Encrypts clinical payloads (FHIR resources) using AES-256-GCM
   */
  encryptPayload(payload: string, sessionKey: Buffer, iv: Buffer): { encryptedData: string; tag: string } {
    const cipher = crypto.createCipheriv('aes-256-gcm', sessionKey, iv);
    
    let encrypted = cipher.update(payload, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag().toString('base64');
    const encryptedData = Buffer.from(encrypted, 'hex').toString('base64');
    
    return {
      encryptedData,
      tag,
    };
  }

  /**
   * Decrypts clinical payloads received from HIPs using AES-256-GCM
   */
  decryptPayload(encryptedData: string, sessionKey: Buffer, iv: Buffer, tag: string): string {
    const decipher = crypto.createDecipheriv('aes-256-gcm', sessionKey, iv);
    decipher.setAuthTag(Buffer.from(tag, 'base64'));
    
    let decrypted = decipher.update(Buffer.from(encryptedData, 'base64').toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
