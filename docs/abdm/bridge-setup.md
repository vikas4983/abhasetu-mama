# ABDM Bridge Callback Setup

## Local development with ngrok

1. Start backend: `cd backend && npm run start:dev`
2. Start ngrok: `ngrok http 3001`
3. Copy HTTPS URL (e.g. `https://abc123.ngrok-free.app`)
4. Set in `backend/.env`:
   ```
   ABDM_CALLBACK_BASE_URL=https://abc123.ngrok-free.app
   ```
5. Register on [dev.abdm.gov.in](https://dev.abdm.gov.in) → Bridges → PATCH:

| Callback path |
|---------------|
| `/api/abdm/callbacks/v0.5/users/auth/on-fetch-modes` |
| `/api/abdm/callbacks/v0.5/care-contexts/on-discover` |
| `/api/abdm/callbacks/v0.5/links/on-confirm` |
| `/api/abdm/callbacks/v0.5/consent-requests/on-init` |
| `/api/abdm/callbacks/v0.5/consents/on-fetch` |
| `/api/abdm/callbacks/v0.5/health-information/on-request` |
| `/api/abdm/callbacks/v0.5/health-information/notify` |

Full URL = `{ABDM_CALLBACK_BASE_URL}` + path above.

## Docker

Use `docker-compose up` and expose port 3001 via ngrok to the host.

## Simulation mode

Set `ABDM_SIMULATION_MODE=true` in `.env` to allow fallbacks when gateway is unreachable.

Set `ABDM_SIMULATION_MODE=false` for production/certification runs.
