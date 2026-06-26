# M2 — HIP Care Context Linking

## Flows

1. **Patient discovery**: `POST /v0.5/care-contexts/discover` → callback `on-discover`
2. **Link contexts**: `POST /v0.5/links/link/add-contexts` (after OTP/DIRECT auth)
3. **Notify**: `POST /v0.5/links/link/notify`
4. **Scan & Share**: profile share at facility → linking token
5. **On consent**: receive artefact → fetch records → Fidelius encrypt → push to HIU
6. **Notify CM**: `POST /v0.5/health-information/notify`

## Headers

- `X-HIP-ID`: registered HIP ID
- `X-CM-ID`: sbx
- `Authorization`: Bearer {gateway token}

## Callback URLs

Register on dev.abdm.gov.in bridge:

- `/api/abdm/callbacks/v0.5/care-contexts/on-discover`
- `/api/abdm/callbacks/v0.5/links/on-confirm`

## Database tables

- `abdm.care_contexts`
- `abdm.link_requests`
- `abdm.health_records`
