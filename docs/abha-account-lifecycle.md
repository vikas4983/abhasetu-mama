# ABHA Account Lifecycle — Developer Guide

This document explains how **Delete**, **Deactivate**, **Reactivate**, and **Refresh Token** are structured in AbhaSetu, how to navigate the UI step-by-step, and where code lives so features stay isolated.

---

## Architecture (feature isolation)

Each lifecycle action has its **own frontend feature folder** and **dedicated BFF routes**. Shared UI (warnings, survey, auth method, OTP, API response card) lives only in `abha-account-lifecycle/shared` and is configured per feature — changing delete scopes cannot break deactivate.

| Feature | Frontend | BFF routes | Backend service | ABDM scope |
|---------|----------|------------|-----------------|------------|
| **Delete** | `src/features/abha-delete/` | `POST .../delete/request-otp`, `POST .../delete/verify` | `account-delete.service.ts` | `abha-profile`, `delete` |
| **Deactivate** | `src/features/abha-deactivate/` | `POST .../deactivate/request-otp`, `POST .../deactivate/verify` | `account-deactivate.service.ts` | `abha-profile`, `de-activate` |
| **Reactivate** | `src/features/abha-reactivate/` | *(next slice)* | *(planned)* | `abha-profile`, `reactivate` |
| **Refresh token** | `src/features/abha-refresh-token/` | `GET .../request/token` | `identity.service.ts` | R-token header |
| **Logout** | `src/features/patient-logout/` | `GET .../request/logout` | `identity.service.ts` | — |

Legacy combined tab `deactivate_delete` is replaced by separate menu items.

RSA encryption of `loginId`, `otp`, and `password` happens **on the NestJS BFF** before calling ABDM — the browser sends plaintext to your own API over HTTPS.

---

## Profile menu (8 items)

Path: **`/profile`** (patient must be logged in with ABHA profile).

1. **My Profile** — demographics, ABHA card, **Refresh token** panel  
2. **Edit Profile** — mobile, email, photo  
3. **Set Password**  
4. **Re-KYC Verification**  
5. **Deactivate ABHA (Temporarily)** — phased wizard  
6. **Delete ABHA (Permanently)** — phased wizard  
7. **Delink ABHA** — existing delink tab  
8. **Reactivate ABHA** — placeholder until reactivate API slice  

---

## Step-by-step: Delete ABHA (UI)

### Phase 1 — Warnings
Open **Profile → Delete ABHA (Permanently)**. Read permanent deletion warnings → **I understand, continue**.

### Phase 2 — Help us improve?
Select one survey reason (or **Any other reason** + text) → **Continue**.

### Phase 3 — Verification method
Choose one:
- OTP on **Aadhaar-linked** mobile (`otpSystem: aadhaar`)
- OTP on **ABHA-linked** mobile (`otpSystem: abdm`)
- **ABHA password** (skips OTP request; goes straight to password)

### Phase 4 — OTP or password
- **OTP path:** BFF calls `POST /api/v3/profile/account/request/otp` with:
  ```json
  {
    "scope": ["abha-profile", "delete"],
    "loginHint": "abha-number",
    "loginId": "<RSA encrypted ABHA number>",
    "otpSystem": "aadhaar" | "abdm"
  }
  ```
  Enter 6-digit OTP → **Verify & submit** → BFF calls `POST /api/v3/profile/account/verify` with `reasons` array.

- **Password path:** BFF calls verify directly:
  ```json
  {
    "scope": ["abha-profile", "delete"],
    "authData": {
      "authMethods": ["password"],
      "password": { "password": "<encrypted>" }
    },
    "reasons": ["..."]
  }
  ```

### Phase 5 — Result
On success, ABDM logout runs, session cookies clear, and you are redirected to login. **Only the server `message` is shown on errors** — raw gateway JSON is not exposed in the UI.

---

## Step-by-step: Deactivate ABHA

Same wizard as delete, but:
- Menu: **Deactivate ABHA (Temporarily)**
- Scope: `["abha-profile", "de-activate"]` (hyphenated per ABDM Postman)
- Warnings describe **temporary** loss of ABDM access
- BFF: `.../deactivate/request-otp` and `.../deactivate/verify`

**ABHA number:** If the profile displays a masked number (`XXXX`), the client sends an empty `abhaNumber` and the BFF resolves the full 14-digit value from `GET /profile/account` before RSA encryption.

---

## Step-by-step: Refresh token

1. Open **Profile → My Profile**
2. Scroll to **Refresh ABHA session token**
3. Click **Refresh token**
4. BFF: `GET /api/v3/profile/account/request/token` with:
   - `Authorization: Bearer Token <gateway access token>`
   - `R-token: Bearer <refresh JWT from cookie>`
   - `REQUEST-ID`, `TIMESTAMP`

Response is shown in the same response card pattern.

---

## ABDM gateway reference (Delete)

| Step | Gateway URL | Method |
|------|-------------|--------|
| Request OTP | `https://abhasbx.abdm.gov.in/abha/api/v3/profile/account/request/otp` | POST |
| Verify OTP / Password | `https://abhasbx.abdm.gov.in/abha/api/v3/profile/account/verify` | POST |
| Refresh token | `https://abhasbx.abdm.gov.in/abha/api/v3/profile/account/request/token` | GET |

### Common error shapes (shown in UI)
- `900901` — Invalid Credentials  
- `Invalid Scope`, `Invalid LoginId`, `Invalid Login Hint`  
- `X-token expired` / `Invalid X-token`  
- OTP: `authResult: failed`, `OTP expired, please try again`

---

## Storybook

```bash
npm run storybook
```

- **Patient / AccountActionWizard** — full delete flow with mock APIs  
- **Patient / LogoutDialog** & **LogoutResponseCard** — patient logout  

---

## Local testing checklist

1. Log in as patient via ABHA login (ensures `x_token` cookie and full `ABHANumber` in session).  
2. **Profile → Deactivate ABHA** — Send OTP; confirm error text is a single message (no gateway JSON).  
3. **Profile → Delete ABHA** — walk all wizard steps.  
4. **My Profile → Refresh token** — verify message-only response.  
5. See `docs/milestone1-manual-test-cases.md` for full cases.

---

## Docker: check database tables

```bash
docker ps
docker exec -it abhasetu-db psql -U postgres -d abhasetu -c "\dt"
```

Default: user `postgres`, password `1234`, database `abhasetu` (see `docker-compose.yml`).

---

## Next slices (planned)

1. **Reactivate ABHA** — `account-reactivate.service.ts` + wizard (same shared component)  
2. **Delink** — migrate to `src/features/abha-delink/` with phased modal  
3. Remove legacy `POST .../account/deactivate` and `.../delete` once all clients use isolated routes  

---

## File map

```
src/features/
  abha-account-lifecycle/shared/   # Wizard + response card + survey constants
  abha-delete/                     # Delete-only API + panel
  abha-deactivate/                 # Deactivate-only API + panel
  abha-reactivate/                 # Placeholder panel
  abha-refresh-token/              # Token refresh panel
  patient-logout/                  # Patient logout (header)

backend/src/abdm/identity/
  account-delete.service.ts
  account-deactivate.service.ts
  identity.controller.ts           # Isolated routes under .../delete/* and .../deactivate/*
```
