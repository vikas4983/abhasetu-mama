# ABDM Integration Cheatsheet
# Stack: NestJS (Backend) · Next.js (Frontend) · PostgreSQL · TypeScript
# Reference: https://sandbox.abdm.gov.in / https://kiranma72.github.io/abdm-docs

## ══════════════════════════════════════════════════
## 1. ABDM ECOSYSTEM — WHO IS WHO
## ══════════════════════════════════════════════════

HIP  = Health Information Provider  → your hospital/lab/clinic (generates records)
HIU  = Health Information User      → entity requesting patient records
HRP  = Health Repository Provider   → where health records are stored
PHR  = Personal Health Record app   → patient-facing app (e.g. ABHA app)
HIE-CM = Health Info Exchange & Consent Manager → the ABDM gateway itself

Your application roles:
  - As HIP: generate FHIR records → link to ABHA → share on consent
  - As HIU: request consent → fetch records from HRP
  - As DSC: Digital Solution Company implementing the platform

## ══════════════════════════════════════════════════
## 2. THREE MILESTONES TO ABDM COMPLIANCE
## ══════════════════════════════════════════════════

Milestone 1 (M1) — Patient Registration
  ✅ Create ABHA number (Aadhaar OTP / Mobile / Driving Licence)
  ✅ Verify ABHA address during patient registration
  NestJS module: AbhaModule | AbhaCreationService | AbhaVerificationService

Milestone 2 (M2) — HIP: Share Records
  ✅ Discover patient health records
  ✅ Link/notify new health records to ABHA address
  ✅ Share records after consent verification
  ✅ FHIR R4 format for all health records
  ✅ Consent revoke, ABHA deletion, heartbeat support
  NestJS module: HipModule | CareContextService | HealthRecordsService

Milestone 3 (M3) — HIU: View Records
  ✅ Request consent to access patient records
  ✅ Fetch records from HRPs after consent granted
  ✅ Display records in organized format
  NestJS module: HiuModule | ConsentService | HealthInfoFetchService

## ══════════════════════════════════════════════════
## 3. ABDM AUTH FLOW (do this before any other call)
## ══════════════════════════════════════════════════

POST https://dev.abdm.gov.in/gateway/v0.5/sessions
Body: { "clientId": process.env.ABDM_CLIENT_ID,
        "clientSecret": process.env.ABDM_CLIENT_SECRET }
Returns: { "accessToken": "...", "tokenType": "bearer", "expiresIn": 1800 }

→ Cache token in Redis (TTL: expiresIn - 60 seconds)
→ Inject as: Authorization: Bearer <accessToken>
→ Auto-refresh before expiry via AbdmSessionService

## ══════════════════════════════════════════════════
## 4. MANDATORY ABDM HTTP HEADERS
## ══════════════════════════════════════════════════

For EVERY outbound gateway API call (injected by AbdmHeadersInterceptor):
  Authorization: Bearer <session_token>     ← from cached AbdmSessionService
  X-CM-ID: sbx                              ← process.env.ABDM_CM_ID
  Content-Type: application/json

For HIP operations additionally:
  X-HIP-ID: <your_hfr_hip_id>              ← process.env.ABDM_HIP_ID

For HIU operations additionally:
  X-HIU-ID: <your_hiu_id>                  ← process.env.ABDM_HIU_ID

For callbacks arriving FROM gateway, read:
  X-HIP-ID header → to route to correct HIP handler
  X-HIU-ID header → to route to correct HIU handler

## ══════════════════════════════════════════════════
## 5. ASYNC CALLBACK PATTERN (CRITICAL)
## ══════════════════════════════════════════════════

ALL HIE-CM APIs are ASYNCHRONOUS:
  1. You call gateway API  →  Gateway responds: HTTP 202 (acknowledged)
  2. Gateway processes request
  3. Gateway calls YOUR callback URL with result

Your responsibility:
  a. Respond to EVERY callback with HTTP 200 IMMEDIATELY
  b. Store requestId → correlate with original request
  c. Process callback payload asynchronously (queue/event)
  d. Implement timeout if callback not received in N seconds

Example callback URL pattern:
  POST /api/abdm/callbacks/v0.5/users/auth/on-fetch-modes
  POST /api/abdm/callbacks/v0.5/care-contexts/on-discover
  POST /api/abdm/callbacks/v0.5/consent-requests/on-init
  POST /api/abdm/callbacks/v0.5/health-information/hip/request

Register sandbox callback URL:
  PATCH https://dev.abdm.gov.in/devservice/v1/bridges
  Body: { "url": process.env.ABDM_CALLBACK_BASE_URL }

## ══════════════════════════════════════════════════
## 6. RSA ENCRYPTION — REQUIRED FIELDS
## ══════════════════════════════════════════════════

