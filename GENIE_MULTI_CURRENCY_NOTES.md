# Corrected Genie overseas-payment behavior

## Why the CAD request failed

The production Genie response was:

`PP-T-003: Transaction currency 'CAD' is not the same as the company currency 'LKR'`

The merchant application is registered with company currency `LKR`, so Genie rejects a transaction payload containing `currency: "CAD"`.

## Pricing rules preserved

- **Sri Lanka / LKR:** unchanged. Products use the separately maintained `priceLKR`, shipping remains the existing LKR amount, and Genie receives the exact LKR order total.
- **International storefront:** unchanged. Product prices still start from `Product.price` in CAD and are displayed/stored in CAD, USD, GBP, AED, JPY or KRW using the existing CAD-based rates.
- **International Genie transaction:** the order remains in the selected customer currency. The server takes the independent CAD base total and converts only that final amount to LKR for the Genie request because this merchant settles in LKR.
- Overseas orders never use the product's separate `priceLKR` field.

## Example

- Product/order base total: `CAD 93.99`
- Customer checkout/order record: remains `CAD 93.99` (or its selected USD/GBP/AED/JPY/KRW amount)
- Saved CAD -> LKR gateway rate: for example `225`
- Genie gateway amount: `LKR 21,147.75`
- Genie API minor-unit amount: `2114775`

## Server-side protection

- Browser-submitted prices and totals are not trusted.
- The backend recalculates items from database prices.
- Overseas orders save `subtotalCAD`, `shippingCAD`, `totalCAD`, `cadToLkrRate` and `gatewayTotalLKR` at order creation.
- The customer's selected currency and total remain unchanged for orders, invoices and history.
- Payment records separately store checkout amount/currency and gateway amount/currency.
- Existing older overseas orders fall back to the latest server-side CAD -> LKR rate.
