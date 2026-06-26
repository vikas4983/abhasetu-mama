# ABDM Integration Knowledge Base

Local mirror of ABDM sandbox documentation for AI-assisted development.

## Files

| File | Content |
|------|---------|
| [m1-enrollment.md](./m1-enrollment.md) | M1 ABHA creation, login, profile |
| [m2-hip.md](./m2-hip.md) | M2 HIP care context linking |
| [m3-hiu.md](./m3-hiu.md) | M3 HIU consent and health info |
| [bridge-setup.md](./bridge-setup.md) | Callback URL registration with ngrok |
| [certification-checklist.md](./certification-checklist.md) | Sandbox test evidence checklist |
| [postman/](./postman/) | Official NHA Postman collections (M1, M2, M3) — source of truth for API paths |

## Base URLs (Sandbox)

- Gateway session: `https://dev.abdm.gov.in/api/hiecm/gateway/v3/sessions`
- ABHA API: `https://abhasbx.abdm.gov.in/abha/api`
- HIE-CM v0.5: `https://dev.abdm.gov.in/gateway/v0.5/...`
- CM ID header: `sbx`

## How to teach the AI

Paste per feature: HTTP method, path, headers, request/response JSON (PHI masked), and certification test case ID.
