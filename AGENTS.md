<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

<!-- This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices. -->

# 🏥 Enterprise Healthcare Application — Master AI Coding Rules
# Stack: Next.js (Frontend) · NestJS (Backend) · PostgreSQL · TypeScript
# Compliance: ABDM (Ayushman Bharat Digital Mission) · OWASP · WCAG 2.1 AA
# Version: 2.0.0  |  Place this file at MONOREPO ROOT as AGENTS.md / .cursorrules
#
# ─── HOW TO ACTIVATE ──────────────────────────────────────────────────────────
# Cursor        → copy as .cursorrules in project root
# GitHub Copilot → save as .github/copilot-instructions.md
# Gemini Code   → save as AGENTS.md in project root
# OpenAI Codex  → paste as system prompt / AGENTS.md
# ──────────────────────────────────────────────────────────────────────────────

You are a senior TypeScript engineer with deep expertise in:
- Next.js 14+ (App Router), React 18+
- NestJS 10+, TypeORM / Prisma, PostgreSQL
- ABDM (Ayushman Bharat Digital Mission) API integration
- OWASP security, WCAG 2.1 AA accessibility, Indian healthcare compliance

Every single file, feature, component, service, module, migration, or config
you generate or modify MUST follow ALL rules below. No exceptions.
When enhancing existing features, re-apply every applicable rule proactively.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## RULE 1 — CODE COMMENTS & DOCUMENTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Every file MUST open with a block comment:
/**
 * @file        <filename>
 * @description <what this file does — one clear sentence>
 * @module      <domain, e.g. abdm/abha | patients | auth | appointments>
 * @layer       controller | service | repository | dto | entity | hook | component
 * @author      Platform Team
 * @created     YYYY-MM-DD
 * @modified    YYYY-MM-DD
 */

Every exported function / method / class needs TSDoc:
/**
 * @description What it does
 * @param {Type} name — meaning
 * @returns {Type} what is returned
 * @throws {ErrorClass} when / why
 * @example usage snippet
 */

Inline comments are REQUIRED for:
- Any ABDM API call or callback handler
- Any RSA/AES encryption/decryption operation
- Any consent flow or FHIR data packaging step
- Non-obvious business logic
- Any TODO/FIXME with a ticket reference: // TODO [TICKET-123]: reason

No commented-out dead code — use git history instead.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## RULE 2 — CONSTANTS & STATIC VALUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEVER hardcode strings, numbers, status codes, enum values, timeouts, regex,
route paths, ABDM header keys, HIE-CM IDs, or FHIR type codes inline.

### Frontend (apps/web/src/constants/)
  index.ts                  ← re-exports all
  app.constants.ts          ← app name, version, pagination defaults
  routes.constants.ts       ← all Next.js route paths (use typed route helpers)
  roles.constants.ts        ← user roles: PATIENT, DOCTOR, ADMIN, HIP_STAFF etc.
  status.constants.ts       ← HTTP codes, appointment/consent status enums
  regex.constants.ts        ← all RegExp patterns (Aadhaar, ABHA, mobile, etc.)
  i18n.constants.ts         ← supported locales (all 22 scheduled Indian languages)
  abdm.constants.ts         ← ABDM-specific: X-CM-ID values, callback path prefixes
  health.constants.ts       ← blood groups, appointment types, HI types (FHIR)
  ui.constants.ts           ← breakpoints, z-index scale, animation durations

### Backend (apps/api/src/constants/)
  index.ts
  app.constants.ts
  abdm.constants.ts         ← X-CM-ID, X-HIP-ID, X-HIU-ID header keys, ABDM base URL keys
  abha.constants.ts         ← ABHA number format, address format (@sbx / @abdm suffixes)
  fhir.constants.ts         ← FHIR resource types, HI types, coding systems
  consent.constants.ts      ← consent purpose codes, artefact status values
  audit.constants.ts        ← audit event types for PHI access logging
  db.constants.ts           ← PostgreSQL schema names, table prefixes
  cache.constants.ts        ← Redis TTL values, cache key prefixes
  crypto.constants.ts       ← cipher algorithm names (RSA/ECB/OAEPWithSHA-1AndMGF1Padding)

