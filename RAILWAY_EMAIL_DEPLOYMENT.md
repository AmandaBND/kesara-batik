# Kesara Bathik — Railway & Brevo Email Setup

## Why SMTP timed out

Railway disables outbound SMTP on Free, Trial, and Hobby plans. The application
therefore sends transactional email through Brevo's HTTPS API. SMTP remains only
as a fallback for local development or Railway Pro plans.

## Required Railway variables

Add these in **Railway → backend service → Variables**:

| Variable | Value |
|---|---|
| `EMAIL_PROVIDER` | `api` |
| `BREVO_API_KEY` | Brevo API key created under Settings → SMTP & API → API Keys |
| `EMAIL_FROM` | `orders@kesarabathik.com` |
| `EMAIL_FROM_NAME` | `Kesara Bathik` |
| `ADMIN_EMAIL` | The inbox that should receive new-order notifications |
| `EMAIL_SEND_TIMEOUT_MS` | `15000` (optional) |

The sender/domain must be authenticated in Brevo. Do not use an SMTP key as
`BREVO_API_KEY`; they are different credentials.

## Optional SMTP fallback

These are optional and are used only when `BREVO_API_KEY` is absent:

| Variable | Value |
|---|---|
| `BREVO_SMTP_HOST` | `smtp-relay.brevo.com` |
| `BREVO_SMTP_PORT` | `587` |
| `BREVO_SMTP_LOGIN` | Your Brevo SMTP login |
| `BREVO_SMTP_PASSWORD` | Your Brevo SMTP key |

## Create the Brevo API key

1. Sign in to Brevo.
2. Open **Settings → SMTP & API → API Keys**.
3. Create a new API key named `Kesara Bathik Railway`.
4. Copy it once and add it to Railway as `BREVO_API_KEY`.
5. Redeploy the backend.

## Expected Railway logs

At startup:

```text
[email] Provider: Brevo HTTPS API | Sender: orders@kesarabathik.com
```

After an order:

```text
[email] ✅ Sent via brevo-api "Order Confirmed — #KB01001 | Kesara Bathik" → customer@example.com
[email] ✅ Sent via brevo-api "New Order #KB01001 — ..." → admin@example.com
```

## Security

Never commit API keys, SMTP keys, passwords, or `.env` files. If a key is shown
in a screenshot, chat, issue, or repository, revoke it immediately in Brevo and
create a replacement.

## Optional manual test

From a local terminal with the backend environment loaded, run:

```bash
npm run email:test -- your@email.com
```

The command exits with a failure code when Brevo rejects the request and prints
the API error without exposing the API key.
