# ABHA SETU Healthcare App UI Replication

ABHA SETU is a React-based healthcare app interface inspired by Ayushman Bharat Digital Mission (ABDM) workflows. The app presents a polished patient-facing experience for ABHA-linked services such as appointments, digital locker records, health ATM reports, notifications, telemedicine, QR scanning, and service discovery.

This repository is a frontend UI replication/demo. It uses mock data in the client today and is structured so real ABDM sandbox APIs can be connected through the service layer later.

## About ABHA SETU

ABHA SETU is designed as a bridge between citizens and digital health services in the ABDM ecosystem. ABHA, or Ayushman Bharat Health Account, gives a person a digital health identity that can be used to access services and link health records. In the ABDM model, health records should move through secure, consent-based workflows across healthcare providers, patient apps, registries, and other approved systems.

The UI demonstrates common journeys an ABDM-enabled app may need:

- ABHA-linked patient profile and identity status
- Digital locker for prescriptions, reports, and consent documents
- Appointment booking and telemedicine touchpoints
- Health ATM and vitals dashboards
- QR-based service entry points
- Notifications for record sync, appointment updates, and care activity
- Service directory for healthcare, diagnostics, compliance, and support workflows

Official ABDM sandbox reference: [ABDM Sandbox V3 Documentation](https://sandbox.abdm.gov.in/sandbox/v3/new-documentation)

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router
- Redux Toolkit
- TanStack Query
- Material UI
- Lucide React icons
- i18next
- Axios

## Prerequisites

Install these before running the project:

- Node.js 18 or newer
- npm 9 or newer

## Setup Guide

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file if you want to point the app at an API backend:

   ```powershell
   Copy-Item .env.example .env
   ```

   If `.env.example` is not present, create `.env` manually:

   ```env
   VITE_API_BASE_URL=/api
   VITE_APP_VERSION=1.0.0
   ```

3. Start the local development server:

   ```bash
   npm run dev
   ```

4. Open the local URL printed by Vite, usually:

   ```text
   http://127.0.0.1:5173
   ```

## ABDM Sandbox Integration Notes

Use the official ABDM sandbox documentation as the source of truth for API registration, credentials, endpoint behavior, headers, encryption requirements, and milestone validation. For a real integration, keep sensitive ABDM credentials on a backend service and never expose client secrets, private keys, Aadhaar data, OTPs, or production tokens in this frontend.

Recommended integration flow:

1. Register and configure the application in the ABDM sandbox portal.
2. Keep ABDM client credentials in a secure backend environment.
3. Use the backend to request gateway/session tokens and proxy protected API calls.
4. Implement required ABDM headers such as request identifiers, timestamps, authorization tokens, and environment identifiers according to the current sandbox docs.
5. Encrypt sensitive payload fields exactly as required by the V3 documentation.
6. Connect frontend modules through `src/services/api/healthcareApi.ts` or new service modules.
7. Validate each ABDM milestone in sandbox before using production endpoints.

## Available Scripts

```bash
npm run dev
```

Runs the Vite development server.

```bash
npm run build
```

Type-checks the project and creates a production build in `dist/`.

```bash
npm run preview
```

Serves the production build locally for review.

```bash
npm run lint
```

Runs ESLint across TypeScript and React files.

```bash
npm run storybook
```

Starts Storybook for component-level review.

## Project Structure

```text
src/
  app/                 App providers, layouts, router, and store
  assets/styles/       Global design system entrypoint
  components/          Shared UI, navigation, feedback, and form components
  config/              Runtime environment configuration
  constants/           Mock app data and constants
  features/            Feature slices and composed feature UI
  pages/               Route-level screens
  services/            Axios client, mock APIs, and query helpers
  theme/               Theme tokens and MUI theme
  types/               Domain types
```

## Production Notes

Before production use, replace mock healthcare data with audited backend APIs, add real authentication, complete ABDM compliance checks, review consent and privacy flows, and validate accessibility and responsive behavior across supported devices.