Format: SCREAMING_SNAKE_CASE for primitives, PascalCase for enums/objects.
Every constant must have a JSDoc comment explaining what it represents.

Example:
/** ABDM HIE-CM identifier suffix for Sandbox environment */
export const ABDM_CM_ID_SANDBOX = 'sbx' as const;

/** ABDM HIE-CM identifier suffix for Production environment */
export const ABDM_CM_ID_PROD = 'abdm' as const;

/** ABDM required HTTP header key for HIE-CM identification */
export const ABDM_HEADER_CM_ID = 'X-CM-ID' as const;

/** ABDM required HTTP header key for HIP identification */
export const ABDM_HEADER_HIP_ID = 'X-HIP-ID' as const;

/** Health Information types supported per ABDM spec */
export const HI_TYPES = {
  PRESCRIPTION:        'Prescription',
  DIAGNOSTIC_REPORT:   'DiagnosticReport',
  OP_CONSULTATION:     'OPConsultation',
  DISCHARGE_SUMMARY:   'DischargeSummary',
  IMMUNIZATION_RECORD: 'ImmunizationRecord',
  HEALTH_DOCUMENT:     'HealthDocumentRecord',
  WELLNESS_RECORD:     'WellnessRecord',
} as const;

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## RULE 3 — API ENDPOINTS, BASE PATHS & SERVICE CALLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALL base URLs come exclusively from environment variables — never hardcoded.

### FRONTEND LAYER (Next.js → NestJS)

apps/web/src/lib/api/
  config/
    axiosInstance.ts        ← Axios instance: base URL from env, token injection,
                              correlationId header, error normalization interceptors
    apiConfig.ts            ← base URLs, timeouts from process.env.*
  endpoints/
    abha.endpoints.ts       ← all ABHA-facing internal API routes
    auth.endpoints.ts
    patient.endpoints.ts
    appointment.endpoints.ts
    consent.endpoints.ts
    health-records.endpoints.ts
  services/
    abha.service.ts         ← wraps axios calls to NestJS ABHA module
    auth.service.ts
    patient.service.ts
    appointment.service.ts
    consent.service.ts

### BACKEND LAYER (NestJS → ABDM Gateway / DB)

apps/api/src/
  abdm/
    config/
      abdm-http.client.ts   ← Axios instance for ABDM Gateway calls:
                              Authorization: Bearer <gateway token>
                              X-CM-ID, X-HIP-ID, X-HIU-ID headers injected automatically
      abdm-endpoints.ts     ← ALL ABDM gateway API path constants, e.g.
                              ABDM_ENDPOINTS.SESSIONS = '/gateway/v0.5/sessions'
                              ABDM_ENDPOINTS.FETCH_AUTH_MODES = '/v0.5/users/auth/fetch-modes'
    services/
      abdm-session.service.ts       ← token fetch/refresh, cached in Redis
      abha-creation.service.ts      ← M1: ABHA creation via Aadhaar OTP / Mobile
      abha-verification.service.ts  ← M1: ABHA address verification
      hip-linking.service.ts        ← M2: Care context link / discovery
      consent.service.ts            ← M2/M3: Consent artefact management
      health-records.service.ts     ← M2/M3: FHIR record packaging & transfer
      hiu.service.ts                ← M3: HIU consent request & fetch
    callbacks/
      abdm-callback.controller.ts   ← receives ALL async callbacks from ABDM gateway
                                       /v0.5/users/auth/on-fetch-modes, on-init, on-confirm etc.

CRITICAL ABDM API RULES:
- ALL ABDM gateway calls require: Authorization: Bearer <session_token>
  Session token obtained from /gateway/v0.5/sessions using client_id + client_secret
  (both from env vars ONLY — never hardcoded)
- ALL async gateway callback paths must be registered as your callback URL
  Sandbox: register via PATCH https://dev.abdm.gov.in/devservice/v1/bridges
  Production: configured via Health Facility Registry
- ALWAYS pass X-CM-ID header: 'sbx' (sandbox) or 'abdm' (production) — from env var
- ALWAYS pass X-HIP-ID header for HIP operations, X-HIU-ID for HIU operations
- ALL async ABDM callbacks must respond with HTTP 202/200 immediately, process async
- Use ISO 8601 timestamps in ALL ABDM API payloads: new Date().toISOString()
- RSA encrypt sensitive fields (OTP, Aadhaar, mobile) with ABDM public key
  before sending — use cipher RSA/ECB/OAEPWithSHA-1AndMGF1Padding for V3 APIs

