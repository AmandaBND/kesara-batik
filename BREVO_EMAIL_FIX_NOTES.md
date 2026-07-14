# Brevo Email Service Fix

## Root cause

The previous backend hard-coded SMTP port 465 and ignored `BREVO_SMTP_PORT`.
More importantly, Railway blocks outbound SMTP on Free, Trial, and Hobby plans,
which caused the `Connection timeout` errors.

## New behaviour

- Production email uses Brevo's HTTPS transactional-email API.
- `BREVO_API_KEY` is preferred over SMTP credentials.
- Production does not automatically try blocked SMTP when the API key is absent.
- SMTP remains available only when explicitly selected with
  `EMAIL_PROVIDER=smtp` or in non-production development.
- Email failures are logged but do not fail order creation.
- A configurable request timeout prevents hanging requests.
- Startup logs show the selected provider without revealing credentials.

## Required Railway variables

```text
EMAIL_PROVIDER=api
BREVO_API_KEY=your_new_brevo_api_key
EMAIL_FROM=orders@kesarabathik.com
EMAIL_FROM_NAME=Kesara Bathik
ADMIN_EMAIL=your_real_inbox@gmail.com
EMAIL_SEND_TIMEOUT_MS=15000
```

Create `BREVO_API_KEY` in Brevo under **Settings → SMTP & API → API Keys**.
An SMTP key cannot be used as an API key.

## Expected startup log

```text
[email] Provider: Brevo HTTPS API | Sender: orders@kesarabathik.com
```

## Tests

```bash
cd backend
npm test
npm run email:test -- your@email.com
```
