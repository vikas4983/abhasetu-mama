# AbhaSetu Enterprise Healthcare Platform

AbhaSetu has been migrated from the approved HTML/CSS healthcare template into a scalable monorepo with a Next.js 15 frontend and NestJS backend architecture. The existing visual identity is preserved: dark teal healthcare palette, icon-over-label sidebar, raised mobile QR action, compact dashboard cards, footer structure, and current spacing hierarchy.

The original static files remain at the repository root for GoDaddy cPanel fallback deployment. The enterprise implementation lives in `apps/web` and `apps/server`.

## Stack

- Frontend: Next.js 15 App Router, TypeScript, TailwindCSS, shadcn-compatible components, Framer Motion.
- State: Redux Toolkit.
- Data fetching: TanStack Query.
- Forms: React Hook Form + Zod.
- Backend: NestJS.
- Database: PostgreSQL with Prisma ORM.
- Auth: JWT access token, refresh-token-ready HttpOnly cookie architecture, static demo credentials for showcase.
- QR: `html5-qrcode`.
- Deployment: GoDaddy multidomain/VPS compatible, PM2, Nginx reverse proxy.

## Project Structure

```text
apps/web/src/app
apps/web/src/modules
apps/web/src/components
apps/web/src/layouts
apps/web/src/hooks
apps/web/src/services
apps/web/src/providers
apps/web/src/stores
apps/web/src/utils
apps/web/src/constants
apps/web/src/types
apps/web/src/translations
apps/web/src/themes
apps/web/src/assets
apps/web/src/styles
apps/web/src/config

apps/server/src/modules
apps/server/src/controllers
apps/server/src/services
apps/server/src/repositories
apps/server/src/middleware
apps/server/src/guards
apps/server/src/interceptors
apps/server/src/validators
apps/server/src/auth
apps/server/src/permissions
apps/server/src/integrations/abdm
apps/server/src/database
apps/server/src/config
apps/server/src/utils
apps/server/src/logs
```

## Setup

```bash
npm install
cp apps/web/.env.example apps/web/.env.local
cp apps/server/.env.example apps/server/.env
npm run prisma:generate
npm run dev:web
npm run dev:server
```

## Demo Login

- Admin: `admin@abhasetu.com` / `Admin@123`
- Doctor: `doctor@abhasetu.com` / `Doctor@123`
- Patient: `patient@abhasetu.com` / `Patient@123`
- Operator: `operator@abhasetu.com` / `Operator@123`

## ABDM Setup

Set these in `apps/server/.env` only:

```bash
ABDM_CLIENT_ID=
ABDM_CLIENT_SECRET=
ABDM_XCM_ID=sbx
ABDM_BASE_URL=https://dev.abdm.gov.in
```

ABDM Milestone 1 V3 flows are implemented as backend proxy methods:

- Sandbox authentication and token refresh handling.
- Public certificate fetch.
- ABHA creation using Aadhaar OTP.
- ABHA address creation.
- ABHA number verification.
- ABHA address verification.
- Download ABHA card.
- Mobile-based ABHA search architecture.
- New and returning patient flows.
- OTP verification and Aadhaar authentication.
- Facility QR and user ABHA QR scanning.

RSA encryption uses Node crypto with OAEP SHA-1 padding, equivalent to `RSA/ECB/OAEPWithSHA-1AndMGF1Padding`.

## PostgreSQL and Prisma

Create a PostgreSQL database and set `DATABASE_URL`.

```bash
npm run prisma:generate
npm run prisma:migrate
```

Schemas include `users`, `roles_permissions`, `abha_profiles`, `doctors`, `facilities`, `qr_sessions`, `consultations`, `health_records`, `settings`, `translations`, and `notifications`.

## QR Scanner

The scanner module uses `html5-qrcode`. Browser camera access requires HTTPS or localhost. The scanner classifies ABHA QR, Facility QR, and generic healthcare QR payloads.

## Theme System

The approved AbhaSetu theme is preserved in `apps/web/src/styles/globals.css`. Dark mode is the default. Light mode is synchronized globally through `next-themes` and persists in local storage without changing the brand palette or layout identity.

## Translation System

English and Hindi namespaces live in `apps/web/src/translations`. The Redux state stores the active language and components use `useTranslation()` so menu, footer, dashboard labels, and dynamic content can be translated progressively.

## Security

- ABDM secrets never enter browser JavaScript.
- Refresh token uses HttpOnly SameSite cookie shape.
- Backend uses Helmet, CORS allowlist, validation pipe, and compression.
- Sensitive values such as Aadhaar, mobile, OTP, ABHA number, tokens, and PHI must be redacted from production logs.
- Add production rate limiting on auth, OTP, ABDM, and QR endpoints before live patient use.

## GoDaddy / PM2 / Nginx Deployment

For GoDaddy VPS or Node-capable multidomain hosting:

```bash
npm install
npm run build
npm run prisma:migrate
pm2 start ecosystem.config.cjs
pm2 save
```

Use `deploy/nginx-abhasetu.conf` as the reverse proxy template. The frontend runs on `3000`; the backend API runs on `4000`.

For basic cPanel static hosting, keep using the root `index.html`, `style.css`, and `app.js`; live ABDM requires the NestJS backend on a Node-capable host.
