# ABHA SETU Healthcare App UI Replication

ABHA SETU is a premium React and TypeScript healthcare platform UI for ABDM-ready digital care journeys. It models a production-grade healthcare SaaS experience for ABHA identity, telemedicine, QR-assisted onboarding, digital locker records, health insights, facilities, contact workflows, and policy pages.

The current implementation uses static JSON and mock APIs. The architecture keeps ABDM, QR, contact, certificates, and backend boundaries isolated so they can be replaced by real services, databases, and certified ABDM integrations later.

Official ABDM reference: [ABDM Sandbox V3 Documentation](https://sandbox.abdm.gov.in/sandbox/v3/new-documentation)

## What Is AbhaSetu?

AbhaSetu is a digital healthcare bridge for patients, providers, and care services. It is designed around the ABDM ecosystem, where ABHA identity, consent, verified records, and interoperable health services can reduce repeated paperwork and make care more connected.

This repository demonstrates:

- ABHA and ABDM Milestone 1 ready frontend workflows
- Aadhaar OTP, mobile OTP, ABHA number, ABHA address, ABHA card, and facility QR mock flows
- Certificate-backed telemedicine doctor profiles
- Health Insights, Education, and Skin Care sections
- Contact, About, Terms, and Privacy pages
- Theme and language architecture
- SEO, accessibility, security, and mock backend scaffolding

## Tech Stack

Frontend:

- React 18
- TypeScript
- Vite
- React Router
- Redux Toolkit
- TanStack Query
- Material UI
- Lucide React icons
- i18next
- CSS variable design system with motion-ready classes

Backend:

- Temporary Node.js mock backend in `server/`
- Backend-agnostic frontend service boundary
- ABDM V3 proxy placeholder for future migration

## Setup

Install dependencies:

```bash
npm install
```

Create environment config:

```powershell
Copy-Item .env.example .env
```

Run the frontend:

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

Run the temporary mock backend:

```bash
node server/mock-server.js
```

Backend health check:

```text
http://127.0.0.1:8787/health
```

## Environment Variables

Frontend:

```env
VITE_API_BASE_URL=/api
VITE_APP_VERSION=1.0.0
```

Mock backend:

```env
PORT=8787
CORS_ORIGIN=http://127.0.0.1:5173
```

## ABDM Sandbox Setup

Use only the current ABDM V3 documentation as the source of truth.

Recommended implementation path:

1. Register the application in ABDM sandbox.
2. Store client credentials, private keys, and secrets only on the backend.
3. Proxy ABDM requests through a backend service.
4. Add required request IDs, timestamps, authorization, environment headers, and encryption exactly as the ABDM V3 docs require.
5. Implement Milestone 1 flows: Aadhaar OTP, OTP verification, ABHA creation, ABHA number verification, ABHA address verification, ABHA card download, mobile verification, returning patient flow, and facility QR flow.
6. Persist audit, consent, and transaction metadata in a database before production.
7. Complete sandbox entry, exit, and milestone validation before production usage.

Frontend mock files:

- `src/pages/AbdmPage.tsx`
- `src/features/abdm/abdmMockApi.ts`
- `src/pages/QrScannerPage.tsx`

## QR Scanner Setup

The QR scanner uses `navigator.mediaDevices.getUserMedia`.

Requirements:

- HTTPS or localhost
- Mobile/tablet browser for environment camera
- Camera permission allowed
- Backend validation before any real ABDM transaction

The current scanner is a secure UI and permission-flow mock. Production scanning should add a QR decoding library, payload validation, replay protection, and backend consent logging.

## Theme System

Theme state lives in Redux and persists to local storage.

Files:

- `src/app/store/preferencesSlice.ts`
- `src/app/layouts/AppLayout.tsx`
- `src/assets/styles/design-system.css`
- `style.css`
- `index.html` no-flicker theme bootstrap

The app uses CSS variables so navbar, cards, footer, forms, modals, loaders, scanner, and policy pages can synchronize between dark and light modes.

## Translation System

i18n is configured with English and Hindi resources.

Files:

- `src/i18n/index.ts`
- `src/i18n/locales/en/common.json`
- `src/i18n/locales/hi/common.json`

New product text should be added through namespace-ready JSON keys instead of hardcoding. Hindi strings are stored with Unicode escape sequences to keep files editor-safe.

## Folder Structure

```text
src/
  app/                 Providers, layout, router, Redux store
  assets/styles/       Global design system entrypoint
  components/          Shared UI, SEO, feedback, sections, navigation
  constants/           Mock data, enterprise data, app constants
  features/            Feature-specific services and slices
  i18n/                English and Hindi translation resources
  pages/               Route-level screens
  services/            API client, mock APIs, query helpers
  theme/               Theme tokens and MUI theme
  types/               Domain types
server/                Temporary secure mock backend boundary
public/                Certificates, robots.txt, sitemap.xml
```

## Security Notes

Frontend:

- React escaping prevents most direct output XSS when avoiding unsafe HTML.
- Inputs are validated before mock submission.
- Sensitive data must not be stored in local storage.
- Token handling is centralized in the Axios client for future hardening.
- CSP, robots, sitemap, and secure meta foundations are included.

Backend mock:

- Security headers
- CORS allow-listing
- Masked generic responses
- ABDM V3 proxy placeholder

Production healthcare security must add encryption, audit logs, consent ledgers, rate limiting, structured validation, secret management, and monitoring.

## Accessibility

Implemented foundations:

- Skip navigation
- Semantic sections and forms
- Accessible modal role and Escape close
- Visible button semantics for link actions
- `aria-live` toast/status regions
- Reduced motion support
- Focusable controls and keyboard-friendly filters

Run a final manual keyboard and screen reader pass before launch.

## SEO

Implemented foundations:

- Dynamic meta helper
- Open Graph and Twitter card tags
- Canonical URL support
- Schema.org `MedicalOrganization`
- `robots.txt`
- `sitemap.xml`
- Lazy-loaded images
- Route-level headings

## Available Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run storybook
```

## Deployment

Frontend:

1. Run `npm run build`.
2. Deploy `dist/` to a static host or CDN.
3. Configure SPA fallback to `index.html`.
4. Set security headers at the hosting layer.

Backend:

1. Replace `server/mock-server.js` with a production API service.
2. Store secrets in managed secret storage.
3. Add database persistence for users, consents, QR scans, transactions, audit logs, and documents.
4. Complete ABDM certification, security review, and privacy/legal review.

## Production Readiness Checklist

- Replace static mock data with typed APIs.
- Add real auth and consent management.
- Add certified ABDM V3 backend integration.
- Add QR decoding and backend verification.
- Add database migrations and audit tables.
- Run Lighthouse, axe, keyboard, and screen reader checks.
- Run security testing, dependency scanning, and API rate-limit testing.
- Finalize Terms and Privacy with legal counsel.