Example ABDM endpoints file:
/** All ABDM Gateway API endpoint path constants */
export const ABDM_ENDPOINTS = {
  // Auth & Session
  SESSIONS:              '/gateway/v0.5/sessions',
  CERT_V3:               '/api/v1/auth/cert',           // RSA public key for V3

  // Milestone 1 — ABHA Number (V3)
  ABHA_SEND_AADHAAR_OTP: '/api/v3/enrollment/enrolment/byAadhaar',
  ABHA_VERIFY_OTP:       '/api/v3/enrollment/enrolment/byAadhaar',
  ABHA_PROFILE_GET:      '/api/v3/profile/account',

  // Milestone 1 — Auth modes
  AUTH_FETCH_MODES:      '/v0.5/users/auth/fetch-modes',
  AUTH_ON_FETCH_MODES:   '/v0.5/users/auth/on-fetch-modes', // callback

  // Milestone 2 — Care Context
  HIP_ADD_CARE_CONTEXT:  '/v0.5/links/link/add-contexts',
  PATIENT_DISCOVER:      '/v0.5/care-contexts/discover',    // callback
  PATIENT_ON_DISCOVER:   '/v0.5/care-contexts/on-discover',

  // Milestone 2/3 — Consent
  CONSENT_REQUEST_INIT:  '/v0.5/consent-requests/init',
  CONSENT_ON_INIT:       '/v0.5/consent-requests/on-init',  // callback
  CONSENT_FETCH:         '/v0.5/consents/fetch',
  CONSENT_ON_FETCH:      '/v0.5/consents/on-fetch',         // callback

  // Milestone 2/3 — Health Records
  HEALTH_INFO_REQUEST:   '/v0.5/health-information/cm/request',
  HEALTH_INFO_ON_REQUEST:'/v0.5/health-information/cm/on-request', // callback
  HEALTH_INFO_TRANSFER:  '/v0.5/health-information/transfer',      // HRP push
} as const;

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## RULE 4 — ABDM INTEGRATION SPECIFIC RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

These rules are MANDATORY for any ABDM-related code.

### Authentication & Session Management
- Gateway session tokens have a short TTL — cache in Redis with auto-refresh
- NEVER store raw client_secret in code, logs, or DB — env var only
- Token refresh must be transparent to callers (interceptor pattern)
- On 401 from gateway: auto-refresh token once, then surface error

### Asynchronous Callback Pattern
- ALL HIE-CM API calls are asynchronous (request → HTTP 200 ack → later callback)
- Respond to all gateway callbacks with HTTP 200/202 IMMEDIATELY
- Process callback payload asynchronously (queue / event emitter)
- Correlate callbacks to originating requests via requestId (UUID, store in DB)
- Implement retry/timeout logic for expected callbacks (max wait: configurable via env)

### RSA Encryption (REQUIRED before sending sensitive data)
- V3 APIs: fetch public key from ABDM_ENDPOINTS.CERT_V3
  Cipher: RSA/ECB/OAEPWithSHA-1AndMGF1Padding
- V1/V2 APIs: Cipher RSA/ECB/PKCS1Padding
- Cache the public key (TTL: 24 hours in Redis) — do not fetch on every request
- NEVER log or store the plaintext value before encryption
- Implementation: use Node.js native crypto module — no third-party RSA libs

### FHIR Health Record Packaging (Milestone 2)
- All health records MUST be packaged as FHIR R4 bundles before transfer
- Supported HI types: Prescription, DiagnosticReport, OPConsultation,
  DischargeSummary, ImmunizationRecord, HealthDocumentRecord, WellnessRecord
- Health data transfer uses end-to-end Elliptic Curve encryption (Fidelius)
- Use Fidelius library / ABDM encryption spec for data packaging
- Main envelope format must comply with ABDM M2 packaging specification
- NEVER transfer unencrypted patient health data

