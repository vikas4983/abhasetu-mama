# Abha Setu - ABDM Sandbox Integration Hub

Abha Setu is a dark-teal glassmorphic, mobile-first interoperable digital health suite designed to implement, simulate, and verify the complete standards of the **Ayushman Bharat Digital Mission (ABDM)**, the **Unified Health Interface (UHI)**, and the **National Health Claims Exchange (NHCX)**.

It now features a standalone **NestJS Backend Service** proxy-integrated with the **Next.js Frontend Dashboard** to provide secure, production-ready routing, credentials configuration, and automated gateway session validation.

---

## 🌟 Key Features & Integrated Modules

Abha Setu fully supports the following sandbox integration modules with high-fidelity, interactive simulators, live gateway logs, JWS signature verification, and secure cryptographic key derivations:

### 1. ABDM Milestone 1 (Identity Layer)
*   **Aadhaar eKYC Onboarding**: Simulates Aadhaar OTP validation requests and dynamic ABHA Account creation.
*   **Smart ID Card Replica**: Generates premium, authenticated smart cards displaying name, dob, gender, photo, and 14-digit ABHA ID, matching the exact NHA design specs.
*   **Save to Health Locker**: Directly syncs verified ID documents into the secure local Health Locker.

### 2. ABDM Milestone 2 (HIP Care Context Linking)
*   **Patient Record Discovery**: Matches patient profile demographic metadata against internal EMR databases.
*   **OTP-Based Record Linking**: Simulates secure OTP link verification to dynamically bind care contexts under active patient profiles.

### 3. ABDM Milestone 3 (Consent & Data Exchange)
*   **Consent Manager Lifecycle**: Generates consent authorization request artifacts (clinical purpose, access duration, and clinical record types).
*   **Fidelius Cryptography Protocol**: Implements secure asymmetric **Curve25519** Diffie-Hellman Key Exchanges (ECDH) and HKDF-SHA256 derivations on the Node.js backend.
*   **AES-256-GCM Secure Decryption**: Decrypts incoming encrypted FHIR bundles from the hospital repository and visualizes medical records (vitals, prescriptions, diagnostics).

### 4. Healthcare Professional Registry (HPR/NHPR)
*   **Practitioner Search**: Validates doctor HPR IDs against National Medical Council registries.
*   **Professional Onboarding**: eKYC enrollment for medical practitioners generating verified registries with digital authorization seals.

### 5. Scan & Share / Scan & Pay 2
*   **Demographic Profile Share**: Simulates scanning a Health Facility counter QR code to share ABHA profile metadata.
*   **OPD Counter Queue Tokens**: Automatically matches records and issues fast-track hospital OPD slip queue numbers (`SETU-OPD-XXX`).
*   **Health UPI billing**: Retrieves outpatient diagnostic/medicine bills and settles them via the simulated Health UPI Network, generating bank UTRs.

### 6. Unified Health Interface (UHI Tele-Consultation)
*   **Beckn Open Network Protocol**: Uses lifecycle protocol methods (`search`, `select`, `init`, `confirm`) to unbundle healthcare consults.
*   **Appointment Slot Booking**: Discovers doctors, selects appointment slots, validates platform quotes, and completes payment to secure a virtual telehealth meet room.

### 7. National Health Claims Exchange (NHCX Cashless Claims)
*   **Coverage Eligibility Check**: Queries insurer systems (Star Shield Plan) using FHIR R4 CoverageEligibilityRequest bundles.
*   **Pre-authorization Adjudication**: Submits estimated procedural costs alongside clinical history and receives cashless approvals (90% approved limit, 10% patient copay).
*   **Direct Bank EFT Settlement**: Performs final discharge bill submissions via NHCX direct clearing, issuing Electronic Fund Transfer clearing UTRs.

---

## 🖥️ New Backend Architecture & Admin Tools

We have expanded the architecture by integrating a dedicated Node.js **NestJS API Backend Server**:

