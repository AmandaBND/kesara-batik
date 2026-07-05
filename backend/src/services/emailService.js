const nodemailer = require('nodemailer');
const { buildOrderEmail, buildShippingEmail } = require('../templates/orderInvoiceEmail');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  // Railway blocks port 587 (STARTTLS). Use port 465 with SSL instead.
  transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
    port: 465,
    secure: true,   // SSL on port 465 — works on Railway
    auth: {
      user: process.env.BREVO_SMTP_LOGIN,
      pass: process.env.BREVO_SMTP_PASSWORD,
    },
  });
  return transporter;
}

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
      to, subject, html,
      ...(replyTo && { replyTo }),
    });
    console.log(`[email] ✅ Sent "${subject}" → ${to}  (msgId: ${info.messageId})`);
  } catch (err) {
    console.error(`[email] ❌ Failed "${subject}" → ${to}: ${err.message}`);
    // Reset transporter on failure so next attempt gets a fresh connection
    transporter = null;
  }
}

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
    console.warn(`[email] Order ${order.orderNumber}: no customer email, skipping`);
  }

  if (adminEmail) {
    tasks.push(sendEmail({
      to: adminEmail,
      subject: `🛍️ New Order #${order.orderNumber} — ${order.shippingAddress?.fullName || 'Guest'} (${order.pricing?.currency || 'LKR'} ${Number(order.pricing?.total || 0).toFixed(2)})`,
      html: buildOrderEmail({ order, recipientType: 'admin' }),
      replyTo: customerEmail || undefined,
    }));
  } else {
    console.warn('[email] ADMIN_EMAIL not set — skipping admin notification');
  }

  await Promise.allSettled(tasks);
}

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