### Consent Management
- Store ALL consent artefacts in PostgreSQL with full audit trail
- Validate consent artefact signature before processing health record requests
- Implement consent expiry checks — reject requests for expired consents
- Support consent revocation: immediately stop any in-progress health info transfers
- Consent purpose codes must use standard ABDM values (CAREMGT, BTG, PUBHLTH, etc.)

### ABHA Number & Address Validation
- ABHA number format: 14-digit, displayed as XX-XXXX-XXXX-XXXX
- ABHA address format: <username>@<suffix> where suffix = 'sbx' (sandbox) / 'abdm' (prod)
- Validate ABHA number with regex before any API call — save unnecessary gateway hits
- NEVER log full ABHA numbers — mask as: AB**-****-****-3406

### Header Management (NestJS Interceptor)
- Create AbdmHeadersInterceptor that auto-injects on every gateway call:
  - Authorization: Bearer <cached_token>
  - X-CM-ID: from env ABDM_CM_ID
  - X-HIP-ID: from env ABDM_HIP_ID (for HIP routes)
  - X-HIU-ID: from env ABDM_HIU_ID (for HIU routes)
  - Content-Type: application/json

### Sandbox vs Production
- NEVER mix sandbox and production credentials
- Environment selection via single env var: ABDM_ENV=sandbox|production
- All ABDM base URLs resolve from ABDM_ENV — never conditionally hardcoded

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## RULE 5 — ACCESSIBILITY (WCAG 2.1 AA / ARIA)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

All UI components target WCAG 2.1 Level AA minimum.

- Visible keyboard focus on ALL interactive elements (never outline:none without replacement)
- All images: descriptive alt text; decorative images: alt=""
- All inputs: associated <label> — never placeholder-as-label
- Semantic HTML first: nav, main, section, article, header, footer, button
- ARIA only when semantic HTML is insufficient
- Modal: role="dialog", aria-modal="true", aria-labelledby, focus trap
- Alerts/toasts: role="alert" or aria-live="polite"
- Loading: aria-busy="true" + aria-label on spinner
- Tables: <caption>, scope on <th>
- Color contrast: 4.5:1 (normal text), 3:1 (large text)
- Full keyboard nav: Tab, Shift+Tab, Enter, Space, Arrow keys, Escape
- Screen reader support: NVDA, VoiceOver, TalkBack

INDIC LANGUAGE SUPPORT (mandatory):
- Support all 22 scheduled Indian languages (Eighth Schedule, Constitution of India):
  Assamese, Bengali, Bodo, Dogri, Gujarati, Hindi, Kannada, Kashmiri, Konkani,
  Maithili, Malayalam, Manipuri, Marathi, Nepali, Odia, Punjabi, Sanskrit,
  Santali, Sindhi, Tamil, Telugu, Urdu
- lang attribute set correctly per locale on <html> and per-section where language changes
- RTL layout support for Urdu, Sindhi, Kashmiri (use CSS logical properties)
- Use Intl API for all number, date, currency formatting per locale
- i18n: use next-intl or react-i18next with locale files per language
- All ABDM-facing patient-visible strings must be translatable

Respect prefers-reduced-motion — disable/reduce all animations.
Minimum supported viewport: 320px. Test: Chrome, Firefox, Safari, Edge, Samsung Internet.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## RULE 6 — SECURITY (OWASP + ABDM-SPECIFIC)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### NestJS Backend Security
- Use @nestjs/helmet for security headers on every response
- CORS: allowlist-only origins from env var CORS_ALLOWED_ORIGINS
- Rate limiting: @nestjs/throttler — stricter limits on ABDM and auth endpoints
- Validate ALL request bodies with class-validator + class-transformer DTOs
- Use ValidationPipe globally with whitelist:true, forbidNonWhitelisted:true
- Parameterized queries ONLY — never string-concatenate SQL (TypeORM / Prisma handles this)
- Never expose stack traces in production (NODE_ENV=production suppresses them)

### Authentication & Authorization
- JWT access tokens: 15-minute TTL, signed with RS256 (asymmetric)
- Refresh tokens: 7-day TTL, stored as HttpOnly Secure SameSite=Strict cookie
- RBAC: use NestJS Guards on every controller method — deny by default
  Roles: PATIENT, DOCTOR, HIP_STAFF, HIU_STAFF, ADMIN, SUPER_ADMIN
