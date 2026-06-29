# Milestone 1 — API Matrix (Postman vs AbhaSetu BFF)

Reference collections:
- Milestone 1 (18 Aug 2025)
- Scan and Share (14 Aug 2025)
- Running token status

BFF base: `/api/abdm/*` → `backend/src/abdm/identity/identity.controller.ts`

---

## Integrated APIs (wired to UI)

| Category | ABDM path | BFF route | UI navigation |
|----------|-----------|-----------|---------------|
| Session | `POST /api/hiecm/gateway/v3/sessions` | Session service (internal) | All flows (auto) |
| Certificate | `GET /api/v3/profile/public/certificate` | Session service (internal) | RSA encrypt before gateway calls |
| Enrollment OTP | `POST /api/v3/enrollment/request/otp` | `POST /api/abdm/v3/enrollment/request/otp` | ABHA creation |
| Enrol by Aadhaar | `POST /api/v3/enrollment/enrol/byAadhaar` | `POST /api/abdm/v3/enrollment/enrol/byAadhaar` | ABHA creation |
| Auth by ABDM | `POST /api/v3/enrollment/auth/byAbdm` | `POST /api/abdm/v3/enrollment/auth/byAbdm` | ABHA creation |
| ABHA address suggestion | `GET /api/v3/enrollment/enrol/suggestion` | `GET /api/abdm/v3/enrollment/enrol/suggestion` | ABHA address step |
| Create ABHA address | `POST /api/v3/enrollment/enrol/abha-address` | `POST /api/abdm/v3/enrollment/enrol/abha-address` | ABHA address step |
| Profile login OTP | `POST /api/v3/profile/login/request/otp` | `POST /api/abdm/v3/profile/login/request/otp` | Login → ABHA |
| Profile login verify | `POST /api/v3/profile/login/verify` | `POST /api/abdm/v3/profile/login/verify` | Login → ABHA |
| Profile login search | `POST /api/v3/profile/login/search` | `POST /api/abdm/v3/profile/login/search` | Login |
| Profile login verify user | `POST /api/v3/profile/login/verify/user` | `POST /api/abdm/v3/profile/login/verify/user` | Login |
| Get profile | `GET /api/v3/profile/account` | `GET /api/abdm/v3/profile/account` | Profile → My Profile |
| ABHA card | `GET /api/v3/profile/account/abha-card` | `GET /api/abdm/v3/profile/account/abha-card` | Profile card |
| QR code | `GET /api/v3/profile/account/qrCode` | `GET /api/abdm/v3/profile/account/qrCode` | Profile |
| Update profile | `PATCH /api/v3/profile/account` | `PATCH /api/abdm/v3/profile/account` | Edit Profile |
| Re-KYC / account OTP | `POST /api/v3/profile/account/request/otp` | `POST /api/abdm/v3/profile/account/request/otp` | Re-KYC |
| Account verify | `POST /api/v3/profile/account/verify` | `POST /api/abdm/v3/profile/account/verify` | Re-KYC, Set Password |
| **Delete OTP** | same request/otp | `POST /api/abdm/v3/profile/account/delete/request-otp` | Profile → Delete ABHA |
| **Delete verify** | same verify | `POST /api/abdm/v3/profile/account/delete/verify` | Delete wizard |
| **Deactivate OTP** | scope `de-activate` | `POST /api/abdm/v3/profile/account/deactivate/request-otp` | Profile → Deactivate ABHA |
| **Deactivate verify** | scope `de-activate` | `POST /api/abdm/v3/profile/account/deactivate/verify` | Deactivate wizard |
| Logout | `GET /api/v3/profile/account/request/logout` | `GET /api/abdm/v3/profile/account/request/logout` | After delete/deactivate success |
| Refresh token | `GET /api/v3/profile/account/request/token` | `GET /api/abdm/v3/profile/account/request/token` | My Profile → Refresh Token |
| Set password | via account verify | `POST /api/abdm/v3/profile/account/set-password` | Set Password |
| Delink | mobile-verify + de-link | `POST /api/abdm/v3/profile/account/delink` | Delink ABHA |
| Forgot ABHA | forgot flows | `POST /api/abdm/v3/forgot/abha/*` | Login recovery |
| Enrol by DL | DL endpoints | `POST /api/abdm/v3/enrollment/dl/*` | DL enrollment |
| Pincode lookup | — | `GET /api/abdm/pincode/:pincode` | Edit Profile address |

**Client response policy:** BFF responses include `abdmResponse` with the **full ABDM gateway JSON** for Network tab debugging, plus `status` and `message` for UI. Secrets (`ABDM_CLIENT_ID` / `ABDM_CLIENT_SECRET`) are never exposed — use `GET /api/abdm/public/branding` for theme/logo only.

**Profile login:** Implemented in `profile-login.service.ts` with Postman-compliant scopes (mobile, ABHA number ± Aadhaar/mobile OTP, ABHA address). Biometrics excluded.

Full inventory (186 endpoints): `docs/milestone-api-inventory.md`  
Rulebook for future features: `.cursor/rules/abdm-api-standards.mdc`

---

## Missing or partial (not fully isolated / no UI)

| ABDM area | Postman item | Status |
|-----------|--------------|--------|
| **Reactivate ABHA** | `scope: re-activate` + login OTP | Not implemented — placeholder tab only |
| **Scan & Share** | HIP scan/share token APIs | Not in BFF — Milestone 2 |
| **Running token status** | Token status polling | Not in BFF |
| **Enrol by document** | `POST .../enrol/byDocument` | BFF route exists; UI coverage partial |
| **Email verification link** | `POST .../request/emailVerificationLink` | BFF exists; verify Edit Profile flow |
| **ABHA search by mobile** | `POST .../abha/search` | BFF exists; limited UI |
| **PHR web login/enrollment** | PHR collection paths | Not mapped to current patient UI |
| **Legacy combined routes** | `POST .../account/delete`, `.../deactivate` | Deprecated — use isolated `.../delete/*` and `.../deactivate/*` |

---

## Deactivate Send OTP — Postman payload (reference)

```http
POST /api/v3/profile/account/request/otp
X-token: Bearer {{jwtToken}}
Authorization: Bearer Token {{accessToken}}
```

```json
{
  "scope": ["abha-profile", "de-activate"],
  "loginHint": "abha-number",
  "loginId": "{{RSA encrypted 14-digit ABHA}}",
  "otpSystem": "aadhaar"
}
```

**Common failure:** `LoginId is invalid` when ABHA is masked (`XXXX`), not 14 digits, or RSA certificate/session token is invalid. BFF resolves full ABHA from `GET /profile/account` when the client omits a masked number.
