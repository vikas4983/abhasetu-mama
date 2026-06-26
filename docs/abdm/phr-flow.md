# ABDM PHR Integration — Flow Guide

This document explains how **Personal Health Records (PHR)** work in Abha Setu, mapped to the **five official Postman collections** in `docs/abdm/postman/`.

| Collection | File |
|------------|------|
| Registration / Enrollment | `PHR-Registration-Enrollment.postman_collection.json` |
| Login | `PHR-Login.postman_collection.json` |
| Profile | `PHR-Profile.postman_collection.json` |
| PHR & Locker (HIECM) | `PHR-Locker-HIECM.postman_collection.json` |
| Consent PIN | `Consent-PIN.postman_collection.json` |

See [postman/phr-collections-index.md](./postman/phr-collections-index.md) for the full Postman → BFF action table.  
**API catalog:** `GET /api/abdm/phr/postman`

## Architecture

```
Next.js UI (/phr)
    → BFF /api/abdm/phr (Next rewrite)
    → NestJS PhrService
    → ABDM Gateways:
        • Legacy HID: healthidsbx.abdm.gov.in/api  (Registration, Login, Profile collections)
        • ABHA V3 PHR Web: abhasbx.abdm.gov.in/abha/api/v3/phr/web/*
        • Consent Manager: dev.abdm.gov.in/cm       (HIECM + Consent PIN collections)
        • HIE-CM V3: dev.abdm.gov.in/api/hiecm/*   (locker subscription V3)
```

When `ABDM_SIMULATION_MODE=true` (default in dev), gateway failures return deterministic sandbox responses so UI and certification tests can run without live credentials.

## 1. PHR Registration / Enrollment

**Postman:** `PHR-Registration-Enrollment.postman_collection.json`  
**Folders:** `RegistrationWithAadhaar`, `RegistrationWithMobile`, `Search`

### Legacy Health ID (healthidsbx)

| BFF `action` | Postman path |
|--------------|--------------|
| `hid-aadhaar-generate-otp` | `POST /v1/registration/aadhaar/generateOtp` |
| `hid-aadhaar-verify-otp` | `POST /v1/registration/aadhaar/verifyOTP` |
| `hid-mobile-generate-otp` | `POST /v1/registration/mobile/generateOtp` |
| `hid-mobile-verify-otp` | `POST /v1/registration/mobile/verifyOtp` |
| `hid-mobile-create-health-id` | `POST /v1/registration/mobile/createHealthId` |
| `hid-search-exists` | `POST /v1/search/existsByHealthId` |

### PHR Web V3 (preferred for new integrators)

**Scopes:** `abha-address-enroll`, `mobile-verify`  
**Encryption:** `loginId` and OTP values are RSA-OAEP encrypted using the PHR public certificate (`GET /api/v3/phr/web/login/public/certificate`).

**Legacy HID APIs** (healthidsbx v1/v2) remain in `docs/abdm/postman/PHR-HID-Legacy.postman_collection.json` for reference; Abha Setu uses **PHR Web V3** as the primary path.

## 2. PHR Login

**Postman:** `PHR-Login.postman_collection.json`  
**Folders:** `Authentication`, `LoginWithMobileNumber`

### Legacy Health ID

| BFF `action` | Postman path |
|--------------|--------------|
| `hid-auth-init` | `POST /v1/auth/init` |
| `hid-auth-confirm-aadhaar-otp` | `POST /v1/auth/confirmWithAadhaarOtp` |
| `hid-auth-confirm-mobile-otp` | `POST /v1/auth/confirmWithMobileOTP` |
| `hid-mobile-login-generate-otp` | `POST /v2/registration/mobile/login/generateOtp` |
| `hid-mobile-login-verify-otp` | `POST /v2/registration/mobile/login/verifyOtp` |

### PHR Web V3 ABHA login

**Output:** `X-Token` (Bearer) used for all subsequent profile, PIN, and locker calls.

Alternative login modes in Postman (mobile OTP, password, profile switch) use paths under `/api/v3/phr/web/login/profile/*` and can be added via the same `PhrService` pattern.

## 3. PHR Profile