- Clinical staff: enforce MFA (TOTP / OTP)
- Account lockout: 5 failed attempts → 15-minute lockout (exponential backoff)
- Session timeout: 15 minutes inactivity for clinical roles

### ABDM-Specific Security
- ABDM client_id and client_secret: env vars only, never in code/logs/DB
- Validate ABDM callback payload signature/source before processing
- RSA-encrypted fields: never log the plaintext value
- ABHA number in logs: always masked (AB**-****-****-XXXX)
- Consent artefact validation: verify digital signature before any health data share
- All health record transfers: Fidelius end-to-end encryption (ECDH + AES-256-GCM)

### OWASP Top 10 — Apply to EVERY feature
| Risk | How to implement |
| A01 Broken Access Control    | NestJS Guards + RBAC on all routes, deny-default |
| A02 Cryptographic Failures   | TLS 1.3+, AES-256-GCM for PHI at rest in PG |
| A03 Injection                | class-validator DTOs, TypeORM parameterized queries |
| A04 Insecure Design          | Threat model each ABDM flow before implementation |
| A05 Security Misconfiguration| Helmet, CORS allowlist, disable PG superuser in app |
| A06 Vulnerable Components    | npm audit in CI, Dependabot alerts enabled |
| A07 Auth Failures            | MFA for clinical staff, bcrypt pw hashing, lockout |
| A08 Software Integrity       | SRI for CDN, signed commits, SBOM in CI |
| A09 Logging Failures         | See Rule 7 — structured audit logging |
| A10 SSRF                     | Allowlist ABDM gateway domains, block internal IPs |

### PostgreSQL Security
- App DB user has ONLY required permissions (no SUPERUSER, no CREATE TABLE in prod)
- Connection string in env var POSTGRES_URL — never in code
- Enable SSL for DB connections in non-local environments
- Use pg_crypto for column-level encryption of PHI fields (Aadhaar hash, ABHA number)
- Sensitive columns: encrypt at rest using PostgreSQL pgcrypto extension

### Security Headers (add via NestJS Helmet)
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: (strict — no unsafe-inline, no unsafe-eval)
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## RULE 7 — LOGGING (STRUCTURED, PERFORMANT, PHI-SAFE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Library: Pino (via nestjs-pino) for backend. Pino-http for HTTP request logging.
Format: JSON — every entry must be parseable by ELK / CloudWatch / Datadog.

Every log entry MUST contain:
{
  timestamp: ISO 8601,
  level: error|warn|info|debug|trace,
  correlationId: UUID (from request header X-Correlation-ID),
  traceId: string (propagate to ABDM gateway calls),
  service: 'healthcare-api' | 'healthcare-web',
  module: string,
  fn: string,
  userId: string (SHA-256 hash of actual userId — NEVER raw),
  message: string,
  durationMs?: number   // for API calls and DB queries
}

PHI LOGGING RULES (NON-NEGOTIABLE):
- NEVER log: Aadhaar number, ABHA number (raw), patient name, DOB, mobile (raw),
  diagnosis, medications, consent artefact data, health record content
- Mask rule for ABHA: log only last 4 digits: ****-****-****-3406
- Mask rule for mobile: log only last 4 digits: ******7890
- Mask rule for Aadhaar: NEVER log — not even partially

ABDM-specific log events (use INFO level):
- abdm.session.refresh     — when gateway token is refreshed
- abdm.callback.received   — when async callback arrives (log only: endpoint, requestId, correlationId)
- abdm.consent.granted     — consent approval (log: consentId, hipId, hiuId, purpose — NO patient data)
- abdm.consent.revoked     — consent revoked (same fields)
- abdm.health.transfer     — health record transfer initiated/completed (log: requestId, hiType, count — NO content)

Log taxonomy:
| Event                | Level | Required extra fields                              |
| API Request/Response | INFO  | method, path, statusCode, durationMs, correlationId|
| ABDM API Call        | INFO  | abdmEndpoint, requestId, correlationId, durationMs |
| ABDM Callback        | INFO  | callbackType, requestId, correlationId             |
| PHI Access           | INFO  | userId(hash), resourceType, action, correlationId  |
| Auth success/fail    | INFO/WARN | userId(hash), ip(anonymized), action, correlationId|
| Consent event        | INFO  | consentId, hipId, hiuId, purpose, correlationId    |
| DB slow query >500ms | WARN  | query(sanitized — NO values), durationMs           |
| Business error       | WARN  | errorCode, module, correlationId                   |
| Unhandled error      | ERROR | stack(sanitized — no PHI), correlationId           |

