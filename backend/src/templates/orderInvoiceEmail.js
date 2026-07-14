const SITE_URL = 'https://www.kesarabathik.com';
const LOGO_URL = `${SITE_URL}/logo.png`;
const ADMIN_URL = 'https://www.kesarabathik.com/admin/orders';
const COMPANY_NAME = 'Kesara Bathik';
const COMPANY_TAGLINE = 'Authentic Sri Lankan Handcrafted Bathik Fashion';
const CONTACT_EMAIL = 'orders@kesarabathik.com';
const WHATSAPP = '+94771234567'; // update to your actual WhatsApp number

const CURRENCY_SYMBOLS = {
  CAD: 'CA$', USD: 'US$', LKR: 'Rs. ', AED: 'AED ', JPY: '¥', KRW: '₩', GBP: '£', EUR: '€',
};

const STATUS_LABELS = {
  pending: 'Pending', confirmed: 'Confirmed', processing: 'Processing',
  shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled', refunded: 'Refunded',
};

function fmt(amount, currency = 'CAD') {
  const sym = CURRENCY_SYMBOLS[currency] || `${currency} `;
  return `${sym}${Number(amount || 0).toFixed(2)}`;
}

function esc(str) {
  return String(str ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

/* ── Shared layout wrappers ─────────────────────────────────── */
function shell(bodyContent) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    body{margin:0;padding:0;-webkit-text-size-adjust:100%;background:#f5f0e8}
    table{border-collapse:collapse}
    img{border:0;display:block;outline:none}
    a{text-decoration:none}
    @media(max-width:620px){
      .outer{padding:16px 8px!important}
      .card{border-radius:8px!important}
      .body-pad{padding:24px 20px!important}
      .item-img{display:none!important}
      .price-col{white-space:normal!important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="outer"
         style="background:#f5f0e8;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation" class="card"
             style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.10);">
        ${bodyContent}
      </table>
      <p style="color:#aaa;font-size:11px;margin:16px 0 0;text-align:center;">
        © ${new Date().getFullYear()} ${COMPANY_NAME} · Colombo, Sri Lanka<br/>
        <a href="${SITE_URL}" style="color:#C8923A;">${SITE_URL.replace('https://', '')}</a>
      </p>
    </td></tr>
  </table>
</body>
</html>`;
}

function header() {
  return `
  <tr><td style="background:linear-gradient(135deg,#2b2014 0%,#3d2b0e 100%);padding:32px 40px;text-align:center;">
    <img src="${LOGO_URL}" width="56" height="56" alt="${COMPANY_NAME}"
         style="border-radius:12px;display:inline-block;margin-bottom:12px;" />
    <div style="color:#ffffff;font-size:22px;font-weight:bold;letter-spacing:0.5px;">${COMPANY_NAME}</div>
    <div style="color:#C8923A;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-top:4px;">
      ${COMPANY_TAGLINE}
    </div>
  </td></tr>`;
}

function divider(color = '#C8923A') {
  return `<tr><td style="height:4px;background:${color};"></td></tr>`;
}

function footer(showReply = true) {
  return `
  <tr><td style="background:#faf7f2;padding:24px 40px;text-align:center;">
    <p style="margin:0 0 8px;color:#888;font-size:12px;line-height:1.6;">
      ${showReply
        ? `Questions about your order? Reply to this email or contact us at
           <a href="mailto:${CONTACT_EMAIL}" style="color:#C8923A;">${CONTACT_EMAIL}</a>`
        : `${COMPANY_NAME} · <a href="${SITE_URL}" style="color:#C8923A;">Shop Now</a>`
      }
    </p>
    <p style="margin:0;color:#ccc;font-size:11px;">
      This is a transactional email related to your order on ${SITE_URL.replace('https://', '')}.
    </p>
  </td></tr>`;
}

/* ── Item rows ──────────────────────────────────────────────── */
function itemRows(order) {
  const currency = order.pricing?.currency || 'CAD';
  return (order.items || []).map(item => {
    const variant = [item.variant?.size, item.variant?.color].filter(Boolean).join(' / ');
    const total = (item.price || 0) * (item.quantity || 1);
    return `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid #f0ece4;vertical-align:top;">
        <table cellpadding="0" cellspacing="0" role="presentation"><tr>
          <td class="item-img" style="padding-right:14px;vertical-align:top;">
            <img src="${esc(item.image || LOGO_URL)}" width="64" height="64"
                 alt="${esc(item.name || '')}"
                 style="border-radius:8px;object-fit:cover;background:#f1ece2;width:64px;height:64px;" />
          </td>
          <td style="vertical-align:top;">
            <div style="font-weight:700;color:#2b2014;font-size:14px;line-height:1.4;">${esc(item.name || 'Item')}</div>
            ${variant ? `<div style="font-size:12px;color:#999;margin-top:3px;">${esc(variant)}</div>` : ''}
            <div style="font-size:12px;color:#aaa;margin-top:2px;">Qty: ${item.quantity || 1}</div>
          </td>
        </tr></table>
      </td>
      <td class="price-col" style="padding:14px 0;border-bottom:1px solid #f0ece4;text-align:right;
          color:#2b2014;font-size:14px;font-weight:600;white-space:nowrap;vertical-align:top;">
        ${fmt(total, currency)}
      </td>
    </tr>`;
  }).join('');
}

/* ── Pricing summary rows ───────────────────────────────────── */
function pricingRows(order) {
  const c = order.pricing?.currency || 'CAD';
  const p = order.pricing || {};
  const rows = [
    ['Subtotal', fmt(p.subtotal, c)],
    ['Shipping', p.shipping === 0 ? '<span style="color:#16a34a;font-weight:600;">FREE</span>' : fmt(p.shipping, c)],
    p.discount ? [`Discount${p.couponCode ? ` (${esc(p.couponCode)})` : ''}`,
      `<span style="color:#dc2626;">-${fmt(p.discount, c)}</span>`] : null,
    p.tax ? ['Tax', fmt(p.tax, c)] : null,
  ].filter(Boolean);

  const dataRows = rows.map(([l, v]) => `
    <tr>
      <td style="padding:5px 0;color:#777;font-size:13px;">${l}</td>
      <td style="padding:5px 0;text-align:right;font-size:13px;">${v}</td>
    </tr>`).join('');

  const totalRow = `
    <tr>
      <td style="padding:14px 0 4px;color:#2b2014;font-size:16px;font-weight:700;
          border-top:2px solid #2b2014;">Total</td>
      <td style="padding:14px 0 4px;text-align:right;color:#2b2014;font-size:16px;
          font-weight:700;border-top:2px solid #2b2014;">${fmt(p.total, c)}</td>
    </tr>`;

  return dataRows + totalRow;
}

/* ── Address block ──────────────────────────────────────────── */
function addressBlock(addr) {
  if (!addr) return '';
  const lines = [
    addr.fullName,
    addr.address,
    [addr.city, addr.state, addr.postalCode].filter(Boolean).join(', '),
    addr.country,
    addr.phone,
  ].filter(Boolean);
  return lines.map(l => esc(l)).join('<br/>');
}

/* ── Status badge ───────────────────────────────────────────── */
function statusBadge(status) {
  const colors = {
    pending: '#f59e0b', confirmed: '#3b82f6', processing: '#8b5cf6',
    shipped: '#0ea5e9', delivered: '#16a34a', cancelled: '#dc2626', refunded: '#6b7280',
  };
  const bg = colors[status] || '#6b7280';
  return `<span style="display:inline-block;padding:3px 10px;border-radius:20px;
    background:${bg};color:#fff;font-size:11px;font-weight:700;letter-spacing:0.5px;
    text-transform:uppercase;">${STATUS_LABELS[status] || status}</span>`;
}

/* ── CTA button ─────────────────────────────────────────────── */
function ctaButton(label, url, color = '#C8923A') {
  return `
  <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;">
    <tr><td style="border-radius:8px;background:${color};">
      <a href="${url}" style="display:inline-block;padding:12px 28px;color:#fff;
         font-size:14px;font-weight:700;text-decoration:none;border-radius:8px;
         font-family:Arial,Helvetica,sans-serif;">${label}</a>
    </td></tr>
  </table>`;
}

/* ════════════════════════════════════════════════════════════
   CUSTOMER ORDER CONFIRMATION EMAIL
═══════════════════════════════════════════════════════════════ */
function buildCustomerInvoiceEmail(order) {
  const customerName = order.shippingAddress?.fullName || order.user?.name || 'Valued Customer';
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const payMethod = (order.payment?.method || '-').replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  const isPaid = order.payment?.status === 'paid';
  const isGenie = order.payment?.method === 'genie';
  const greetingTitle = isPaid ? 'Thank you for your order!' : 'Your order has been received';
  const greetingMessage = isPaid
    ? `Hi <strong>${esc(customerName)}</strong>, your order is confirmed and our artisans are getting it ready with care. You'll receive another email once it's shipped.`
    : isGenie
      ? `Hi <strong>${esc(customerName)}</strong>, we have reserved your order details. Please complete the Dialog Genie payment to confirm the order. We will send a separate payment-success email after Genie verifies the payment.`
      : `Hi <strong>${esc(customerName)}</strong>, we have received your order. Payment is still pending and the order will be confirmed after the payment is verified.`;

  const body = `
  ${header()}
  ${divider()}

  <tr><td class="body-pad" style="padding:36px 40px;">

    <!-- Hero greeting -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr><td style="padding-bottom:24px;border-bottom:1px solid #f0ece4;">
        <div style="font-size:24px;font-weight:800;color:#2b2014;margin-bottom:6px;">
          ${greetingTitle}
        </div>
        <p style="color:#666;font-size:14px;line-height:1.6;margin:0;">
          ${greetingMessage}
        </p>
      </td></tr>
    </table>

    <!-- Order meta pills -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
           style="margin:24px 0;background:#faf7f2;border-radius:10px;padding:0;">
      <tr><td style="padding:20px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="width:50%;vertical-align:top;padding-bottom:12px;">
              <div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Order Number</div>
              <div style="font-size:15px;font-weight:700;color:#2b2014;">#${esc(order.orderNumber)}</div>
            </td>
            <td style="width:50%;vertical-align:top;padding-bottom:12px;text-align:right;">
              <div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Order Date</div>
              <div style="font-size:14px;color:#2b2014;">${orderDate}</div>
            </td>
          </tr>
          <tr>
            <td style="vertical-align:top;">
              <div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Payment</div>
              <div style="font-size:13px;color:#2b2014;">${esc(payMethod)}</div>
            </td>
            <td style="vertical-align:top;text-align:right;">
              <div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Status</div>
              ${statusBadge(order.status || 'pending')}
            </td>
          </tr>
        </table>
      </td></tr>
    </table>

    <!-- Items -->
    <div style="font-size:13px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">
      Order Items
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      ${itemRows(order)}
    </table>

    <!-- Pricing -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:8px;">
      ${pricingRows(order)}
    </table>

    <!-- Shipping address -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
           style="margin-top:28px;background:#faf7f2;border-radius:10px;">
      <tr><td style="padding:20px 24px;">
        <div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">
          📦 Shipping To
        </div>
        <div style="color:#2b2014;font-size:13px;line-height:1.8;">
          ${addressBlock(order.shippingAddress)}
        </div>
      </td></tr>
    </table>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:28px;">
      <tr><td style="text-align:center;">
        ${ctaButton('View Your Order', `${SITE_URL}/orders`)}
      </td></tr>
    </table>

    <!-- Handcrafted note -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
           style="margin-top:24px;border-top:1px solid #f0ece4;padding-top:20px;">
      <tr><td style="padding-top:20px;text-align:center;">
        <p style="color:#999;font-size:12px;line-height:1.7;margin:0;">
          ✨ Every Kesara Bathik piece is handcrafted by skilled artisans in Sri Lanka.<br/>
          Thank you for supporting authentic batik heritage.
        </p>
      </td></tr>
    </table>

  </td></tr>
  ${footer(true)}`;

  return shell(body);
}

/* ════════════════════════════════════════════════════════════
   ADMIN NEW ORDER NOTIFICATION EMAIL
═══════════════════════════════════════════════════════════════ */
function buildAdminOrderEmail(order) {
  const customerName = order.shippingAddress?.fullName || order.user?.name || 'Guest';
  const customerEmail = order.shippingAddress?.email || order.guestEmail || order.user?.email || '';
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  const c = order.pricing?.currency || 'CAD';

  const body = `
  ${header()}
  ${divider('#e53e3e')}

  <tr><td class="body-pad" style="padding:32px 40px;">

    <!-- Alert banner -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
           style="background:#fff5f5;border:1px solid #feb2b2;border-radius:10px;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;">
        <div style="font-size:18px;font-weight:800;color:#c53030;margin-bottom:4px;">
          🛍️ New Order Received!
        </div>
        <div style="color:#742a2a;font-size:13px;">
          Order <strong>#${esc(order.orderNumber)}</strong> was placed on ${orderDate}
        </div>
      </td></tr>
    </table>

    <!-- Customer info -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
           style="background:#faf7f2;border-radius:10px;margin-bottom:20px;">
      <tr><td style="padding:20px 24px;">
        <div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">
          👤 Customer Details
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="padding-bottom:8px;">
              <span style="color:#888;font-size:12px;">Name:</span>
              <span style="color:#2b2014;font-size:13px;font-weight:600;margin-left:8px;">${esc(customerName)}</span>
            </td>
          </tr>
          ${customerEmail ? `
          <tr><td style="padding-bottom:8px;">
            <span style="color:#888;font-size:12px;">Email:</span>
            <a href="mailto:${esc(customerEmail)}" style="color:#C8923A;font-size:13px;margin-left:8px;">${esc(customerEmail)}</a>
          </td></tr>` : ''}
          ${order.shippingAddress?.phone ? `
          <tr><td style="padding-bottom:8px;">
            <span style="color:#888;font-size:12px;">Phone:</span>
            <span style="color:#2b2014;font-size:13px;margin-left:8px;">${esc(order.shippingAddress.phone)}</span>
          </td></tr>` : ''}
          <tr><td>
            <span style="color:#888;font-size:12px;">Type:</span>
            <span style="color:#2b2014;font-size:13px;margin-left:8px;">
              ${order.user ? 'Registered Customer' : 'Guest Checkout'}
            </span>
          </td></tr>
        </table>
      </td></tr>
    </table>

    <!-- Order summary -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
           style="background:#faf7f2;border-radius:10px;margin-bottom:20px;">
      <tr><td style="padding:20px 24px;">
        <div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">
          📋 Order Summary
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="padding-bottom:6px;color:#888;font-size:12px;">Order #</td>
            <td style="padding-bottom:6px;text-align:right;font-size:13px;font-weight:700;color:#2b2014;">${esc(order.orderNumber)}</td>
          </tr>
          <tr>
            <td style="padding-bottom:6px;color:#888;font-size:12px;">Payment Method</td>
            <td style="padding-bottom:6px;text-align:right;font-size:13px;color:#2b2014;">${esc((order.payment?.method || '-').replace('_', ' '))}</td>
          </tr>
          <tr>
            <td style="padding-bottom:6px;color:#888;font-size:12px;">Payment Status</td>
            <td style="padding-bottom:6px;text-align:right;">${statusBadge(order.payment?.status || 'pending')}</td>
          </tr>
          <tr>
            <td style="padding-bottom:6px;color:#888;font-size:12px;">Currency</td>
            <td style="padding-bottom:6px;text-align:right;font-size:13px;color:#2b2014;">${esc(c)}</td>
          </tr>
          <tr style="border-top:2px solid #e2d9cc;">
            <td style="padding-top:10px;color:#2b2014;font-size:14px;font-weight:700;">ORDER TOTAL</td>
            <td style="padding-top:10px;text-align:right;font-size:16px;font-weight:800;color:#C8923A;">${fmt(order.pricing?.total, c)}</td>
          </tr>
        </table>
      </td></tr>
    </table>

    <!-- Items ordered -->
    <div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">
      📦 Items Ordered (${(order.items || []).length})
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      ${itemRows(order)}
    </table>

    <!-- Shipping address -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
           style="margin-top:16px;background:#faf7f2;border-radius:10px;">
      <tr><td style="padding:20px 24px;">
        <div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">
          🏠 Shipping Address
        </div>
        <div style="color:#2b2014;font-size:13px;line-height:1.8;">${addressBlock(order.shippingAddress)}</div>
      </td></tr>
    </table>

    ${order.notes ? `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
           style="margin-top:16px;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;">
      <tr><td style="padding:16px 20px;">
        <div style="font-size:11px;color:#92400e;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">
          📝 Customer Notes
        </div>
        <div style="color:#78350f;font-size:13px;line-height:1.6;">${esc(order.notes)}</div>
      </td></tr>
    </table>` : ''}

    <!-- Admin action buttons -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:28px;">
      <tr>
        <td style="text-align:center;padding-bottom:10px;">
          ${ctaButton('Manage This Order →', `${ADMIN_URL}/${order._id}`, '#2b2014')}
        </td>
      </tr>
      ${customerEmail ? `
      <tr><td style="text-align:center;padding-top:8px;">
        <a href="mailto:${esc(customerEmail)}" style="color:#C8923A;font-size:13px;font-weight:600;">
          Reply to Customer ✉️
        </a>
      </td></tr>` : ''}
    </table>

  </td></tr>
  ${footer(false)}`;

  return shell(body);
}

/* ════════════════════════════════════════════════════════════
   SHIPPING UPDATE EMAIL (sent to customer when order is shipped)
═══════════════════════════════════════════════════════════════ */
function buildShippingEmail(order) {
  const customerName = order.shippingAddress?.fullName || order.user?.name || 'Valued Customer';
  const c = order.pricing?.currency || 'CAD';

  const body = `
  ${header()}
  ${divider('#0ea5e9')}

  <tr><td class="body-pad" style="padding:36px 40px;">

    <!-- Hero -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
           style="padding-bottom:24px;border-bottom:1px solid #f0ece4;">
      <tr><td>
        <div style="font-size:36px;text-align:center;margin-bottom:8px;">📦</div>
        <div style="font-size:22px;font-weight:800;color:#2b2014;text-align:center;margin-bottom:8px;">
          Your order is on its way!
        </div>
        <p style="color:#666;font-size:14px;line-height:1.6;text-align:center;margin:0;">
          Hi <strong>${esc(customerName)}</strong>, great news — your Kesara Bathik order
          has been handed to our courier and is on its way to you. 🎉
        </p>
      </td></tr>
    </table>

    <!-- Order + tracking info -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
           style="margin:24px 0;background:#faf7f2;border-radius:10px;">
      <tr><td style="padding:20px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="padding-bottom:10px;">
              <div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Order Number</div>
              <div style="font-size:15px;font-weight:700;color:#2b2014;">#${esc(order.orderNumber)}</div>
            </td>
            <td style="padding-bottom:10px;text-align:right;">
              <div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Status</div>
              ${statusBadge('shipped')}
            </td>
          </tr>
          ${order.trackingNumber ? `
          <tr><td colspan="2" style="padding-top:8px;border-top:1px solid #e2d9cc;">
            <div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Tracking Number</div>
            <div style="font-size:15px;font-weight:700;color:#0ea5e9;">${esc(order.trackingNumber)}</div>
            ${order.courier ? `<div style="font-size:12px;color:#888;margin-top:2px;">via ${esc(order.courier)}</div>` : ''}
          </td></tr>` : ''}
          ${order.estimatedDelivery ? `
          <tr><td colspan="2" style="padding-top:10px;">
            <div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Estimated Delivery</div>
            <div style="font-size:13px;color:#2b2014;">
              ${new Date(order.estimatedDelivery).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}
            </div>
          </td></tr>` : ''}
        </table>
      </td></tr>
    </table>

    <!-- Items recap -->
    <div style="font-size:13px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">
      Items Shipped
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      ${itemRows(order)}
    </table>

    <!-- Pricing -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:8px;">
      ${pricingRows(order)}
    </table>

    <!-- Shipping address -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
           style="margin-top:24px;background:#faf7f2;border-radius:10px;">
      <tr><td style="padding:20px 24px;">
        <div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">
          📍 Delivering To
        </div>
        <div style="color:#2b2014;font-size:13px;line-height:1.8;">${addressBlock(order.shippingAddress)}</div>
      </td></tr>
    </table>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:24px;">
      <tr><td style="text-align:center;">
        ${ctaButton('Track My Order', `${SITE_URL}/orders`, '#0ea5e9')}
      </td></tr>
    </table>

    <!-- Note -->
    <p style="color:#999;font-size:12px;line-height:1.7;text-align:center;margin:24px 0 0;">
      ✨ Thank you for choosing Kesara Bathik. Your support helps preserve
      authentic Sri Lankan batik craftsmanship.
    </p>

  </td></tr>
  ${footer(true)}`;

  return shell(body);
}

/* ── Public API ─────────────────────────────────────────────── */
function buildOrderEmail({ order, recipientType }) {
  if (recipientType === 'admin') return buildAdminOrderEmail(order);
  return buildCustomerInvoiceEmail(order);
}

module.exports = { buildOrderEmail, buildShippingEmail };
