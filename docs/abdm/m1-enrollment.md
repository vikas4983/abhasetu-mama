# M1 — ABHA Enrollment & Profile

## Mandatory flows (Private HMIS)

1. **Aadhaar OTP enrollment**: `POST /v3/enrollment/request/otp` → `POST /v3/enrollment/enrol/byAadhaar`
2. **Mobile verification**: `POST /v3/enrollment/auth/byAbdm`
3. **Login**: `POST /v3/profile/login/request/otp` → `POST /v3/profile/login/verify`
4. **Download ABHA card**: `GET /v3/profile/account/abha-card`
5. **Verify ABHA by OTP**: profile login flow

## Account management

| Action | OTP request | Verify |
|--------|-------------|--------|
| Re-KYC | `POST /v3/profile/account/request/otp` scope `re-kyc` | `POST /v3/profile/account/verify` |
| Set password | scope `password` | verify with encrypted password |
| Deactivate | scope `deactivate` | `POST /v3/profile/account/verify` |
| Delete | scope `delete` | `POST /v3/profile/account/verify` |
| Find ABHA | `POST /v3/profile/login/request/otp` mobile | `POST /v3/profile/login/verify` |
| ABHA address | `GET /v3/enrollment/enrol/suggestion` | `POST /v3/enrollment/enrol/abha-address` |

## Required headers

- `REQUEST-ID`: UUID
- `TIMESTAMP`: ISO 8601
- `Authorization`: Bearer {gateway token}
- `X-CM-ID`: sbx
- `X-token`: Bearer {user token} (profile ops)

## Encryption

RSA/ECB/OAEPWithSHA-1AndMGF1Padding for Aadhaar, mobile, OTP, password.

Public cert: `GET /v3/profile/public/certificate`

## Backend routes (this project)

Prefix: `/api/abdm/v3/...`
