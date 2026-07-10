# Genie Payment Amount Fix — Kesara Batik

## Root cause

The website stores and displays the order total in normal LKR units. For example:

- Website total: `LKR 8,450.00`
- Old Genie payload: `amount: 8450`
- Genie display: `LKR 84.50`

Genie interprets the integer `amount` as the smallest currency unit. Therefore, the API payload must send `845000` for an `LKR 8,450.00` payment.

## Main fix

`backend/src/controllers/paymentController.js` now converts the verified order total to minor units before creating the Genie transaction:

```text
LKR 8,450.00 -> 845000
```

The signature is generated using the exact same minor-unit value sent in the payload.

## Additional payment protections

1. The backend recalculates every order total from database product prices instead of trusting browser totals.
2. LKR uses only each product's manual `priceLKR`; it is never generated from the CAD exchange rate.
3. Foreign currencies continue to use the CAD price and stored exchange rates.
4. Genie checkout is accepted only for an LKR order.
5. The frontend shows Genie only when IP detection has locked the visitor to Sri Lanka/LKR.
6. Overseas visitors cannot retain or select LKR through stale browser storage.
7. New orders are always created with payment status `pending`; the browser cannot submit `paid`.
8. The exact Genie minor-unit amount and currency are stored with the order for audit/debugging.

## Validation completed

Automated backend tests cover:

- `8450.00 -> 845000`
- decimal preservation
- manual LKR pricing independent of exchange rates
- expected LKR subtotal + shipping total

Run:

```bash
cd backend
npm test
```

The production frontend build was also completed successfully with `npm run build`.

## Railway variables

```env
GENIE_MODE=production
GENIE_API_BASE=https://api.geniebiz.lk/public
GENIE_APP_ID=your_application_id_from_genie_dashboard
GENIE_APP_KEY=your_api_key_secret_from_genie_dashboard
BACKEND_URL=https://kesara-batik-production.up.railway.app
FRONTEND_URL=https://www.kesarabathik.com
```

Rotate any Genie keys that were previously exposed in screenshots or source files.
