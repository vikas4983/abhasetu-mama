# ABHA Setu — User & Operator Guide

## Quick start (local development)

### 1. Prerequisites

- Node.js 20+
- PostgreSQL (via Docker Compose or local)
- Optional: Redis for ABDM session cache

### 2. Start services

```bash
# From project root
docker compose up -d postgres redis

# Backend (port 3001)
cd backend
cp .env.example .env   # add ABDM_CLIENT_ID / SECRET if you have them
npm install
npm run start:dev

# Frontend (port 3000)
cd ..
npm install
npm run dev
```

Open: **http://localhost:3000**

---

## Login portals

| Portal | URL | Who |
|--------|-----|-----|
| Citizen / ABHA | `/login` | Patients creating or using ABHA |
| Stakeholder suite | `/staff-login` | Hospitals, clinics, labs, pharmacies |
| Admin console | `/admin/login` | Platform administrators |

---

## Test credentials (seeded in database)

> **Default admin password:** `DreamProject@2026`  
> **Default facility password:** `Password@123`

| Role | Email | Password | Status | Notes |
|------|-------|----------|--------|-------|
| Admin | `admin@abhasetu.com` | DreamProject@2026 | Approved | Full admin console |
| Master admin | `master@abhasetu.com` | DreamProject@2026 | Approved | Same as admin |
| Hospital | `hospital@abhasetu.com` | Password@123 | Approved | HIP stakeholder |
| Clinic | `clinic@abhasetu.com` | Password@123 | Approved | |
| Pharmacy | `pharmacy@abhasetu.com` | Password@123 | Approved | |
| Insurance | `insurance@abhasetu.com` | Password@123 | Approved | |
| Lab | `lab@abhasetu.com` | Password@123 | **Pending** | Approve in Admin → Facilities |
| Diagnostic | `diagnostic@abhasetu.com` | Password@123 | **Pending** | Approve first |
| Doctor | `doctor@abhasetu.com` | Password@123 | **Pending** | Approve first |
| Alumni | `alumni@abhasetu.com` | Password@123 | **Pending** | Approve first |

### Why login fails for “pending” accounts

The backend rejects login for facilities with `status = pending`. **Fix:** sign in as admin → **Facilities** tab → Approve the account.

### Why admin login fails

1. Backend not running on port 3001  
2. PostgreSQL not seeded — restart backend once to run `seedData()`  
3. Wrong password — use `DreamProject@2026` exactly (case-sensitive)

---

## Admin console features

| Tab | Purpose |
|-----|---------|
| **Insights** | KPI cards, state-wise pincode charts, revenue & audit metrics |
| **ABDM Config** | Client ID, secret, HIP/HIU IDs, public key sync |
| **Pincode directory** | CRUD + CSV import from `pincode_directory.csv` |
| **Facilities** | Approve/reject stakeholder registrations |
| **Audit logs** | PHI-safe event trail |

### Import pincode CSV (~165k rows)

1. Ensure `pincode_directory.csv` is at project root: `d:\projects\abhasetu-mama\pincode_directory.csv`
2. Admin → **Pincode directory** → **Import CSV**
3. Wait 2–5 minutes (batched inserts)
4. Enrollment flows will resolve district/state from this dataset

Optional env: `PINCODE_CSV_PATH=/custom/path/pincode_directory.csv`

---

## Citizen / ABHA flows

1. **Create ABHA** — `/abha` or `/login` → Aadhaar/mobile OTP  
2. **Profile** — `/profile` — password, mobile, Re-KYC, deactivate  
3. **Scan & Share** — `/abha` → share profile at hospital QR  
4. **Consents** — `/consents` — HIU consent requests (M3)  
5. **Health records** — `/health-records`

Sandbox OTP fallback: `123456` when `ABDM_SIMULATION_MODE=true` (default).

---

## Security & compliance (implemented)

- **OWASP:** JWT auth, bcrypt passwords, parameterized SQL, helmet headers, rate limiting, no secrets in code  
- **PHI logging:** ABHA/Aadhaar/mobile masked in audit logs  
- **WCAG 2.1 AA:** Semantic HTML, labels, `aria-live` alerts, keyboard-navigable tables, screen-reader captions  
- **ABDM:** RSA encryption for OTP/Aadhaar, gateway session cache, async callbacks

---

## API documentation

- Swagger (backend): http://localhost:3001/api/abdm/docs  
- Postman collections: `docs/abdm/postman/`  
- ABDM integration notes: `docs/abdm/README.md`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| OTP API fails | Restart backend; check `forbidNonWhitelisted`; verify gateway credentials |
| `/api/abdm/*` 404 | Ensure NestJS running; Next.js rewrites to `:3001` |
| Pincode lookup empty | Import CSV in admin or wait for external API fallback |
| Facility login blocked | Approve facility in admin panel |

---

## Support

For ABDM sandbox certification: register bridge callbacks (see `docs/abdm/bridge-setup.md`) and set `ABDM_SIMULATION_MODE=false` when using real gateway credentials.
