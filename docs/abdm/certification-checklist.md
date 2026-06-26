# ABDM Certification Checklist — Abha Setu

This checklist maps ABDM sandbox certification documents to Abha Setu implementation and automated tests.

## How to run tests

| Suite | Endpoint | Scope |
|-------|----------|-------|
| Core M1/M2/M3 + HPR + Scan + UHI + NHCX | `GET /api/abdm/tests` | 14 integration tests |
| **PHR-specific** | `GET /api/abdm/tests/phr` | 17 PHR compliance tests |

## Source documents (integrator packages)

| Document | Location | Milestone |
|----------|----------|-----------|
| M1 ABHA Creation & Verification | `M1_ABHA_CREATION_AND_VERIFICATION_WITH_APIS_UPDATED_V1_1.xlsx` | M1 |
| PHR Mobile App V3 Test Cases | `V3_Update_Test_Cases_for_integrators_PHR_mobile_app.xlsx` | PHR |
| M2 Building HIP | `M2_BUILDING_HIP_WITH_APIS_UPDATED_22_Aug.xlsx` | M2 |
| M3 Building HIU | `M3_BUILDING_HIU_WITH_APIS_UPDATED_22_August.xlsx` | M3 |
| HPR Test Cases | `HPR_Test_Cases_Final.xlsx` | HPR |
| HFR M4 | `HFR_m4_16_mar_2024.xlsx` | M4 |
| New Functionalities (2024) | `New_Functionalities_23_02_2024.pptx` | Cross-cutting |
| Sandbox portal | https://sandbox.abdm.gov.in/sandbox/v3/new-documentation?doc=TestCases | All |

Postman collections: `docs/abdm/postman/` (Milestone_1, PHR-HIECM-V3, PHR-HIECM-Consent, PHR-HID-Legacy).

---

## PHR compliance matrix (`GET /api/abdm/tests/phr`)

| Test ID | Module | Scenario | ABDM reference | Implementation |
|---------|--------|----------|--------------|----------------|
| PHR-E01 | PHR_ENROLL | Mobile OTP request — success | PHR mobile TC-01 | `PhrService.enrollmentRequestOtp` |
| PHR-E02 | PHR_ENROLL | Mobile OTP — empty mobile rejected | PHR mobile TC-02 | Validation in service |
| PHR-E03 | PHR_ENROLL | OTP verify — success | PHR mobile verify TC-01 | `enrollmentVerify` |
| PHR-E04 | PHR_ENROLL | ABHA address suggestions | Suggestion TC-01 | `enrollmentSuggestion` |
| PHR-E05 | PHR_ENROLL | Address availability (isExists) | isExists TC-01 | `enrollmentIsExists` |
| PHR-L01 | PHR_LOGIN | ABHA search | M1 PHR Web search | `loginAbhaSearch` |
| PHR-L02 | PHR_LOGIN | Request login OTP | M1 PHR Web request/otp | `loginAbhaRequestOtp` |
| PHR-L03 | PHR_LOGIN | Verify login OTP → token | M1 PHR Web verify | `loginAbhaVerify` |
| PHR-P01 | PHR_PROFILE | Fetch profile with X-Token | PHR profile GET | `getProfile` |
| PHR-P02 | PHR_PROFILE | Download PHR card | PHR phrCard | `getPhrCard` |
| PHR-PIN01 | PHR_PIN | Create consent PIN | Consent Pin — create | `createPin` |
| PHR-PIN02 | PHR_PIN | Verify consent PIN | Consent Pin — verify | `verifyPin` |
| PHR-PIN03 | PHR_PIN | Forgot PIN — generate OTP | Consent Pin — forgot/generate | `forgotPinGenerateOtp` |
| PHR-PIN04 | PHR_PIN | Forgot PIN — validate + reset | Consent Pin — reset flow | `forgotPinValidateOtp` + `resetPin` |
| PHR-LOCK01 | PHR_LOCKER | List patient lockers | HIECM patients/lockers | `listLockers` |
| PHR-CON01 | PHR_CONSENT | List consent requests | HIECM consent/v3/request | `listConsents` |
| PHR-CON02 | PHR_CONSENT | Approve consent request | HIECM approve | `approveConsent` |

