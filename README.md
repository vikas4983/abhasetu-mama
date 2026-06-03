# Abha Setu - ABDM Sandbox Integration Hub

Abha Setu is a dark-teal glassmorphic, mobile-first interoperable digital health suite designed to implement, simulate, and verify the complete standards of the **Ayushman Bharat Digital Mission (ABDM)**, the **Unified Health Interface (UHI)**, and the **National Health Claims Exchange (NHCX)**.

---

## 🌟 Key Features & Integrated Modules

Abha Setu fully supports the following sandbox integration modules with high-fidelity, interactive simulators, live gateway logs, JWS signature verification, and secure cryptographic key derivations:

### 1. ABDM Milestone 1 (Identity Layer)
*   **Aadhaar eKYC Onboarding**: Simulates Aadhaar OTP validation requests and dynamic ABHA Account creation.
*   **Smart ID Card Replica**: Generates premium, authenticated smart cards displaying name, dob, gender, photo, and 14-digit ABHA ID, matching the exact NHA design specs.
*   **Save to Health Locker**: Directly syncs verified ID documents into the secure local Health Locker.

### 2. ABDM Milestone 2 (HIP Care Context Linking)
*   **Patient Record Discovery**: Matches patient profile demographic metadata against internal EMR databases.
*   **OTP-Based Record Linking**: Simulates secure OTP link verification to dynamically bind care contexts under active patient profiles.

### 3. ABDM Milestone 3 (Consent & Data Exchange)
*   **Consent Manager Lifecycle**: Generates consent authorization request artifacts (clinical purpose, access duration, and clinical record types).
*   **Fidelius Cryptography Protocol**: Implements secure asymmetric **Curve25519** Diffie-Hellman Key Exchanges (ECDH) and HKDF-SHA256 derivations on the Node.js backend.
*   **AES-256-GCM Secure Decryption**: Decrypts incoming encrypted FHIR bundles from the hospital repository and visualizes medical records (vitals, prescriptions, diagnostics).

### 4. Healthcare Professional Registry (HPR/NHPR)
*   **Practitioner Search**: Validates doctor HPR IDs against National Medical Council registries.
*   **Professional Onboarding**: eKYC enrollment for medical practitioners generating verified registries with digital authorization seals.

### 5. Scan & Share / Scan & Pay 2
*   **Demographic Profile Share**: Simulates scanning a Health Facility counter QR code to share ABHA profile metadata.
*   **OPD Counter Queue Tokens**: Automatically matches records and issues fast-track hospital OPD slip queue numbers (`SETU-OPD-XXX`).
*   **Health UPI billing**: Retrieves outpatient diagnostic/medicine bills and settles them via the simulated Health UPI Network, generating bank UTRs.

### 6. Unified Health Interface (UHI Tele-Consultation)
*   **Beckn Open Network Protocol**: Uses asynchronous lifecycle protocol methods (`search`, `select`, `init`, `confirm`) to unbundle healthcare consults.
*   **Appointment Slot Booking**: Discovers doctors, selects appointment slots, validates platform quotes, and completes payment to secure a virtual telehealth meet room.

### 7. National Health Claims Exchange (NHCX Cashless Claims)
*   **Coverage Eligibility Check**: Queries insurer systems (Star Shield Plan) using FHIR R4 CoverageEligibilityRequest bundles.
*   **Pre-authorization Adjudication**: Submits estimated procedural costs alongside clinical history and receives cashless approvals (90% approved limit, 10% patient copay).
*   **Direct Bank EFT Settlement**: Performs final discharge bill submissions via NHCX direct clearing, issuing Electronic Fund Transfer clearing UTRs.

