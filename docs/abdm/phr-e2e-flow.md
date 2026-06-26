# ABDM PHR — End-to-End Flow

This document traces a complete patient journey from PHR enrollment through consent approval, aligned with ABDM integrator certification paths.

## Sequence diagram

```mermaid
sequenceDiagram
    participant U as Patient (PHR UI)
    participant B as Abha Setu BFF
    participant A as ABHA V3 Gateway
    participant C as Consent Manager
    participant H as HIE-CM Gateway
    participant HIP as Hospital (HIP)

    Note over U,HIP: Phase 1 — Enrollment (new PHR user)
    U->>B: enrollment-request-otp (mobile)
    B->>A: POST /phr/web/enrollment/request/otp
    A-->>B: txnId
    B-->>U: txnId
    U->>B: enrollment-verify (OTP)
    B->>A: POST /phr/web/enrollment/verify
    A-->>B: session / txnId
    U->>B: enrollment-suggestion
    B->>A: GET /phr/web/enrollment/suggestion
    A-->>B: abhaAddressList
    U->>B: enrollment-enrol (chosen address)
    B->>A: POST /phr/web/enrollment/enrol
    A-->>B: ABHA address created

    Note over U,HIP: Phase 2 — Login (returning user)
    U->>B: login-abha-search
    B->>A: POST /phr/web/login/abha/search
    A-->>B: txnId
    U->>B: login-abha-request-otp
    B->>A: POST /phr/web/login/abha/request/otp
    U->>B: login-abha-verify
    B->>A: POST /phr/web/login/abha/verify
    A-->>B: X-Token
    B-->>U: session token

    Note over U,HIP: Phase 3 — Consent PIN setup
    U->>B: create-pin (X-Token, PIN)
    B->>C: POST /patients/pin
    C-->>B: PIN registered
    U->>B: verify-pin
    B->>C: POST /patients/verify-pin
    C-->>B: OK

    Note over U,HIP: Phase 4 — Health locker
    U->>B: list-lockers (X-Token)
    B->>H: GET /subscription-requests/v3/patients/lockers
    H-->>B: locker list
    U->>B: setup-locker
    B->>H: POST /subscription-requests/v3/setup-locker
    H-->>B: subscription request

    Note over U,HIP: Phase 5 — Consent from hospital
    HIP->>H: Consent request initiated (M2/M3)
    H-->>U: Push / in-app notification
    U->>B: list-consents
    B->>H: GET /consent/v3/request?status=REQUESTED
    H-->>B: pending requests
    U->>B: verify-pin (before approve)
    B->>C: POST /patients/verify-pin
    U->>B: approve-consent
    B->>H: POST /consent/v3/request/{id}/approve
    H-->>HIP: Consent artefact granted
    HIP->>H: Health information transfer (Fidelius)
    H-->>U: Records in locker / PHR app
```

## Phase summaries

### Phase 1 — New user enrollment

1. Patient opens `/phr` → **Enrollment** tab.
2. Enters mobile → OTP sent via ABHA PHR enrollment API.
3. Verifies OTP → receives transaction context.
4. Selects suggested ABHA address → enrolls PHR identity.
5. **Outcome:** `patient.name@sbx` (sandbox) ready for login.

### Phase 2 — Returning user login

1. Patient enters ABHA address → search confirms account.
2. OTP sent to Aadhaar-linked mobile → verify.
3. **Outcome:** `X-Token` stored in UI session for profile/PIN/locker.

### Phase 3 — Consent PIN (mandatory for consent actions)

1. First-time: **Create PIN** (`POST /patients/pin`).
2. Each consent approval: **Verify PIN** first.
3. **Forgot flow:** generate OTP → validate OTP → `PUT /patients/reset-pin`.

### Phase 4 — Health locker setup

1. List available lockers from HIECM gateway.
2. Subscribe/setup locker for the patient ABHA address.
3. Locker becomes the routing point for linked care contexts.

### Phase 5 — Consent & records

1. HIP initiates consent (M2) or HIU requests records (M3).
2. Patient sees request in **Locker & Consent** tab.
3. After PIN verification, patient approves or denies.
4. On approval, FHIR bundles flow to locker; viewable under **Health Records** (M3 HIU path).

## Forgot PIN sub-flow

```mermaid
flowchart LR
    A[Forgot PIN] --> B[generate-otp]
    B --> C[validate-otp]
    C --> D[reset-pin with sessionId]
    D --> E[verify-pin with new PIN]
```

## Testing the E2E flow locally

1. Start backend (`:3001`) and frontend.
2. Open `/phr`.
3. **Login** tab: use any `@sbx` address → OTP `123456`.
4. Copy **X-Token** from success message.
5. **Consent PIN** tab: create PIN `1234`, verify.
6. **Locker & Consent** tab: list lockers and consents.
7. Run automated suite: `GET http://localhost:3001/api/abdm/tests/phr`.

## Certification alignment

| E2E phase | ABDM test source |
|-----------|------------------|
| Enrollment | `V3_Update_Test_Cases_for_integrators_PHR_mobile_app.xlsx` |
| Login / Profile | M1 Postman PHR Web section |
| Consent PIN | `Consent_Pin_postman_collection` |
| Locker / Consent | `PHR & Locker (HIECM)` collection |
| Cross-milestone | Sandbox portal Test Cases documentation |

See [certification-checklist.md](./certification-checklist.md) for the full mapped test matrix.

## Related modules in Abha Setu

| Module | Role in E2E |
|--------|-------------|
| `identity` | ABHA number creation (M1) — upstream of PHR |
| `phr` | PHR-specific enrollment, login, PIN, locker |
| `hip-linking` | Scan & Share, care context discovery (M2) |
| `consent-hiu` | HIU consent init & record fetch (M3) |
| `health-records` | Decrypted FHIR viewer |
