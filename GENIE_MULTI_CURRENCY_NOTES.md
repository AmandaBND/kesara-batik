# Genie multi-currency checkout update

## Pricing rules preserved

- **Sri Lanka / LKR:** unchanged. Product totals continue to use each product's manually maintained `priceLKR` value. LKR is never calculated from CAD.
- **Overseas currencies:** CAD remains the base price stored in `Product.price`. USD, GBP, AED, JPY and KRW continue to be calculated from the current CAD exchange-rate table.
- The backend recalculates every order from database product prices and the server-side exchange-rate document. It does not trust totals submitted by the browser.

## Genie request behavior

- Genie is now shown for CAD, USD, GBP, AED, LKR, JPY and KRW checkout.
- The gateway receives the order's already-verified checkout total and checkout currency.
- No second exchange-rate conversion is performed while creating the Genie transaction.
- The signature uses the same minor-unit amount and currency sent in the payload.
- LKR keeps its existing two-decimal minor-unit behavior (`8450.00 -> 845000`).
- CAD, USD, GBP and AED use two decimal minor units.
- JPY and KRW use zero decimal minor units.

## Payment safety

- Gateway currency and amount are checked when Genie returns those values.
- Payment confirmation is idempotent, preventing webhook polling from reducing stock more than once.

## Merchant account requirement

Dialog Pay Business advertises Multi-Currency Pricing, but foreign-currency acceptance must also be enabled for the merchant application/account. If Genie rejects a specific currency after deployment, ask Dialog Pay Business to enable MCP and that currency for the production application.
