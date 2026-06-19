/**
 * @file        crypto.controller.ts
 * @description Controller handling all cryptographic operations including RSA encryption, decryption, and keypair generation.
 * @module      abdm
 * @layer       controller
 * @author      Platform Team
 * @created     2026-06-19
 * @modified    2026-06-19
 */

import { Controller, Post, Get, Body, Req, HttpStatus } from '@nestjs/common';
import { AbdmService } from '../abdm.service';
import { CryptoService } from '../crypto.service';
import * as crypto from 'crypto';
import * as express from 'express';

function getCookie(cookieHeader: string | undefined, name: string): string {
  if (!cookieHeader) return '';
  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [key, val] = cookie.trim().split('=');
    if (key === name) {
      return decodeURIComponent(val || '');
    }
  }
  return '';
}

@Controller()
export class AbdmCryptoController {
  constructor(
    private readonly abdmService: AbdmService,
    private readonly cryptoService: CryptoService
  ) {}

  /**
   * @description Get active public key from cookies or config database
   * @param {express.Request} req - The Express Request object
   * @returns {Promise<{ status: string; publicKey: string }>} Active public certificate payload
   */
  @Get('crypto/public-key')
  async getCryptoPublicKey(@Req() req: express.Request) {
    try {
      let pubKey = getCookie(req.headers.cookie, 'public_key');
      if (!pubKey) {
        try {
          const config = await this.abdmService.getConfig();
          pubKey = config.ABDM_PUBLIC_KEY || '';
        } catch (e) {}
      }
      return { status: 'success', publicKey: pubKey };
    } catch (error: any) {
      return { status: 'error', publicKey: '', message: error.message || 'Failed to retrieve public key.' };
    }
  }

  /**
   * @description Encrypt plaintext data using the active RSA public key
   * @param {object} body - Request body containing plainText and optional publicKey
   * @param {express.Request} req - The Express Request object
   * @returns {Promise<{ status: string; cipherText?: string; message?: string }>} Encryption result
   */
  @Post('crypto/encrypt')
  async encryptData(@Body() body: { plainText: string; publicKey?: string }, @Req() req: express.Request) {
    try {
      let pubKey = body.publicKey;
      if (!pubKey) {
        pubKey = getCookie(req.headers.cookie, 'public_key');
      }
      if (!pubKey) {
        try {
          const config = await this.abdmService.getConfig();
          pubKey = config.ABDM_PUBLIC_KEY || '';
        } catch (e) {}
      }
      if (!pubKey) {
        throw new Error('No active public key found. Please provide a public key or ensure a gateway session is active.');
      }
      const cipherText = this.cryptoService.encryptWithPublicKey(pubKey, body.plainText);
      return { status: 'success', cipherText };
    } catch (error: any) {
      return { status: 'error', message: error.message || 'Encryption failed.' };
    }
  }

  /**
   * @description Decrypt ciphertext using an RSA private key
   * @param {object} body - Request body containing cipherText and privateKey
   * @returns {{ status: string; plainText?: string; message?: string }} Decryption result
   */
  @Post('crypto/decrypt')
  decryptData(@Body() body: { cipherText: string; privateKey: string }) {
    try {
      if (!body.privateKey) {
        throw new Error('Private key is required for decryption.');
      }
      const plainText = this.cryptoService.decryptWithPrivateKey(body.privateKey, body.cipherText);
      return { status: 'success', plainText };
    } catch (error: any) {
      return { status: 'error', message: error.message || 'Decryption failed.' };
    }
  }

  /**
   * @description Generate a new RSA public-private keypair (2048-bit SPKI/PKCS8)
   * @returns {{ status: string; publicKey?: string; privateKey?: string; message?: string }} Generated keypair
   */
  @Post('crypto/generate-keypair')
  generateKeyPair() {
    try {
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      });
      return { status: 'success', publicKey, privateKey };
    } catch (error: any) {
      return { status: 'error', message: error.message || 'Key pair generation failed.' };
    }
  }
}
