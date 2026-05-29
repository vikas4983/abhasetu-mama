import { NextResponse } from 'next/server';
import { getAbdmAccessToken } from '../../../../utils/abdm/session';
import { generateEphemeralKeys, deriveFideliusSymmetricKey, decryptFhirPayload } from '../../../../utils/abdm/crypto';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, abhaAddress, purpose, hiTypes, consentId } = body;
    
    // Get gateway token
    const token = await getAbdmAccessToken();
    const isMock = token.includes('simulated');

    if (action === 'request-consent') {
      if (!abhaAddress) {
        return NextResponse.json({ status: 'error', message: 'ABHA Address is required.' }, { status: 400 });
      }

      console.log(`[ABDM M3] Initializing Consent Request for: ${abhaAddress}`);

      // Generate our ephemeral keys for the Diffie-Hellman key exchange
      const keyMaterial = generateEphemeralKeys();

      // Return high-fidelity consent status tracking metadata
      return NextResponse.json({
        status: 'success',
        message: 'Consent request initiated successfully. Awaiting patient approval.',
        consentRequestId: crypto.randomUUID(),
        consentId: `AR-${Math.floor(100000 + Math.random() * 900000)}`,
        keyMaterial: {
          publicKey: keyMaterial.publicKey,
          nonce: keyMaterial.nonce,
        },
        patient: abhaAddress,
        purpose: purpose || 'Clinical Referral',
        hiTypes: hiTypes || ['Prescription', 'DiagnosticReport'],
        simulated: true,
      });

    } else if (action === 'fetch-records') {
      if (!consentId) {
        return NextResponse.json({ status: 'error', message: 'Consent ID is required.' }, { status: 400 });
      }

      console.log(`[ABDM M3] Consuming secure data flow under Consent ID: ${consentId}`);

      // 1. Generate local keys (HIU side)
      const ourKeys = generateEphemeralKeys();

      // 2. Mock peer keys and nonce (HIP side, e.g. from the Hospital Repository)
      const peerKeys = generateEphemeralKeys();

      // 3. Derive secure symmetric session key using ECDH key exchange
      const { aesKey, iv } = deriveFideliusSymmetricKey(
        ourKeys.privateKey,
        peerKeys.publicKey,
        ourKeys.nonce,
        peerKeys.nonce
      );

      // 4. Mock ciphertext FHIR Bundle from HIP
      const fhirMockBundle = 'e2k81792HJSKDFHKSJDHF839217...'; // base64 placeholder

      // 5. Decrypt the FHIR bundle securely using AES-256-GCM
      const decryptedString = decryptFhirPayload(fhirMockBundle, aesKey, iv);
      const decryptedBundle = JSON.parse(decryptedString);

      return NextResponse.json({
        status: 'success',
        message: 'Health records fetched and decrypted successfully via Fidelius protocol.',
        consentId: consentId,
        securityDetails: {
          exchangeCurve: 'Curve25519 (secp256r1/Weierstrass params)',
          symmetricAlgorithm: 'AES-256-GCM',
          derivedKeyPreview: `${aesKey.subarray(0, 8).toString('hex')}...`,
          saltPreview: `${iv.subarray(0, 6).toString('hex')}...`,
        },
        fhirBundle: decryptedBundle,
        simulated: true,
      });
    }

    return NextResponse.json({ status: 'error', message: 'Invalid Action specified.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message || error }, { status: 500 });
  }
}
