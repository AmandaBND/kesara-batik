const nodemailer = require('nodemailer');
const { buildOrderEmail, buildShippingEmail } = require('../templates/orderInvoiceEmail');

const BREVO_EMAIL_API_URL = 'https://api.brevo.com/v3/smtp/email';
const DEFAULT_TIMEOUT_MS = 15000;

let transporter = null;
let transporterKey = null;

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function getTimeoutMs() {
  const configured = Number(process.env.EMAIL_SEND_TIMEOUT_MS);
  return Number.isFinite(configured) && configured >= 1000
    ? configured
    : DEFAULT_TIMEOUT_MS;
}

function getSender() {
  return {
    name: clean(process.env.EMAIL_FROM_NAME) || 'Kesara Bathik',
    email: clean(process.env.EMAIL_FROM) || 'orders@kesarabathik.com',
  };
}

function getEmailProvider() {
  const requestedProvider = clean(process.env.EMAIL_PROVIDER).toLowerCase();
  const hasApiKey = Boolean(clean(process.env.BREVO_API_KEY));
  const hasSmtpCredentials = Boolean(
    clean(process.env.BREVO_SMTP_LOGIN)
    && clean(process.env.BREVO_SMTP_PASSWORD),
  );

  if (requestedProvider === 'smtp') {
    return hasSmtpCredentials ? 'brevo-smtp' : null;
  }

  if (hasApiKey) return 'brevo-api';

  // Do not automatically attempt SMTP in production. Railway Free, Trial, and
  // Hobby plans block it, which causes long connection timeouts. SMTP can still
  // be selected explicitly with EMAIL_PROVIDER=smtp on Railway Pro or locally.
  if (process.env.NODE_ENV !== 'production' && hasSmtpCredentials) {
    return 'brevo-smtp';
  }

  return null;
}

function normalizeRecipients(to) {
  const rawRecipients = Array.isArray(to) ? to : [to];

  return rawRecipients
    .flatMap((recipient) => {
      if (typeof recipient === 'string') {
        return recipient.split(',').map((email) => ({ email: clean(email) }));
      }

      if (recipient && typeof recipient === 'object') {
        return [{
          email: clean(recipient.email),
          ...(clean(recipient.name) && { name: clean(recipient.name) }),
        }];
      }

      return [];
    })
    .filter((recipient) => recipient.email);
}

function createAbortController(timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  timeout.unref?.();
  return { controller, timeout };
}

async function parseResponseBody(response) {
  const raw = await response.text();
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    return { raw };
  }
}

async function sendWithBrevoApi({ to, subject, html, replyTo }) {
  const apiKey = clean(process.env.BREVO_API_KEY);
  if (!apiKey) {
    throw new Error('BREVO_API_KEY is not configured.');
  }

  const recipients = normalizeRecipients(to);
  if (!recipients.length) {
    throw new Error('No valid email recipient was supplied.');
  }

  const sender = getSender();
  const payload = {
    sender,
    to: recipients,
    subject,
    htmlContent: html,
    ...(clean(replyTo) && {
      replyTo: {
        email: clean(replyTo),
      },
    }),
    tags: ['kesara-bathik', 'transactional'],
  };

  const { controller, timeout } = createAbortController(getTimeoutMs());

  try {
    const response = await fetch(BREVO_EMAIL_API_URL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const body = await parseResponseBody(response);

    if (!response.ok) {
      const details = body.message || body.code || body.raw || `HTTP ${response.status}`;
      const error = new Error(`Brevo API rejected the email: ${details}`);
      error.status = response.status;
      error.details = body;
      throw error;
    }

    return {
      provider: 'brevo-api',
      messageId: body.messageId || null,
      response: body,
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Brevo HTTPS API timed out after ${getTimeoutMs()} ms.`);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function getSmtpConfig() {
  const host = clean(process.env.BREVO_SMTP_HOST) || 'smtp-relay.brevo.com';
  const configuredPort = Number(process.env.BREVO_SMTP_PORT);
  const port = Number.isInteger(configuredPort) && configuredPort > 0
    ? configuredPort
    : 587;
  const secure = port === 465;

  return {
    host,
    port,
    secure,
    auth: {
      user: clean(process.env.BREVO_SMTP_LOGIN),
      pass: clean(process.env.BREVO_SMTP_PASSWORD),
    },
    connectionTimeout: getTimeoutMs(),
    greetingTimeout: getTimeoutMs(),
    socketTimeout: getTimeoutMs() * 2,
    ...(secure
      ? {}
      : {
          requireTLS: true,
          tls: {
            minVersion: 'TLSv1.2',
          },
        }),
  };
}

function getTransporter() {
  const config = getSmtpConfig();
  const key = `${config.host}:${config.port}:${config.secure}:${config.auth.user}`;

  if (transporter && transporterKey === key) return transporter;

  transporter = nodemailer.createTransport(config);
  transporterKey = key;
  return transporter;
}

async function sendWithBrevoSmtp({ to, subject, html, replyTo }) {
  const recipients = normalizeRecipients(to);
  if (!recipients.length) {
    throw new Error('No valid email recipient was supplied.');
  }

  const sender = getSender();
  const info = await getTransporter().sendMail({
    from: `"${sender.name.replace(/"/g, '')}" <${sender.email}>`,
    to: recipients.map((recipient) => recipient.email).join(', '),
    subject,
    html,
    ...(clean(replyTo) && { replyTo: clean(replyTo) }),
  });

  return {
    provider: 'brevo-smtp',
    messageId: info.messageId || null,
    response: info.response || null,
  };
}

