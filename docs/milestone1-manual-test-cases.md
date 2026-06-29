# Milestone 1 — Manual Test Cases

Prerequisites:
- Sandbox credentials in backend `.env` (`ABDM_CLIENT_ID`, `ABDM_CLIENT_SECRET`, `ABDM_CM_ID=sbx`)
- Valid ABHA test account with Aadhaar-linked mobile
- Patient logged in via ABHA login (`x_token` cookie present)

---

## TC-01 — Deactivate ABHA — Send OTP (Aadhaar)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Go to `/profile` | Profile menu loads |
| 2 | Click **Deactivate ABHA (Temporarily)** | Wizard opens (warnings) |
| 3 | Accept warnings → select survey reason → Continue | Auth method step |
| 4 | Choose **Aadhaar-linked mobile OTP** → Send OTP | Success toast/message; OTP step; no raw gateway JSON |
| 5 | On failure | Only server `message` shown (e.g. `LoginId is invalid`) |

---

## TC-02 — Deactivate ABHA — Full OTP verify

| Step | Action | Expected |
|------|--------|----------|
| 1 | Complete TC-01 through OTP send | `txnId` stored server-side in wizard state |
| 2 | Enter sandbox OTP → Verify | Success message |
| 3 | After success | ABDM logout called; redirect `/login`; local session cleared |

---

## TC-03 — Delete ABHA — Password path

| Step | Action | Expected |
|------|--------|----------|
| 1 | Profile → **Delete ABHA (Permanently)** | Wizard opens |
| 2 | Complete warnings + survey | Auth method step |
| 3 | Choose **ABHA password** | Password field (no OTP send) |
| 4 | Enter password + submit | Verify API; message only on error |

---

## TC-04 — Refresh token

| Step | Action | Expected |
|------|--------|----------|
| 1 | Profile → **My Profile** | Profile details |
| 2 | **Refresh ABHA session token** → Refresh | Success or auth error message only |

---

## TC-05 — My Profile (no mock fallback)

| Step | Action | Expected |
|------|--------|----------|
| 1 | My Profile with valid session | Live ABDM profile data |
| 2 | Gateway down / invalid token | Error message; no fake `91-7561-4088-XXXX` profile |

---

## TC-06 — Accessibility (wizard)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open deactivate wizard | Focus trapped in modal; `role="dialog"` |
| 2 | Tab through controls | Visible focus on all buttons/inputs |
| 3 | OTP step error | `role="alert"` announces message |
| 4 | Mobile viewport 320px | Bottom-sheet layout usable |

---

## TC-07 — Security (OWASP)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Deactivate Send OTP error in DevTools Network | Response body has no `gatewayResponse` |
| 2 | Backend logs | No full ABHA / OTP / password plaintext |

---

## Navigation quick reference

| Feature | Path |
|---------|------|
| Profile hub | `/profile` |
| Deactivate | `/profile` → Deactivate ABHA (Temporarily) |
| Delete | `/profile` → Delete ABHA (Permanently) |
| Re-KYC | `/profile` → Re-KYC Verification |
| Refresh token | `/profile` → My Profile |
| Login | `/login` |