---

## M1 ABHA (core identity) — `GET /api/abdm/tests`

| Test ID | Scenario | Service |
|---------|----------|---------|
| SESS-01 | Gateway session | `SessionService` |
| M1-01 | Aadhaar OTP request | `IdentityService` |
| M1-02 | Invalid Aadhaar rejection | `IdentityService` |
| M1-03 | Aadhaar OTP verify | `IdentityService` |
| M1-04 | Profile token refresh | `IdentityService` |
| M1-05 | Profile account fetch | `IdentityService` |

*Maps to `M1_ABHA_CREATION_AND_VERIFICATION_WITH_APIS_UPDATED_V1_1.xlsx` sections: enrollment, profile login, account management.*

---

## M2 HIP — `GET /api/abdm/tests`

| Test ID | Scenario | Service |
|---------|----------|---------|
| M2-01 | Care context discovery | `HipLinkingService` |
| M2-02 | Discovery validation error | `HipLinkingService` |
| M2-03 | Link confirm with OTP | `HipLinkingService` |
| SCAN-01 | Scan & Share OPD token | `HipLinkingService` |

*Maps to `M2_BUILDING_HIP_WITH_APIS_UPDATED_22_Aug.xlsx`: discovery, linking, Scan & Share.*

---

## M3 HIU — `GET /api/abdm/tests`

| Test ID | Scenario | Service |
|---------|----------|---------|
| M3-01 | Consent init + ECDH keys | `ConsentHiuService` |
| M3-02 | Fidelius decrypt / FHIR bundle | `ConsentHiuService` |

*Maps to `M3_BUILDING_HIU_WITH_APIS_UPDATED_22_August.xlsx`: consent request, data flow, decryption.*

---

## HPR — `GET /api/abdm/tests`

| Test ID | Scenario | Service |
|---------|----------|---------|
| HPR-01 | Practitioner search | `HprService` |
| HPR-02 | HPR eKYC OTP | `HprService` |

*Maps to `HPR_Test_Cases_Final.xlsx`.*

---

## Manual certification gaps (require live sandbox)

These items need registered bridge credentials and are validated manually or in staging:

- [ ] Real RSA encryption against ABHA public cert (disable simulation)
- [ ] Async callback registration on devservice bridges
- [ ] HIECM `on-notify` callbacks for consent/subscription
- [ ] Fidelius end-to-end with live HIP push
- [ ] HFR M4 facility registry flows (`HFR_m4_16_mar_2024.xlsx`)
- [ ] Production environment smoke (`PHR_Production_V3`, `HIECM_Production_V3` env files)

---

## Environment setup for PHR certification

```env
ABDM_ENV=sandbox
ABDM_CLIENT_ID=<from sandbox portal>
ABDM_CLIENT_SECRET=<from sandbox portal>
ABDM_CM_ID=sbx
ABDM_SIMULATION_MODE=false   # for live gateway tests
ABDM_ABHA_BASE_URL_SANDBOX=https://abhasbx.abdm.gov.in/abha
ABDM_PHR_CM_BASE_URL_SANDBOX=https://dev.abdm.gov.in/cm
ABDM_GATEWAY_BASE_URL_SANDBOX=https://dev.abdm.gov.in
```

Import Postman environments from CMS downloads: `PHR_Sandbox_V3`, `HIECM_Sandbox_V3`.

---

## UI verification checklist

- [ ] `/phr` — Enrollment OTP → verify → suggestion → enrol
- [ ] `/phr` — ABHA login → X-Token issued
- [ ] `/phr` — Profile + PHR card download
- [ ] `/phr` — Create / verify / forgot / reset consent PIN
- [ ] `/phr` — List lockers and consent requests
- [ ] `/health-records` — FHIR bundles after M3 consent
- [ ] Admin → ABDM Config — session and gateway status