async function sendEmail({ to, subject, html, replyTo }) {
  const recipients = normalizeRecipients(to);
  if (!recipients.length) {
    console.warn(`[email] No valid recipient — skipped: "${subject}"`);
    return { ok: false, skipped: true, reason: 'missing-recipient' };
  }

  const provider = getEmailProvider();
  if (!provider) {
    console.warn(
      `[email] Brevo is not configured — skipped: "${subject}" → ${recipients.map((r) => r.email).join(', ')}`,
    );
    return { ok: false, skipped: true, reason: 'not-configured' };
  }

  try {
    const result = provider === 'brevo-api'
      ? await sendWithBrevoApi({ to: recipients, subject, html, replyTo })
      : await sendWithBrevoSmtp({ to: recipients, subject, html, replyTo });

    console.log(
      `[email] ✅ Sent via ${result.provider} "${subject}" → ${recipients.map((r) => r.email).join(', ')}`
      + (result.messageId ? ` (msgId: ${result.messageId})` : ''),
    );

    return { ok: true, ...result };
  } catch (error) {
    transporter = null;
    transporterKey = null;

    const target = recipients.map((recipient) => recipient.email).join(', ');
    console.error(
      `[email] ❌ Failed via ${provider} "${subject}" → ${target}: ${error.message}`,
    );

    if (provider === 'brevo-smtp' && /timeout|ETIMEDOUT|ESOCKET|ECONNREFUSED/i.test(error.message)) {
      console.error(
        '[email] Railway SMTP appears blocked. Add BREVO_API_KEY and redeploy so email uses the Brevo HTTPS API.',
      );
    }

    return {
      ok: false,
      provider,
      error: error.message,
      status: error.status,
    };
  }
}

function logEmailConfiguration() {
  const provider = getEmailProvider();
  const sender = getSender();

  if (provider === 'brevo-api') {
    console.log(`[email] Provider: Brevo HTTPS API | Sender: ${sender.email}`);
    return;
  }

  if (provider === 'brevo-smtp') {
    const config = getSmtpConfig();
    console.warn(
      `[email] Provider: Brevo SMTP ${config.host}:${config.port} | Sender: ${sender.email}. `
      + 'Railway Free/Trial/Hobby blocks SMTP; BREVO_API_KEY is recommended.',
    );
    return;
  }

  console.warn('[email] Disabled: set BREVO_API_KEY or Brevo SMTP credentials.');
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
      subject: `New Order #${order.orderNumber} — ${order.shippingAddress?.fullName || 'Guest'} (${order.pricing?.currency || 'LKR'} ${Number(order.pricing?.total || 0).toFixed(2)})`,
      html: buildOrderEmail({ order, recipientType: 'admin' }),
      replyTo: customerEmail || undefined,
    }));
  } else {
    console.warn('[email] ADMIN_EMAIL not set — skipping admin notification');
  }

  return Promise.allSettled(tasks);
}

async function sendShippingUpdateEmail(order) {
  const customerEmail = order.shippingAddress?.email
    || order.guestEmail
    || order.user?.email;

  if (!customerEmail) {
    console.warn(`[email] Order ${order.orderNumber}: no customer email, skipping shipping update`);
    return { ok: false, skipped: true, reason: 'missing-customer-email' };
  }

  const trackingRef = order.trackingNumber ? ` — Tracking: ${order.trackingNumber}` : '';

  return sendEmail({
    to: customerEmail,
    subject: `Your order is on the way! #${order.orderNumber}${trackingRef} | Kesara Bathik`,
    html: buildShippingEmail(order),
  });
}

module.exports = {
  sendEmail,
  sendOrderInvoiceEmails,
  sendShippingUpdateEmail,
  logEmailConfiguration,
  getEmailProvider,
};
