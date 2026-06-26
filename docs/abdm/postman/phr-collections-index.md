# PHR Postman Collections — Reference Index

Official ABDM PHR Postman collections copied to this folder. Each maps to BFF `POST /api/abdm/phr` actions.

| Collection file | CMS / source | Base URL (sandbox) |
|-----------------|--------------|-------------------|
| [PHR-Registration-Enrollment.postman_collection.json](./PHR-Registration-Enrollment.postman_collection.json) | PHR Registration/Enrollment | `https://healthidsbx.abdm.gov.in/api` |
| [PHR-Login.postman_collection.json](./PHR-Login.postman_collection.json) | PHR Login | `https://healthidsbx.abdm.gov.in/api` |
| [PHR-Profile.postman_collection.json](./PHR-Profile.postman_collection.json) | PHR Profile | `https://healthidsbx.abdm.gov.in/api` |
| [PHR-Locker-HIECM.postman_collection.json](./PHR-Locker-HIECM.postman_collection.json) | PHR & Locker (HIECM) | `https://dev.abdm.gov.in/cm` |
| [Consent-PIN.postman_collection.json](./Consent-PIN.postman_collection.json) | Consent PIN | `https://dev.abdm.gov.in/cm` |

**API catalog:** `GET /api/abdm/phr/postman`

---

## 1. PHR Registration / Enrollment

**Postman folders:** `RegistrationWithAadhaar`, `RegistrationWithMobile`, `Search`

| Postman request | Gateway path | BFF `action` |
|-----------------|--------------|--------------|
| `/aadhaar/generateOtp` | `POST /v1/registration/aadhaar/generateOtp` | `hid-aadhaar-generate-otp` |
| `/aadhaar/verifyOTP` | `POST /v1/registration/aadhaar/verifyOTP` | `hid-aadhaar-verify-otp` |
| `/mobile/generateOtp` | `POST /v1/registration/mobile/generateOtp` | `hid-mobile-generate-otp` |
| `/mobile/verifyOtp` | `POST /v1/registration/mobile/verifyOtp` | `hid-mobile-verify-otp` |
| `/mobile/createHealthId` | `POST /v1/registration/mobile/createHealthId` | `hid-mobile-create-health-id` |
| `/existsByHealthId` | `POST /v1/search/existsByHealthId` | `hid-search-exists` |

**PHR Web V3 (also in Milestone_1 / PHR&HIECM collection):**

| BFF `action` | Gateway path |
|--------------|--------------|
| `enrollment-request-otp` | `POST /api/v3/phr/web/enrollment/request/otp` |
| `enrollment-verify` | `POST /api/v3/phr/web/enrollment/verify` |
| `enrollment-suggestion` | `GET /api/v3/phr/web/enrollment/suggestion` |
| `enrollment-is-exists` | `GET /api/v3/phr/web/enrollment/isExists` |
| `enrollment-enrol` | `POST /api/v3/phr/web/enrollment/enrol` |

---

## 2. PHR Login

**Postman folders:** `Authentication`, `LoginWithMobileNumber`

| Postman request | Gateway path | BFF `action` |
|-----------------|--------------|--------------|
| `/auth/init` | `POST /v1/auth/init` | `hid-auth-init` |
| `/auth/confirmWithAadhaarOtp` | `POST /v1/auth/confirmWithAadhaarOtp` | `hid-auth-confirm-aadhaar-otp` |
| `/auth/confirmWithMobileOTP` | `POST /v1/auth/confirmWithMobileOTP` | `hid-auth-confirm-mobile-otp` |
| Mobile login generate OTP | `POST /v2/registration/mobile/login/generateOtp` | `hid-mobile-login-generate-otp` |
| Mobile login verify OTP | `POST /v2/registration/mobile/login/verifyOtp` | `hid-mobile-login-verify-otp` |

**PHR Web V3 ABHA login:**

| BFF `action` | Gateway path |
|--------------|--------------|
| `login-abha-search` | `POST /api/v3/phr/web/login/abha/search` |
| `login-abha-request-otp` | `POST /api/v3/phr/web/login/abha/request/otp` |
| `login-abha-verify` | `POST /api/v3/phr/web/login/abha/verify` |