### 🎨 Visual Customizations & Accessibility Systems
*   **Multiverse Color Themes**: Supports 7 distinct themes, including `Initial Theme (Default)`, `Slate Dark`, `Ocean Blue`, `Emerald Light`, `Saffron Emerald`, `Crimson Red`, and `ABDM Sandbox (Corporate)`.
*   **Brand Typography Customization**: Offers dynamic font typeface settings (`Inter`, `Roboto`, `System Sans`) with standard inheritances across all input fields, drop-down selects, textareas, and buttons. Defaults to **Roboto** for the ABDM Sandbox theme to match the NHA design language.
*   **Upgraded Hero Actions**: Arranges the three primary dashboard buttons (**BOOK CONSULTATION**, **HEALTH ATM**, and **DIGITAL LOCKER**) in a clean, compact horizontal row directly beneath the animated ECG graph inside a responsive 3-row, 2-column layout grid. The buttons' icons are fully integrated with the homepage **Icon Style Settings** (Glassmorphism, 3D Gradients, Clinical Minimalist) and scale smoothly on cursor hover.
*   **Reactive Global Search Index**: Incorporates a live matching index that dynamically scans static directories (ABHA card, medicine order, diagnostics, developer sandbox api, settings) and links directly to live authenticated EMR clinical records, appointments, and HPR-registered doctors.
*   **Layout & Contrast Optimization**: Improves tablet/desktop columns spacing, using a `1.3fr` width bias for footer contact info and a `24px` grid gap to prevent email wrapping, combined with a `var(--accent-teal)` hover state on glassmorphic icons.

---

## 🛠️ Automated Sandbox Compliance Test Suite

Abha Setu includes a comprehensive, dual-mode automated testing engine to verify all functional sandbox test cases required to exit the sandbox environment.

### 1. Terminal / CLI Test Runner (TAP/Jest Output style)
You can execute 20 complex end-to-end integration scenarios verifying cryptography, request/response formats, validation rejections, JWS signatures, and DHP/HL7 schemas:

```bash
npm run test
# or: node scripts/test-abdm.js
```

### 2. Interactive In-App Test Bench
Navigate to the **Sandbox Tests** tab under the `/abha` dashboard to run all 20 certification test cases interactively!
*   **Live Gate Logs**: Monitor high-fidelity gateway callback logs with color codes.
*   **JSON Schema Previews**: Expand any test block to browse through request endpoints, checking assertion checklists and raw decrypted FHIR/Beckn JSON responses returned from the backend.

---

## 📦 Developer Integration & Setup Guide

### 1. Secrets Environment Setup
Before initiating official production calls, copy `.env.example` to `.env` in the root directory and update the credentials provided by the NHA Sandbox Bridge portal:

```bash
cp .env.example .env
```

Set the following variables inside `.env`:
*   `ABDM_CLIENT_ID`: Your assigned Bridge Client ID.
*   `ABDM_CLIENT_SECRET`: Your Bridge Client Secret.
*   `ABDM_GATEWAY_URL`: ABDM Gateway endpoint (Defaults to: `https://dev.abdm.gov.in`).
*   `ABDM_CM_ID`: Consent Manager Namespace (e.g. `sbx`).

> [!NOTE]
> If credentials are left unconfigured, Abha Setu automatically activates its premium **Sandbox Mock Mode**, utilizing simulated gateway sessions, secure fallback cryptography derivations, and standard HL7 FHIR/DHP responses to ensure a smooth local development and demonstration experience.

### 2. Project File Structure
*   `src/app/(dashboard)/abha/page.tsx`: The 9-tab main digital health console dashboard.
*   `src/app/api/abdm/tests/route.ts`: Programmatic compliance tests engine handler.
*   `src/utils/abdm/crypto.ts`: Ephemeral keypairs, Diffie-Hellman key derivatives, HKDF-SHA256, and AES-GCM decrypters.
*   `src/utils/abdm/session.ts`: Gateway JWT access token fetcher with built-in caching.
*   `src/app/api/abdm/...`: Endpoints for `enroll`, `consent`, `hip`, `hpr`, `scan-share`, `uhi`, and `nhcx`.
*   `scripts/test-abdm.js`: Standalone Node test executable.

### 3. Local Installation & Development

Ensure dependencies are installed and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000/abha](http://localhost:3000/abha) on your browser (preferably in mobile view) to begin testing.

### 4. Compilation Verification
To check stable production build bundling:

```bash
npm run build
```

---

## 🔒 Security & Cryptographic Compliance
To exit the NHA Sandbox, the system complies with the following constraints:
1.  **Zero-Knowledge Headers**: Outbound clinical payloads are fully encrypted end-to-end between HIP and HIU. The ABDM Gateway only parses unencrypted routing headers.
2.  **Diffie-Hellman Key Exchange (ECDH)**: Key material derived dynamically over elliptic curves (Curve25519) combined with transaction-level nonces.
3.  **AES-256-GCM Verification**: Every clinical transaction employs authenticated encryption validating GCM tags to protect patient health records.