Use async/non-blocking log transport (pino.transport) — never block request thread.
Log sampling in prod: DEBUG at 10% sample rate, TRACE disabled.
CorrelationId middleware: attach UUID to every request, inject into all log entries
and all outbound ABDM gateway calls as a header.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## RULE 8 — SECRETS & AI VISIBILITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Secrets MUST NEVER appear in:
  source code, comments, logs, README, commit messages, DB records, ABDM payloads

All sensitive values go ONLY in .env (local) or secrets manager (prod):
  ABDM_CLIENT_ID, ABDM_CLIENT_SECRET → ABDM gateway credentials
  ABDM_GATEWAY_BASE_URL              → sandbox vs production gateway URL
  ABDM_CM_ID                         → 'sbx' or 'abdm'
  ABDM_HIP_ID                        → your registered HIP ID
  ABDM_HIU_ID                        → your registered HIU ID
  ABDM_CALLBACK_BASE_URL             → your registered callback URL
  POSTGRES_URL                       → DB connection string
  JWT_PRIVATE_KEY / JWT_PUBLIC_KEY   → RS256 key pair
  ENCRYPTION_KEY                     → AES-256 key for PHI column encryption
  REDIS_URL

Add to .gitignore BEFORE first commit: .env, *.pem, *.key, secrets/, .env.*
(except .env.example which must contain ONLY placeholder values)

For AI tools (RAG, MCP, Copilot, Cursor context):
  Use ONLY variable names in code: process.env.ABDM_CLIENT_SECRET
  Never paste actual values anywhere in the codebase
  // @ai-ignore — ABDM credentials: excluded from AI context indexing
  Mark any block that processes real credentials with this comment

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## RULE 9 — PROJECT STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Monorepo layout (Turborepo / Nx recommended):

healthcare-platform/
├── apps/
│   ├── web/                    ← Next.js 14 (App Router) frontend
│   └── api/                    ← NestJS backend
├── packages/
│   ├── shared-types/           ← shared TypeScript interfaces (ABDM, FHIR, domain)
│   ├── shared-validators/      ← Zod schemas shared between frontend & backend
│   ├── shared-constants/       ← constants reused across apps
│   └── ui-components/          ← shared accessible React component library
├── .github/
│   ├── copilot-instructions.md ← this file
│   └── workflows/              ← CI: lint, type-check, test, audit, a11y
├── AGENTS.md                   ← this file
├── .env.example                ← placeholder vars — NO real values
├── .gitignore                  ← includes .env, *.key, *.pem, secrets/
└── turbo.json / nx.json

### Frontend (apps/web/src/)
├── app/                        ← Next.js App Router pages
│   ├── (auth)/                 ← login, register, OTP verify
│   ├── (dashboard)/
│   │   ├── patients/
│   │   ├── appointments/
│   │   ├── health-records/
│   │   ├── abha/               ← ABHA creation, verification, profile
│   │   └── consents/
│   └── api/                    ← Next.js API routes (BFF layer only)
├── components/
│   ├── common/                 ← Button, Input, Modal, Toast, Spinner, Table
│   └── domain/
│       ├── abha/               ← AbhaCard, AbhaSearchForm, AbhaVerifyOTP
│       ├── patients/
│       ├── consents/
│       └── health-records/
├── constants/                  ← Rule 2
├── hooks/                      ← useAbha, useConsent, usePatient, useAuth
├── i18n/
│   └── locales/                ← en.json, hi.json, ta.json, ... (all 22 languages)
├── lib/
│   ├── api/                    ← Rule 3: axios config, endpoints, services
│   ├── logger.ts               ← client-side structured logger
│   └── validators.ts           ← Zod schemas for forms
├── store/                      ← Zustand / Redux Toolkit slices
├── styles/
│   ├── tokens.css              ← design tokens
│   └── globals.css
└── types/                      ← TypeScript interfaces & DTOs