---

## 3. PHR Profile

**Postman folder:** `Profile`

| Postman request | Gateway path | BFF `action` |
|-----------------|--------------|--------------|
| GET `/account/profile` | `GET /v1/account/profile` | `hid-account-profile` |
| POST `/account/profile` | `POST /v1/account/profile` | `hid-account-update-profile` |
| `/account/qrCode` | `GET /v1/account/qrCode` | `hid-account-qrcode` |

**PHR Web V3 profile:**

| BFF `action` | Gateway path |
|--------------|--------------|
| `get-profile` | `GET /api/v3/phr/web/login/profile` |
| `get-phr-card` | `GET /api/v3/phr/web/login/profile/phrCard` |
| `get-qr-code` | `GET /api/v3/phr/web/login/profile/qrCode` |
| `update-profile` | `POST /api/v3/phr/web/login/profile/updateProfile` |

---

## 4. PHR & Locker (HIECM)

**Postman collection:** `PHR-Locker-HIECM` — Consent Manager (`{{CM_HOST}}`)

| Postman item | Gateway path | BFF `action` |
|--------------|--------------|--------------|
| Create Session | `POST /sessions` | `cm-create-session` |
| Create Session (Verify OTP) | `POST /otpsession/verify` | `cm-otp-session-verify` |
| My Profile | `GET /patients/me` | `cm-patients-me` |
| Consent Requests | `GET /consent-requests` | `cm-list-consent-requests` |
| Grant Consent | `POST /consent-requests/{id}/approve` | `cm-grant-consent` |
| Deny Request | `POST /consent-requests/{id}/deny` | `cm-deny-consent` |
| Get Patient Lockers | `GET /patients/lockers` | `cm-get-patient-lockers` |
| Patients requests | `GET /patients/requests` | `cm-patient-requests` |
| Links | `GET /patients/links` | `cm-patient-links` |
| Create pin | `POST /patients/pin` | `create-pin` |
| Forgot Pin Generate OTP | `POST /patients/forgot-pin/generate-otp` | `forgot-pin-generate-otp` |
| Update Consent PIN | `PUT /patients/reset-pin` | `reset-pin` |

**HIECM V3 (gateway base):**

| BFF `action` | Gateway path |
|--------------|--------------|
| `list-lockers` | `GET /api/hiecm/subscription-requests/v3/patients/lockers` |
| `setup-locker` | `POST /api/hiecm/subscription-requests/v3/setup-locker` |
| `list-consents` | `GET /api/hiecm/consent/v3/request` |
| `approve-consent` | `POST /api/hiecm/consent/v3/request/{id}/approve` |

---

## 5. Consent PIN (dedicated collection)

| Postman request | Gateway path | BFF `action` |
|-----------------|--------------|--------------|
| Create PIN | `POST {{URL}}/cm/patients/pin` | `create-pin` |
| Verify PIN | `POST {{URL}}/cm/patients/verify-pin` | `verify-pin` |
| Change PIN | `POST {{URL}}/cm/patients/change-pin` | `change-pin` |
| Forgot — generate OTP | `POST .../forgot-pin/generate-otp` | `forgot-pin-generate-otp` |
| Forgot — validate OTP | `POST .../forgot-pin/validate-otp` | `forgot-pin-validate-otp` |
| Reset PIN | `PUT .../patients/reset-pin` | `reset-pin` |

---

## Environment variables

```env
ABDM_PHR_HID_BASE_URL_SANDBOX=https://healthidsbx.abdm.gov.in/api
ABDM_PHR_CM_BASE_URL_SANDBOX=https://dev.abdm.gov.in/cm
ABDM_ABHA_BASE_URL_SANDBOX=https://abhasbx.abdm.gov.in/abha
```

## Related docs

- [phr-flow.md](../phr-flow.md)
- [phr-e2e-flow.md](../phr-e2e-flow.md)
- [certification-checklist.md](../certification-checklist.md)
