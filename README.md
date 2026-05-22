# AbhaSetu

Static GoDaddy/cPanel-ready healthcare SaaS showcase for ABDM Milestone 1 journeys, ABHA workflows, telemedicine, QR scanning, connected facilities, security, compliance, insights, and support pages.

The current dark teal AbhaSetu theme is intentionally preserved. New work should extend the existing `index.html`, `style.css`, and `app.js` structure unless the deployment target changes from static hosting to a Node-capable stack.

## Demo Roles

- Admin: `admin@abhasetu.com` / `Admin@123`
- Doctor: `doctor@abhasetu.com` / `Doctor@123`
- Patient: `patient@abhasetu.com` / `Patient@123`
- Operator: `operator@abhasetu.com` / `Operator@123`

## Recommended Production Architecture

- Frontend: Next.js App Router, TypeScript, TailwindCSS, shadcn/ui, Zustand, TanStack Query.
- Backend: NestJS, PostgreSQL, Prisma, Helmet, CORS allowlist, rate limiting, validation pipes.
- Auth: access JWT, refresh token in Secure HttpOnly SameSite cookie, role and permission guards.
- ABDM: backend proxy for V3 APIs, token cache, retry handling, request IDs, timestamps, X-CM-ID.
- QR: `html5-qrcode` or ZXing with camera permission, retry, and payload classification states.

## ABDM Environment Variables

Store these only on the backend, never in browser JavaScript:

```bash
ABDM_CLIENT_ID=
ABDM_CLIENT_SECRET=
ABDM_XCM_ID=
ABDM_BASE_URL=https://dev.abdm.gov.in
```

## ABDM Milestone 1 V3 Coverage

Implemented as static UI plus integration-ready abstractions:

- Sandbox authentication and token refresh architecture.
- Create ABHA using Aadhaar OTP.
- Create ABHA address.
- Verify ABHA number.
- Verify ABHA address.
- Download ABHA card.
- Mobile-based ABHA search.
- Returning patient and new patient flows.
- Facility QR and ABHA QR scan journeys.
- Driving license/document architecture support.
- RSA-OAEP SHA-1 encryption helper for Aadhaar, mobile, and OTP payloads.

## Database Blueprint

Recommended tables:

- `users`
- `roles_permissions`
- `abha_profiles`
- `doctors`
- `facilities`
- `qr_sessions`
- `consultations`
- `health_records`
- `translations`
- `settings`
- `notifications`

## Security Notes

- Do not place ABDM credentials in static hosting.
- Use HTTPS for camera access and production traffic.
- Redact Aadhaar, ABHA number, mobile, OTP, tokens, and health identifiers from logs.
- Rate-limit auth, OTP, QR session, and ABDM proxy routes.
- Store real refresh tokens in Secure HttpOnly SameSite cookies.
- Keep health documents as secure references, not public URLs.

## GoDaddy Deployment

The existing `.cpanel.yml` copies the static app to cPanel `public_html`. Live ABDM calls require a backend proxy hosted separately or a Node-capable hosting plan.
