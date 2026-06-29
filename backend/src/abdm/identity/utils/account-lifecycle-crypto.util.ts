/**
 * @file        account-lifecycle-crypto.util.ts
 * @description Shared RSA encryption for ABHA account lifecycle (delete/deactivate/reactivate)
 * @module      abdm/identity/utils
 * @layer       util
 * @author      Platform Team
 * @created     2026-06-29
 */

import { CryptoService } from '../../crypto/crypto.service';
import { SessionService } from '../../session/session.service';
import { normalizeAbhaNumberDigits } from './abha-number.util';
import type { ParsedGatewayResult } from './gateway-response.util';

/**
 * @description Validate ABHA number and RSA-encrypt for loginHint abha-number
 */
export async function encryptAbhaNumberLoginId(
  cryptoService: CryptoService,
  sessionService: SessionService,
  abhaNumberRaw: string,
): Promise<{ encrypted: string; digits: string } | ParsedGatewayResult> {
  const digits = normalizeAbhaNumberDigits(abhaNumberRaw);
  if (!digits) {
    return {
      status: 'error',
      message:
        'Invalid ABHA number. A complete 14-digit ABHA is required (masked numbers like XXXX are not accepted).',
    };
  }

  try {
    const session = await sessionService.getGatewaySession();
    if (!session.tokenPreview || session.tokenPreview === 'simulated-session-token') {
      return {
        status: 'error',
        message: 'ABDM gateway session is not configured. Set ABDM_CLIENT_ID and ABDM_CLIENT_SECRET.',
      };
    }
    const sync = await sessionService.syncPublicKeyFromGateway(session.tokenPreview);
    const encrypted = cryptoService.encryptWithPublicKey(sync.publicKey, digits);
    return { encrypted, digits };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Encryption failed';
    return {
      status: 'error',
      message: msg.includes('public key') || msg.includes('encryption')
        ? 'Unable to encrypt ABHA number. Sync ABDM public certificate and retry.'
        : msg,
    };
  }
}

/**
 * @description RSA-encrypt OTP or password for verify APIs
 */
export async function encryptSensitiveField(
  cryptoService: CryptoService,
  sessionService: SessionService,
  plainText: string,
): Promise<string> {
  const session = await sessionService.getGatewaySession();
  const sync = await sessionService.syncPublicKeyFromGateway(session.tokenPreview);
  return cryptoService.encryptWithPublicKey(sync.publicKey, plainText);
}
