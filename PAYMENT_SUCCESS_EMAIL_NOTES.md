# Payment-success email update

## New email sequence

1. When the order is created, the customer receives:
   - `Order Received — Payment Pending — #<order>`
2. After Dialog Genie reports a verified successful payment, the customer receives:
   - `Payment Successful — Order #<order> | Kesara Bathik`
3. The admin receives a separate payment-received notification.
4. The existing shipping email is still sent when the admin first changes the order to `shipped`.

## Duplicate protection

Genie may report the same successful payment through both the webhook and the frontend status poll. The order stores a separate notification state for the customer and admin. Each recipient is atomically claimed before delivery, so the same success email is not sent twice.

A failed Brevo attempt is recorded as `failed` and can be retried by a later verified Genie status check. A delivery stuck in `sending` can be reclaimed after five minutes.

## Railway requirements

Keep these variables on the backend service:

```env
EMAIL_PROVIDER=api
BREVO_API_KEY=<Brevo API key, not SMTP password>
EMAIL_FROM=orders@kesarabathik.com
EMAIL_FROM_NAME=Kesara Bathik
ADMIN_EMAIL=<admin inbox>
EMAIL_SEND_TIMEOUT_MS=15000
```

No new environment variable is required for this update.

## Expected logs after a successful payment

```text
[email] Sent via brevo-api "Payment Successful — Order #KB... | Kesara Bathik" → customer@example.com
[email] Payment-success customer email completed for order KB...
[email] Sent via brevo-api "Payment Received — Order #KB..." → admin@example.com
[email] Payment-success admin email completed for order KB...
```
