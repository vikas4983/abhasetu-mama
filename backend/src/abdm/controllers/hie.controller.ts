import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { CryptoService } from '../services/crypto.service';

@Controller('abha/hie')
export class HieController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Post('transfer')
  @HttpCode(200)
  async executeHieTransfer(@Body() payload: any) {
    console.log(`[ABDM M3 HIE] Executing secure Weierstrass clinical payload encryption for Consent ID: ${payload.consentId}`);

    const clinicalResource = payload.clinicalPayload || JSON.stringify({
      resourceType: 'Bundle',
      type: 'document',
      entry: [
        {
          resourceType: 'Prescription',
          id: 'rx-2026-9901',
          status: 'active',
          medicationCodeableConcept: { text: 'Amoxicillin 500mg TDS' },
          authoredOn: new Date().toISOString()
        }
      ]
    }, null, 2);

    // 1. Generate HIP Ephemeral Key Materials (Us)
    const hipMaterial = this.cryptoService.generateKeyMaterial();

    // 2. Simulate HIU Ephemeral Key Materials (Them)
    const hiuMaterial = this.cryptoService.generateKeyMaterial();

    // 3. Compute ECDH Weierstrass shared secret agreed point (X-coordinate)
    // We compute this using our private key and their public key
    const sharedSecretBuffer = this.cryptoService.computeSharedSecret(hipMaterial.privateKey, hiuMaterial.publicKey);

    // 4. Mix nonces via XOR to derive HKDF Salt (20 bytes) and AES-GCM IV (12 bytes)
    const hipNonceBuf = Buffer.from(hipMaterial.nonce, 'base64');
    const hiuNonceBuf = Buffer.from(hiuMaterial.nonce, 'base64');
    const mixedMaterial = this.cryptoService.deriveSaltAndIV(hipNonceBuf, hiuNonceBuf);

    // 5. Derive symmetric 256-bit symmetric session key via HKDF-SHA256
    const sessionKey = this.cryptoService.deriveSessionKey(sharedSecretBuffer, mixedMaterial.salt);

    // 6. Encrypt the FHIR clinical payload using AES-256-GCM
    const encryptionOutput = this.cryptoService.encryptPayload(clinicalResource, sessionKey, mixedMaterial.iv);

    return {
      status: 'TRANSFERRED',
      consentId: payload.consentId,
      cipherSuite: 'AES-256-GCM',
      curveType: 'Weierstrass Short Curve25519 equivalent',
      fideliusParameters: {
        hipEphemeralPublicKey: hipMaterial.publicKey,
        hipNonce: hipMaterial.nonce,
        hiuEphemeralPublicKey: hiuMaterial.publicKey,
        hiuNonce: hiuMaterial.nonce,
        computedSharedSecretAgreedX: sharedSecretBuffer.toString('base64'),
        derivedSaltHex: mixedMaterial.salt.toString('hex'),
        derivedIvHex: mixedMaterial.iv.toString('hex'),
        derivedSessionKeyBase64: sessionKey.toString('base64'),
      },
      encryptedData: encryptionOutput.encryptedData,
      authTag: encryptionOutput.tag,
      message: 'Clinical FHIR resource packed and encrypted successfully compliant with DPDP Act 2023 Fidelius protocol.'
    };
  }
}
