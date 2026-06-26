# M3 — HIU Consent & Health Information

## Flows

1. **Consent init**: `POST /v0.5/consent-requests/init` → `on-init` callback
2. **Consent fetch**: `POST /v0.5/consents/fetch` → `on-fetch` with artefact
3. **HI request**: `POST /v0.5/health-information/cm/request` → `on-request`
4. **Data push**: HIU receives encrypted bundle at data-push URL
5. **Decrypt**: Fidelius ECDH + AES-256-GCM
6. **Notify**: acknowledge to CM

## Headers

- `X-HIU-ID`: registered HIU ID

## Callback URLs

- `/api/abdm/callbacks/v0.5/consent-requests/on-init`
- `/api/abdm/callbacks/v0.5/consents/on-fetch`
- `/api/abdm/callbacks/v0.5/health-information/on-request`

## HIU data-push URL

`POST {ABDM_CALLBACK_BASE_URL}/api/abdm/health-records/data-push`

## Database tables

- `abdm.consent_requests`
- `abdm.consent_artefacts`
- `abdm.health_info_transfers`
