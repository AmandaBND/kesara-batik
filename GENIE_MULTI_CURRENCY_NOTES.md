# Corrected Genie payment behavior

## Why the previous multi-currency version failed

The previous version sent every website currency directly to Genie. The site supports CAD, USD, GBP, AED, JPY, KRW and LKR, but Dialog Pay Business does not list AED, JPY or KRW as supported MCP transaction currencies. The Genie transaction documentation also says the request currency must match the merchant currency configuration. Sending a website display currency blindly can therefore return an invalid/unsupported currency or merchant-currency error.

## Pricing rules preserved

- **Sri Lanka / LKR:** unchanged. Product totals use each product's manually maintained `priceLKR`; Genie receives the exact LKR order total in LKR.
- **International store display:** unchanged. Product prices still start from `Product.price` in CAD and are displayed/stored in USD, GBP, AED, JPY or KRW using the existing CAD exchange-rate table.
- **International Genie payment:** Genie receives the server-verified CAD base total in CAD. No international order is converted through LKR.

Examples:

- LKR order total `8450.00` -> Genie `LKR 8450.00` -> API amount `845000`
- CAD order total `52.74` -> Genie `CAD 52.74` -> API amount `5274`
- USD display total calculated from CAD -> order remains recorded in USD, while Genie charges the matching CAD base total
- AED / JPY / KRW display totals -> order remains recorded in that selected currency, while Genie charges the matching CAD base total instead of sending an unsupported currency code

## Server-side protection

- The backend recalculates every product from database prices.
- Each order stores a CAD pricing snapshot (`subtotalCAD`, `shippingCAD`, `totalCAD`, `exchangeRate`).
- Genie uses that stored CAD total, preventing exchange-rate drift between order creation and payment initiation.
- The payment record stores both checkout currency/amount and gateway currency/amount.
- LKR logic is isolated and unchanged.

## Required Dialog Pay Business account feature

Foreign-currency/CAD transactions require the Genie merchant application to be enabled for Multi-Currency Pricing / the Tourism Plan. Code cannot activate that merchant-account feature. If Genie rejects CAD with a merchant-currency or MCP error, contact Dialog Pay Business and request CAD/MCP enablement for the production application.
