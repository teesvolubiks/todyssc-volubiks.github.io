Opay Payment Integration

This project uses Opay as the primary payment method. Customers are shown the official Opay account number (9047393086) and must confirm payment has been sent before receiving a thank you page.

To integrate real Opay payments, implement server-side endpoints that:

- Initialize a transaction and return a redirect URL for Opay checkout.
- Verify and handle webhooks sent by Opay.
- Update your orders on successful payment.

Suggested server endpoints (Node/Express examples):

- `POST /api/opay/initialize` — accepts cart summary and merchant id, returns a redirect URL for Opay checkout.
- `POST /webhooks/opay` — Opay webhook endpoint; verify and process accordingly.

Webhook security & keys

- Keep webhook secrets and API keys on the server only (env vars). Never commit or expose them to the frontend.
- When testing locally you can use tools like `ngrok` to expose a local webhook endpoint for Opay callbacks.

For production, implement proper server-side payment handling with secure webhook verification.