### 1. NestJS Backend (`/backend`)
A modular NestJS application that acts as the server-to-server security gateway to ABDM:
*   **Persistent Static DB Layer**: Uses a lightweight, dynamic JSON-based file database ([db.json](file:///d:/ashish/abhasetu-mama/src/data/db.json)) to store configurations, products catalog, policies, lab checkups, and security logs.
*   **ABDM Routing Controllers**: Implements controllers mapping standard operations under a global `/api/abdm` prefix.
*   **Next.js Proxy rewriting**: Configured via Next.js rewrites to proxy all frontend `/api/abdm/:path*` network traffic seamlessly to port `3001` (NestJS).

### 2. Admin Dashboard UI (`/admin`)
A premium, dark-mode administrative control panel:
*   **Config Controls**: Instantly updates sandbox bridge credentials (`clientId`, `clientSecret`, etc.).
*   **Test Runner**: Triggers a live 14-endpoint ABDM health test suite validating sessions, enrollment, consents, HPR search, Scan & Share, UHI search, and NHCX checks.
*   **Products Catalog CRUD**: Full Add, Edit, and Delete modal manager which immediately syncs the pharmacy stock list.
*   **Real-time Audit Logs**: Viewer showing recent gateway callbacks, credentials changes, and encrypted record decryption logs.

### 3. Swagger-style API Playground (`/api-docs`)
An interactive developer sandbox:
*   Lists all V3 endpoints with descriptors, request bodies, and expected payloads.
*   Features an inline **JSON Request Body Editor** and a terminal-style **"Try It Out"** console to run live sandbox calls and inspect output statuses.

---

## 🔒 Deep Dive: ABDM Milestone 1 (M1) & RSA Cryptography

ABDM guidelines mandate that sensitive patient PII—specifically **Aadhaar numbers** (`loginId`) and **OTP codes** (`otp`)—must never be sent in cleartext to the gateway. Instead, they must be encrypted asymmetrically using the Gateway's public certificate.

### Cryptographic Configuration Specifications:
*   **Gateway Certificate Endpoint**: `GET {{gatewayUrl}}/v3/profile/public/certificate`
*   **Cipher Scheme**: `RSA/ECB/OAEPWithSHA-1AndMGF1Padding`
*   **Node.js Padding**: `crypto.constants.RSA_PKCS1_OAEP_PADDING`
*   **Hashing Algorithm**: `sha1` (NHA default)

### How it is Implemented (`crypto.service.ts`):
```typescript
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  encryptWithPublicKey(publicKeyRaw: string, plainText: string): string {
    // 1. Format the raw base64 string from Gateway into standard X.509 PEM format
    let pemKey = publicKeyRaw;
    if (!pemKey.includes('-----BEGIN PUBLIC KEY-----')) {
      const cleaned = publicKeyRaw.replace(/\s+/g, '');
      const formatted = cleaned.replace(/(.{64})/g, '$1\n');
      pemKey = `-----BEGIN PUBLIC KEY-----\n${formatted.trim()}\n-----END PUBLIC KEY-----\n`;
    }

    // 2. Perform RSA public key encryption with OAEP SHA-1 padding
    const buffer = Buffer.from(plainText, 'utf8');
    const encrypted = crypto.publicEncrypt(
      {
        key: pemKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha1', // Mandated by NHA
      },
      buffer,
    );
    
    return encrypted.toString('base64');
  }
}
```

### Milestone 1 Step-by-Step API Flow:
1.  **Handshake**: Call `POST /sessions` with credentials to retrieve the Gateway `accessToken`.
2.  **Get Public Key**: Query `GET /v3/profile/public/certificate` to fetch NHA’s public certificate.
3.  **Generate OTP**:
    *   Call `POST /v3/enrollment/request/otp` using the encrypted Aadhaar as `loginId` and `loginHint: "aadhaar"`.
    *   Retrieve the transaction session code `txnId` from the response.
4.  **Confirm Enrollment**:
    *   Call `POST /v3/enrollment/enrol/byAadhaar` using the `txnId` and the encrypted OTP.
    *   Receive the issued **ABHA Number** (`91-XXXX-XXXX-XXXX`) and demographics profile.

---

## 🛠️ Setup & Execution Guide

### 1. Credentials Configuration
1.  Copy `.env.example` in the root directory to `.env`:
    ```bash
    cp .env.example .env
    ```
2.  Also set up credentials for the backend. Copy `backend/.env.example` to `backend/.env`:
    ```bash
    cp backend/.env.example backend/.env
    ```
3.  Fill in the credentials provided by the NHA Sandbox Bridge portal (`ABDM_CLIENT_ID` and `ABDM_CLIENT_SECRET`).

*Note: If credentials are left unconfigured, the app falls back to simulated mock mode, letting you test all flows offline.*

### 2. Running the NestJS Backend Server
Navigate to the `backend` folder, install packages, and boot the server on port `3001`:
```bash
cd backend
npm install
npm run start:dev
```

### 3. Running the Next.js Frontend App
In a separate terminal, install packages and start the frontend on port `3000` from the root directory:
```bash
npm install
npm run dev
```
Open [http://localhost:3000/abha](http://localhost:3000/abha) in your browser (preferably in mobile view) to begin testing.

### 4. Compilation Verification
To check type safety and optimized production compilation:
*   **NestJS**: Run `npm run build` inside `backend/` folder.
*   **Next.js**: Run `npx tsc --noEmit` and `npm run build` in the root folder.
