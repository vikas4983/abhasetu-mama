# ABHA SETU Mock Backend

This temporary Node.js server demonstrates the backend boundary expected for ABDM workflows.

It includes:

- Security headers similar to Helmet defaults
- CORS allow-listing
- Error masking through generic responses
- ABDM V3 proxy placeholder route
- Health check endpoint

Run locally:

```bash
node server/mock-server.js
```

Production ABDM integration should move Aadhaar OTP, token, certificate, ABHA card download, encryption, and consent logging to a hardened backend service. Never expose ABDM secrets, private keys, OTPs, or production tokens in the React app.
