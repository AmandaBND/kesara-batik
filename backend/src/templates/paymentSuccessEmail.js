const SITE_URL = process.env.FRONTEND_URL || "https://www.kesarabathik.com";
const ADMIN_URL = `${SITE_URL.replace(/\/$/, "")}/admin/orders`;
const LOGO_URL = `${SITE_URL.replace(/\/$/, "")}/logo.png`;

const CURRENCY_SYMBOLS = {
  CAD: "CA$",
  USD: "US$",
  LKR: "Rs. ",
  AED: "AED ",
  JPY: "¥",
  KRW: "₩",
  GBP: "£",
  EUR: "€",
};

function esc(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );
}

function formatMoney(amount, currency = "LKR") {
  const normalizedCurrency = String(currency || "LKR").toUpperCase();
  const symbol =
    CURRENCY_SYMBOLS[normalizedCurrency] || `${normalizedCurrency} `;
  const digits = ["JPY", "KRW"].includes(normalizedCurrency) ? 0 : 2;

  return `${symbol}${Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

function formatDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function customerEmail(order) {
  return (
    order.shippingAddress?.email || order.guestEmail || order.user?.email || ""
  );
}

function customerName(order) {
  return (
    order.shippingAddress?.fullName || order.user?.name || "Valued Customer"
  );
}

function addressHtml(address) {
  if (!address) return "-";

  return [
    address.fullName,
    address.address,
    [address.city, address.state, address.postalCode]
      .filter(Boolean)
      .join(", "),
    address.country,
    address.phone,
  ]
    .filter(Boolean)
    .map(esc)
    .join("<br />");
}

function itemRows(order) {
  const currency = order.pricing?.currency || "LKR";

  return (order.items || [])
    .map((item) => {
      const variant = [item.variant?.size, item.variant?.color]
        .filter(Boolean)
        .join(" / ");
      const quantity = Number(item.quantity || 1);
      const lineTotal = Number(item.price || 0) * quantity;

      return `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #eee7dc;vertical-align:top;">
          <table cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="padding-right:14px;vertical-align:top;">
                <img
                  src="${esc(item.image || LOGO_URL)}"
                  alt="${esc(item.name || "Product")}"
                  width="62"
                  height="62"
                  style="display:block;width:62px;height:62px;border-radius:9px;object-fit:cover;background:#f3eee5;"
                />
              </td>
              <td style="vertical-align:top;">
                <div style="font-size:14px;font-weight:700;color:#281b10;line-height:1.4;">${esc(item.name || "Product")}</div>
                ${variant ? `<div style="margin-top:3px;font-size:12px;color:#8e8274;">${esc(variant)}</div>` : ""}
                <div style="margin-top:3px;font-size:12px;color:#a1988d;">Quantity: ${quantity}</div>
              </td>
            </tr>
          </table>
        </td>
        <td style="padding:14px 0;border-bottom:1px solid #eee7dc;text-align:right;vertical-align:top;white-space:nowrap;font-size:14px;font-weight:700;color:#281b10;">
          ${formatMoney(lineTotal, currency)}
        </td>
      </tr>`;
    })
    .join("");
}

function paymentRows(order) {
  const checkoutCurrency =
    order.pricing?.currency || order.payment?.checkoutCurrency || "LKR";
  const checkoutAmount = Number(
    order.pricing?.total ?? order.payment?.checkoutAmount ?? 0,
  );
  const gatewayCurrency = order.payment?.gatewayCurrency || checkoutCurrency;
  const gatewayAmount = Number(
    order.payment?.gatewayAmountMajor ?? checkoutAmount,
  );
  const transactionId =
    order.payment?.transactionId || order.payment?.genieOrderId || "-";
  const showGatewaySettlement =
    String(gatewayCurrency).toUpperCase() !==
      String(checkoutCurrency).toUpperCase() ||
    Math.abs(gatewayAmount - checkoutAmount) > 0.005;

  return `
    <tr>
      <td style="padding:6px 0;color:#7b7065;font-size:13px;">Order total</td>
      <td style="padding:6px 0;text-align:right;color:#281b10;font-size:14px;font-weight:700;">${formatMoney(checkoutAmount, checkoutCurrency)}</td>
    </tr>
    ${
      showGatewaySettlement
        ? `
    <tr>
      <td style="padding:6px 0;color:#7b7065;font-size:13px;">Processed by Genie</td>
      <td style="padding:6px 0;text-align:right;color:#281b10;font-size:14px;font-weight:700;">${formatMoney(gatewayAmount, gatewayCurrency)}</td>
    </tr>`
        : ""
    }
    <tr>
      <td style="padding:6px 0;color:#7b7065;font-size:13px;">Payment method</td>
      <td style="padding:6px 0;text-align:right;color:#281b10;font-size:13px;">Dialog Genie</td>
    </tr>
    <tr>
      <td style="padding:6px 0;color:#7b7065;font-size:13px;">Transaction ID</td>
      <td style="padding:6px 0;text-align:right;color:#281b10;font-size:12px;word-break:break-all;">${esc(transactionId)}</td>
    </tr>
    <tr>
      <td style="padding:6px 0;color:#7b7065;font-size:13px;">Paid at</td>
      <td style="padding:6px 0;text-align:right;color:#281b10;font-size:13px;">${esc(formatDate(order.payment?.paidAt))}</td>
    </tr>`;
}

function shell(content) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <style>
    body{margin:0;padding:0;background:#f5f0e8;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%}
    table{border-collapse:collapse}
    img{border:0;outline:none}
    a{text-decoration:none}
    @media(max-width:620px){
      .outer{padding:14px 7px!important}
      .body-pad{padding:26px 20px!important}
      .card{border-radius:10px!important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="outer" style="width:100%;background:#f5f0e8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" class="card" style="width:100%;max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 5px 24px rgba(33,20,12,.12);">
          ${content}
        </table>
        <p style="margin:16px 0 0;color:#a69b90;font-size:11px;text-align:center;">© ${new Date().getFullYear()} Kesara Bathik · Sri Lanka</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function header(accent = "#16a34a") {
  return `
    <tr>
      <td style="padding:30px 40px;text-align:center;background:linear-gradient(135deg,#27180f 0%,#3d2b0e 100%);">
        <img src="${LOGO_URL}" alt="Kesara Bathik" width="54" height="54" style="display:inline-block;width:54px;height:54px;border-radius:12px;margin-bottom:10px;" />
        <div style="font-size:22px;font-weight:800;color:#fff;">Kesara Bathik</div>
        <div style="margin-top:4px;color:#d7a039;font-size:11px;letter-spacing:1.7px;text-transform:uppercase;">Authentic Sri Lankan handcrafted batik</div>
      </td>
    </tr>
    <tr><td style="height:5px;background:${accent};"></td></tr>`;
}

function buildCustomerPaymentSuccessEmail(order) {
  const name = customerName(order);
  const orderNumber = order.orderNumber || "";

  return shell(`
    ${header()}
    <tr>
      <td class="body-pad" style="padding:36px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;">
          <tr>
            <td style="text-align:center;">
              <div style="display:inline-block;width:58px;height:58px;line-height:58px;border-radius:50%;background:#dcfce7;color:#15803d;font-size:32px;font-weight:800;">✓</div>
              <div style="margin-top:14px;color:#1f2d1f;font-size:25px;font-weight:800;">Payment successful</div>
              <p style="margin:8px 0 0;color:#6c645b;font-size:14px;line-height:1.65;">
                Hi <strong>${esc(name)}</strong>, we have securely received your payment for order
                <strong>#${esc(orderNumber)}</strong>. Your order is now confirmed and will move to processing.
              </p>
            </td>
          </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;background:#f7fbf7;border:1px solid #ccebd2;border-radius:11px;">
          <tr>
            <td style="padding:20px 22px;">
              <div style="margin-bottom:10px;color:#729078;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Payment details</div>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding:6px 0;color:#7b7065;font-size:13px;">Order number</td>
                  <td style="padding:6px 0;text-align:right;color:#281b10;font-size:14px;font-weight:800;">#${esc(orderNumber)}</td>
                </tr>
                ${paymentRows(order)}
                <tr>
                  <td style="padding:12px 0 0;color:#15803d;font-size:13px;font-weight:700;border-top:1px solid #ccebd2;">Payment status</td>
                  <td style="padding:12px 0 0;text-align:right;color:#15803d;font-size:13px;font-weight:800;border-top:1px solid #ccebd2;">PAID</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <div style="margin-bottom:6px;color:#a1988d;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Items confirmed</div>
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">${itemRows(order)}</table>

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:24px;background:#faf7f2;border-radius:10px;">
          <tr>
            <td style="padding:20px 22px;">
              <div style="margin-bottom:9px;color:#a1988d;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Shipping address</div>
              <div style="color:#39291c;font-size:13px;line-height:1.75;">${addressHtml(order.shippingAddress)}</div>
            </td>
          </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:28px;">
          <tr>
            <td align="center">
              <a href="${SITE_URL.replace(/\/$/, "")}/orders" style="display:inline-block;padding:13px 29px;border-radius:8px;background:#c8923a;color:#fff;font-size:14px;font-weight:800;">View your order</a>
            </td>
          </tr>
        </table>

        <p style="margin:24px 0 0;color:#9b9187;font-size:12px;line-height:1.65;text-align:center;">
          We will email you again when your order is shipped. Keep this message as your payment confirmation.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:22px 40px;text-align:center;background:#faf7f2;color:#93887c;font-size:12px;line-height:1.6;">
        Questions about your order? Reply to this email or contact
        <a href="mailto:orders@kesarabathik.com" style="color:#c8923a;">orders@kesarabathik.com</a>.
      </td>
    </tr>`);
}

function buildAdminPaymentSuccessEmail(order) {
  const name = customerName(order);
  const email = customerEmail(order);
  const orderNumber = order.orderNumber || "";

  return shell(`
    ${header("#16a34a")}
    <tr>
      <td class="body-pad" style="padding:34px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:22px;background:#ecfdf3;border:1px solid #bbf7d0;border-radius:10px;">
          <tr>
            <td style="padding:18px 20px;">
              <div style="color:#166534;font-size:20px;font-weight:800;">Payment received</div>
              <div style="margin-top:5px;color:#3f684a;font-size:13px;">Order <strong>#${esc(orderNumber)}</strong> is now paid and confirmed.</div>
            </td>
          </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:20px;background:#faf7f2;border-radius:10px;">
          <tr>
            <td style="padding:20px 22px;">
              <div style="margin-bottom:10px;color:#a1988d;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Customer</div>
              <div style="color:#281b10;font-size:14px;font-weight:700;">${esc(name)}</div>
              ${email ? `<div style="margin-top:4px;color:#7b7065;font-size:13px;">${esc(email)}</div>` : ""}
              ${order.shippingAddress?.phone ? `<div style="margin-top:3px;color:#7b7065;font-size:13px;">${esc(order.shippingAddress.phone)}</div>` : ""}
            </td>
          </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:20px;background:#f7fbf7;border:1px solid #ccebd2;border-radius:10px;">
          <tr>
            <td style="padding:20px 22px;">
              <div style="margin-bottom:10px;color:#729078;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Payment details</div>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                ${paymentRows(order)}
              </table>
            </td>
          </tr>
        </table>

        <div style="margin-bottom:6px;color:#a1988d;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Paid items</div>
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">${itemRows(order)}</table>

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:24px;">
          <tr>
            <td align="center">
              <a href="${ADMIN_URL}/${esc(order._id)}" style="display:inline-block;padding:13px 29px;border-radius:8px;background:#281b10;color:#fff;font-size:14px;font-weight:800;">Manage order</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`);
}

function buildPaymentSuccessEmail({ order, recipientType = "customer" }) {
  return recipientType === "admin"
    ? buildAdminPaymentSuccessEmail(order)
    : buildCustomerPaymentSuccessEmail(order);
}

module.exports = {
  buildPaymentSuccessEmail,
  buildCustomerPaymentSuccessEmail,
  buildAdminPaymentSuccessEmail,
};