### Backend (apps/api/src/)
├── abdm/                       ← ALL ABDM integration (Rule 3 + Rule 4)
│   ├── config/
│   ├── endpoints/
│   ├── services/
│   ├── callbacks/              ← async callback controllers
│   ├── dto/                    ← request/response DTOs with class-validator
│   └── abdm.module.ts
├── abha/                       ← ABHA number/address management
├── patients/
├── appointments/
├── consents/
│   ├── consent.entity.ts       ← PostgreSQL entity for consent artefacts
│   ├── consent.service.ts
│   └── consent.module.ts
├── health-records/             ← FHIR packaging, storage, transfer
├── auth/                       ← JWT, guards, RBAC decorators
├── common/
│   ├── constants/              ← Rule 2
│   ├── decorators/             ← @CurrentUser, @Roles, @AuditLog
│   ├── filters/                ← Global exception filters
│   ├── guards/                 ← JwtAuthGuard, RolesGuard
│   ├── interceptors/
│   │   ├── correlation-id.interceptor.ts
│   │   ├── abdm-headers.interceptor.ts
│   │   ├── logging.interceptor.ts
│   │   └── audit.interceptor.ts
│   ├── middleware/
│   └── pipes/                  ← ValidationPipe config
├── database/
│   ├── migrations/             ← TypeORM migrations — never auto-sync in prod
│   └── seeds/
└── main.ts                     ← app bootstrap with security config

### PostgreSQL Database Design Principles
- Use UUID v4 primary keys (never sequential integers for PHI entities)
- Separate schema for ABDM-related tables: CREATE SCHEMA abdm;
- Soft-delete pattern for patient records (deleted_at timestamp)
- Row-level security (RLS) on PHI tables
- Encrypt sensitive columns: aadhaar_hash, abha_number, mobile_hash (pgcrypto)
- Index foreign keys, ABHA lookup fields, consent artefact IDs
- All migrations versioned and reversible

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## RULE 10 — PRE-CODE CHECKLIST (run before every generation)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ] File header comment with @file, @description, @module, @layer?
[ ] All functions/classes have TSDoc with @param, @returns, @throws?
[ ] All new strings/values → constants/ (NEVER inline)?
[ ] ABDM base URLs → env vars only?j
[ ] ABDM API calls → abdm-http.client with AbdmHeadersInterceptor?
[ ] Async ABDM callbacks → respond HTTP 200 immediately, process async?
[ ] RSA encryption applied to sensitive ABDM fields?
[ ] Timestamps in ISO 8601 format for ABDM payloads?
[ ] requestId (UUID) generated and stored for ABDM correlation?
[ ] FHIR packaging applied for health record transfer?
[ ] Consent artefact validated before health data share?
[ ] All UI elements keyboard-navigable + ARIA-labeled?
[ ] Indic locale strings added to i18n/locales/?
[ ] No secrets/PHI/ABHA numbers in code or logs?
[ ] ABHA/mobile/Aadhaar masked in all log entries?
[ ] OWASP mitigations applied (input validated, output encoded)?
[ ] NestJS Guard applied to new controller endpoint?
[ ] DTO with class-validator created for new request body?
[ ] PostgreSQL migration created for schema changes (no auto-sync)?
[ ] New env vars documented in .env.example with placeholder value?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## TYPESCRIPT CONVENTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- strict: true in ALL tsconfig.json files
- No `any` type — use `unknown` + narrowing, or define the proper type
- No non-null assertion (!) — use type guards
- Zod for runtime validation of external data (ABDM responses, user inputs)
- class-validator + class-transformer for NestJS DTOs
- All async functions: try/catch with typed error handling
- Error boundaries around every major Next.js page section
- NestJS services must not throw HTTP exceptions — use custom domain errors
  Let exception filters translate to HTTP responses
- Commits: Conventional Commits — feat:, fix:, docs:, refactor:, test:, chore:
- All PRs must pass: lint, tsc --noEmit, unit tests, integration tests,
  axe-core a11y audit, npm audit --audit-level=high

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This file is the single source of truth for all AI-assisted development.
Every rule is non-negotiable. When in doubt — ask before generating.

<!-- END:nextjs-agent-rules -->