Fields that MUST be RSA-encrypted before sending to ABDM:
  - Aadhaar number
  - OTP values
  - Mobile number (in some V1/V2 flows)

V3 API encryption:
  1. GET https://healthidsbx.abdm.gov.in/api/v1/auth/cert
     → Returns PEM public key
     → Cache in Redis (TTL: 24 hours via ABDM_RSA_KEY_CACHE_TTL_SECONDS)
  2. Encrypt with: RSA/ECB/OAEPWithSHA-1AndMGF1Padding
  3. Base64-encode the result → send in API field

Node.js implementation:
  import { publicEncrypt, constants } from 'crypto';
  const encrypted = publicEncrypt(
    { key: publicKeyPem, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha1' },
    Buffer.from(plaintext)
  );
  return encrypted.toString('base64');

V1/V2 API encryption: RSA/ECB/PKCS1Padding
  import { publicEncrypt, constants } from 'crypto';
  const encrypted = publicEncrypt(
    { key: publicKeyPem, padding: constants.RSA_PKCS1_PADDING },
    Buffer.from(plaintext)
  );

## ══════════════════════════════════════════════════
## 7. FHIR HEALTH RECORD PACKAGING (M2)
## ══════════════════════════════════════════════════

Supported HI Types (use HI_TYPES constants):
  Prescription | DiagnosticReport | OPConsultation |
  DischargeSummary | ImmunizationRecord | HealthDocumentRecord | WellnessRecord

Package structure (FHIR R4 Bundle):
  {
    "resourceType": "Bundle",
    "type": "document",
    "entry": [
      { "resource": { "resourceType": "Composition", ... } },
      { "resource": { "resourceType": "Patient", ... } },
      { "resource": { "resourceType": "Practitioner", ... } },
      // HI-type specific resources
    ]
  }

End-to-end encryption for transfer: Fidelius (ECDH + AES-256-GCM)
  1. Generate ephemeral EC key pair
  2. Derive shared secret with HIU public key (from consent artefact)
  3. Encrypt FHIR bundle with AES-256-GCM using derived key
  4. Send encrypted payload to HIP → pushes to HIU via /v0.5/health-information/transfer

## ══════════════════════════════════════════════════
## 8. ABHA NUMBER & ADDRESS FORMATS
## ══════════════════════════════════════════════════

ABHA Number:  14 digits, displayed as XX-XXXX-XXXX-XXXX  (e.g. 32-8121-2314-3406)
ABHA Address: <username>@<suffix>
  Sandbox:    username@sbx     (e.g. patient123@sbx)
  Production: username@abdm    (e.g. patient123@abdm)

Log masking (MANDATORY):
  ABHA:   mask as ****-****-****-3406  (show only last 4)
  Mobile: mask as ******7890           (show only last 4)
  Aadhaar: NEVER log, not even partial

Validation regex (put in regex.constants.ts):
  ABHA_NUMBER:  /^\d{2}-\d{4}-\d{4}-\d{4}$/ or /^\d{14}$/
  ABHA_ADDRESS: /^[a-zA-Z0-9._-]+@(sbx|abdm)$/
  MOBILE_IN:    /^[6-9]\d{9}$/

## ══════════════════════════════════════════════════
## 9. KEY SANDBOX URLS (from env vars — not hardcoded)
## ══════════════════════════════════════════════════

ABDM_GATEWAY_BASE_URL_SANDBOX  = https://dev.abdm.gov.in
ABDM_HEALTHID_BASE_URL_SANDBOX = https://healthidsbx.abdm.gov.in/api
ABDM_PHR_BASE_URL_SANDBOX      = https://phrsbx.abdm.gov.in
ABDM_DEV_SERVICE_URL           = https://dev.abdm.gov.in/devservice

Sandbox ABHA app for testing: https://phrsbx.abdm.gov.in
Dev forum: https://devforum.abdm.gov.in
Support: integration.support@nha.gov.in

## ══════════════════════════════════════════════════
## 10. POSTGRESQL SCHEMA OVERVIEW
## ══════════════════════════════════════════════════

Schema: public (application data)
  patients            — patient master, UUID PK, abha_number (encrypted)
  appointments        — appointment records
  health_professionals — doctor/nurse profiles
  health_facilities   — facility master (maps to HFR IDs)
  audit_logs          — immutable PHI access audit trail

Schema: abdm (ABDM integration data)
  abdm.abha_profiles      — ABHA linked profiles, requestId correlation
  abdm.care_contexts      — linked care contexts per patient
  abdm.consent_artefacts  — full consent artefact JSON, status, expiry
  abdm.health_info_requests — health info request/transfer tracking
  abdm.callback_log       — raw callback payloads (for debugging/replay)

All ABDM tables: UUID PK, created_at, updated_at, soft-delete (deleted_at)
Sensitive columns encrypted: pgcrypto pgp_sym_encrypt/pgp_sym_decrypt