**Postman:** `PHR-Profile.postman_collection.json` — folder `Profile`

| BFF `action` | Postman path |
|--------------|--------------|
| `hid-account-profile` | `GET /v1/account/profile` |
| `hid-account-update-profile` | `POST /v1/account/profile` |
| `hid-account-qrcode` | `GET /v1/account/qrCode` |

### PHR Web V3 profile

All profile calls require header: `X-Token: Bearer <session_token>`.

## 4. Consent PIN

**Postman:** `Consent-PIN.postman_collection.json` (also in HIECM collection under Create pin / Forgot Pin)

| Flow | Gateway path | BFF action |
|------|--------------|------------|
| **Create PIN** | `POST /patients/pin` | `create-pin` |
| Verify PIN | `POST /patients/verify-pin` | `verify-pin` |
| Change PIN | `POST /patients/change-pin` | `change-pin` |
| **Forgot PIN** — generate OTP | `POST /patients/forgot-pin/generate-otp` | `forgot-pin-generate-otp` |
| Forgot PIN — validate OTP | `POST /patients/forgot-pin/validate-otp` | `forgot-pin-validate-otp` |
| **Reset PIN** | `PUT /patients/reset-pin` | `reset-pin` |

Reference collection: Consent Pin Postman (`Consent_Pin_postman_collection`).

## 5. PHR & Health Locker (HIECM)

**Postman:** `PHR-Locker-HIECM.postman_collection.json` — Consent Manager `{{CM_HOST}}`

| BFF `action` | Postman item |
|--------------|--------------|
| `cm-create-session` | Create Session |
| `cm-otp-session-verify` | Create Session (Verify OTP) |
| `cm-patients-me` | My Profile |
| `cm-list-consent-requests` | Consent Requests |
| `cm-grant-consent` | Grant Consent |
| `cm-deny-consent` | Deny Request |
| `cm-get-patient-lockers` | Get Patient Lockers |
| `cm-patient-requests` | Patients requests |
| `cm-patient-links` | Links |

### HIECM V3 (gateway)

| BFF `action` | Gateway path |
|--------------|--------------|
| `list-lockers` | `GET /api/hiecm/subscription-requests/v3/patients/lockers` |
| `setup-locker` | `POST /api/hiecm/subscription-requests/v3/setup-locker` |
| `list-consents` | `GET /api/hiecm/consent/v3/request` |
| `approve-consent` | `POST /api/hiecm/consent/v3/request/{id}/approve` |

## API entry points (Abha Setu)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/abdm/phr` | Unified action router (`action` field) |
| `GET` | `/api/abdm/phr/v3/web/login/profile` | Profile proxy (pass `xToken` query) |
| `GET` | `/api/abdm/phr/compliance` | PHR module catalog |
| `GET` | `/api/abdm/phr/postman` | Postman collection → BFF action catalog |
| `GET` | `/api/abdm/tests/phr` | Run PHR compliance test suite |

## Environment variables

| Variable | Sandbox default | Purpose |
|----------|-----------------|---------|
| `ABDM_ABHA_BASE_URL_SANDBOX` | `https://abhasbx.abdm.gov.in/abha` | PHR Web V3 |
| `ABDM_PHR_CM_BASE_URL_SANDBOX` | `https://dev.abdm.gov.in/cm` | Consent PIN |
| `ABDM_GATEWAY_BASE_URL_SANDBOX` | `https://dev.abdm.gov.in` | HIECM V3 |
| `ABDM_SIMULATION_MODE` | `true` | Fallback when gateway unavailable |

## Postman references

Place collections under `docs/abdm/postman/`:

- `PHR-HIECM-V3.postman_collection.json` — PHR app/web + HIECM V3
- `PHR-HIECM-Consent.postman_collection.json` — Consent Manager locker flows
- `PHR-HID-Legacy.postman_collection.json` — Legacy health ID v1/v2
- Environments: `PHR_Sandbox_V3`, `HIECM_Sandbox_V3` (from ABDM CMS downloads)

## UI

Open **Dashboard → PHR** (`/phr`) for tabbed flows: Enrollment, Login, Profile, Consent PIN, Locker & Consent.
