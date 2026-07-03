const nodemailer = require('nodemailer');
const { buildOrderEmail, buildShippingEmail } = require('../templates/orderInvoiceEmail');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
    port: Number(process.env.BREVO_SMTP_PORT) || 587,
    secure: false, // Brevo uses STARTTLS on port 587
    auth: {
      user: process.env.BREVO_SMTP_LOGIN,
      pass: process.env.BREVO_SMTP_PASSWORD,
    },
    tls: { rejectUnauthorized: false }, // Brevo requirement
  });
  return transporter;
}

/**
 * Low-level send. Never throws — logs errors so a mail failure
 * never takes down an order or checkout request.
 */
async function sendEmail({ to, subject, html, replyTo }) {
  if (!to) return;

  if (!process.env.BREVO_SMTP_LOGIN || !process.env.BREVO_SMTP_PASSWORD) {
    console.warn(`[email] Brevo not configured — skipped: "${subject}" to ${to}`);
    return;
  }

  const fromName    = process.env.EMAIL_FROM_NAME || 'Kesara Bathik';
  const fromAddress = process.env.EMAIL_FROM || 'orders@kesarabathik.com';

  try {
    const info = await getTransporter().sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to,
      subject,
      html,
      ...(replyTo && { replyTo }),
    });
    console.log(`[email] ✅ Sent "${subject}" → ${to}  (msgId: ${info.messageId})`);
  } catch (err) {
    console.error(`[email] ❌ Failed "${subject}" → ${to}:`, err.message);
  }
}

/**
 * Sends order confirmation to the customer and a new-order
 * notification to the admin. Fire-and-forget safe.
 */
async function sendOrderInvoiceEmails(order) {
  const customerEmail = order.shippingAddress?.email
    || order.guestEmail
    || order.user?.email;
  const adminEmail = process.env.ADMIN_EMAIL;

  const tasks = [];

  if (customerEmail) {
    tasks.push(sendEmail({
      to: customerEmail,
      subject: `Order Confirmed — #${order.orderNumber} | Kesara Bathik`,
      html: buildOrderEmail({ order, recipientType: 'customer' }),
    }));
  } else {
    console.warn(`[email] Order ${order.orderNumber}: no customer email, skipping customer invoice`);
  }

  if (adminEmail) {
    tasks.push(sendEmail({
      to: adminEmail,
      subject: `🛍️ New Order #${order.orderNumber} — ${order.shippingAddress?.fullName || 'Guest'} (${order.pricing?.currency || 'CAD'} ${Number(order.pricing?.total || 0).toFixed(2)})`,
      html: buildOrderEmail({ order, recipientType: 'admin' }),
      replyTo: customerEmail || undefined,
    }));
  } else {
    console.warn('[email] ADMIN_EMAIL not set — skipping admin notification');
  }

  await Promise.allSettled(tasks);
}

/**
 * Sends a shipping update email to the customer when their order
 * is marked as shipped. Call this from updateOrderStatus.
 */
async function sendShippingUpdateEmail(order) {
  const customerEmail = order.shippingAddress?.email
    || order.guestEmail
    || order.user?.email;

  if (!customerEmail) {
    console.warn(`[email] Order ${order.orderNumber}: no customer email, skipping shipping update`);
    return;
  }

  const trackingRef = order.trackingNumber ? ` — Tracking: ${order.trackingNumber}` : '';
  await sendEmail({
    to: customerEmail,
    subject: `Your order is on the way! #${order.orderNumber}${trackingRef} | Kesara Bathik`,
    html: buildShippingEmail(order),
  });
}

module.exports = { sendEmail, sendOrderInvoiceEmails, sendShippingUpdateEmail };
