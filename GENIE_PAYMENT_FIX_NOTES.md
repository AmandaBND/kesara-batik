# Genie Payment Fix Notes — Kesara Batik

## Files changed

1. `backend/src/controllers/paymentController.js`
   - Removed the old `/charge` and `/v1/charge` calls.
   - Uses Genie Transaction API endpoint: `https://api.geniebiz.lk/public/transactions`.
   - Sends the Genie App Key directly in the `Authorization` header, without `Bearer`.
   - Sends V2 transaction fields: `amount`, `currency`, `redirectUrl`, `webhook`, `localId`, `customerReference`, `billingDetails`, `expires`, `signature`, `apiVersion`, `appVersion`, `signMethod`.
   - Generates signature as: `sha1("amount=" + amount + "&currency=" + currency + "&apiKey=" + appKey)`.
   - Uses `GET /public/transactions/{transactionId}` to verify pending payments.
   - Keeps `/api/payments/genie/ping`, but makes it safe: it no longer creates a real Genie transaction.

2. `frontend/src/pages/shop/CheckoutPage.jsx`
   - Forces Genie checkout orders to use `LKR`, because the Genie app currency is LKR.
   - Keeps bank transfer using the selected display currency.
   - Shows the correct LKR total when Genie is selected.

3. `backend/.env.example`
   - Removed exposed real Genie keys.
   - Added the correct production variables.

## Railway variables to use

GENIE_MODE=production
GENIE_API_BASE=https://api.geniebiz.lk/public
GENIE_APP_ID=your_application_id_from_genie_dashboard
GENIE_APP_KEY=your_api_key_secret_from_genie_dashboard
BACKEND_URL=https://kesara-batik-production.up.railway.app
FRONTEND_URL=https://www.kesarabathik.com

You may keep `GENIE_API_SECRET` instead of `GENIE_APP_KEY`; the backend supports both. Prefer `GENIE_APP_KEY` for clarity.

## Important

The API key and public key were visible in the screenshot and also existed in the old `.env.example`. Regenerate/rotate the Genie key before going live.
