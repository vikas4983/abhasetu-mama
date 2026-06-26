# ABDM Postman Collections

## PHR official collections (primary reference)

| File | Description |
|------|-------------|
| [PHR-Registration-Enrollment.postman_collection.json](./PHR-Registration-Enrollment.postman_collection.json) | Legacy HID v1/v2 registration + PHR Web V3 enrollment |
| [PHR-Login.postman_collection.json](./PHR-Login.postman_collection.json) | Authentication + mobile login + PHR Web V3 ABHA login |
| [PHR-Profile.postman_collection.json](./PHR-Profile.postman_collection.json) | Account profile, QR, password + PHR Web V3 profile |
| [PHR-Locker-HIECM.postman_collection.json](./PHR-Locker-HIECM.postman_collection.json) | Consent Manager: sessions, consents, lockers, links |
| [Consent-PIN.postman_collection.json](./Consent-PIN.postman_collection.json) | Create / verify / change / forgot / reset consent PIN |

**Full endpoint → BFF action mapping:** [phr-collections-index.md](./phr-collections-index.md)

**Live API catalog:** `GET /api/abdm/phr/postman`

## Milestone collections

| File | Description |
|------|-------------|
| `Milestone_1.json` | M1 ABHA V3 (includes PHR Web login) |
| `Milestone_2.json` | M2 HIP |
| `Milestone_3.json` | M3 HIU |
| `PHR-HIECM-V3.postman_collection.json` | PHR app/web + HIECM V3 (from PHR&HIECM zip) |

## Copy collections from Downloads

```bash
node scripts/copy-phr-postman.js
```

Source files (user Downloads):

- `PHR Registration-Enrollment - postman_collection_m1_e66da1f265.json`
- `PHR Login - postman_collection_m1_e66da1f265 (1).json`
- `PHR Profile - postman_collection_m1_e66da1f265 (1).json`
- `PHR & Locker (HIECM) - Consent_M_postman_collection_b3ee5be4d9_745d5a72e3.json`
- `Consent pin - Consent_Pin_postman_collection_8287cb66d8_c8136055ff.json`

## Related docs

- [phr-flow.md](../phr-flow.md)
- [phr-e2e-flow.md](../phr-e2e-flow.md)
- [certification-checklist.md](../certification-checklist.md)
