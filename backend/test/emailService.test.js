const test = require('node:test');
const assert = require('node:assert/strict');

const emailServicePath = require.resolve('../src/services/emailService');

function loadEmailService() {
  delete require.cache[emailServicePath];
  return require(emailServicePath);
}

function snapshotEnv() {
  return {
    BREVO_API_KEY: process.env.BREVO_API_KEY,
    BREVO_SMTP_LOGIN: process.env.BREVO_SMTP_LOGIN,
    BREVO_SMTP_PASSWORD: process.env.BREVO_SMTP_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
    NODE_ENV: process.env.NODE_ENV,
  };
}

function restoreEnv(snapshot) {
  for (const [key, value] of Object.entries(snapshot)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

test('Brevo HTTPS API is preferred and sends the correct payload', async () => {
  const previousEnv = snapshotEnv();
  const previousFetch = global.fetch;
  let capturedRequest;

  process.env.BREVO_API_KEY = 'test-api-key';
  process.env.BREVO_SMTP_LOGIN = 'smtp-user';
  process.env.BREVO_SMTP_PASSWORD = 'smtp-password';
  process.env.EMAIL_FROM = 'orders@kesarabathik.com';
  process.env.EMAIL_FROM_NAME = 'Kesara Bathik';

  global.fetch = async (url, options) => {
    capturedRequest = { url, options };
    return {
      ok: true,
      status: 201,
      text: async () => JSON.stringify({ messageId: '<test-message-id>' }),
    };
  };

  try {
    const { sendEmail, getEmailProvider } = loadEmailService();
    assert.equal(getEmailProvider(), 'brevo-api');

    const result = await sendEmail({
      to: 'customer@example.com',
      subject: 'Order confirmation',
      html: '<p>Order confirmed</p>',
      replyTo: 'support@kesarabathik.com',
    });

    assert.equal(result.ok, true);
    assert.equal(result.provider, 'brevo-api');
    assert.equal(capturedRequest.url, 'https://api.brevo.com/v3/smtp/email');
    assert.equal(capturedRequest.options.headers['api-key'], 'test-api-key');

    const payload = JSON.parse(capturedRequest.options.body);
    assert.deepEqual(payload.sender, {
      name: 'Kesara Bathik',
      email: 'orders@kesarabathik.com',
    });
    assert.deepEqual(payload.to, [{ email: 'customer@example.com' }]);
    assert.equal(payload.subject, 'Order confirmation');
    assert.equal(payload.htmlContent, '<p>Order confirmed</p>');
    assert.deepEqual(payload.replyTo, { email: 'support@kesarabathik.com' });
  } finally {
    global.fetch = previousFetch;
    restoreEnv(previousEnv);
  }
});

test('Brevo API errors are returned without throwing into the order request', async () => {
  const previousEnv = snapshotEnv();
  const previousFetch = global.fetch;

  process.env.BREVO_API_KEY = 'test-api-key';
  delete process.env.BREVO_SMTP_LOGIN;
  delete process.env.BREVO_SMTP_PASSWORD;

  global.fetch = async () => ({
    ok: false,
    status: 401,
    text: async () => JSON.stringify({ message: 'Key not found' }),
  });

  try {
    const { sendEmail } = loadEmailService();
    const result = await sendEmail({
      to: 'customer@example.com',
      subject: 'Order confirmation',
      html: '<p>Order confirmed</p>',
    });

    assert.equal(result.ok, false);
    assert.equal(result.provider, 'brevo-api');
    assert.equal(result.status, 401);
    assert.match(result.error, /Key not found/);
  } finally {
    global.fetch = previousFetch;
    restoreEnv(previousEnv);
  }
});

test('SMTP remains available only as a fallback when no API key exists', () => {
  const previousEnv = snapshotEnv();

  delete process.env.BREVO_API_KEY;
  process.env.BREVO_SMTP_LOGIN = 'smtp-user';
  process.env.BREVO_SMTP_PASSWORD = 'smtp-password';

  try {
    const { getEmailProvider } = loadEmailService();
    assert.equal(getEmailProvider(), 'brevo-smtp');
  } finally {
    restoreEnv(previousEnv);
  }
});


test('production does not auto-use blocked SMTP when the API key is missing', () => {
  const previousEnv = snapshotEnv();

  process.env.NODE_ENV = 'production';
  delete process.env.EMAIL_PROVIDER;
  delete process.env.BREVO_API_KEY;
  process.env.BREVO_SMTP_LOGIN = 'smtp-user';
  process.env.BREVO_SMTP_PASSWORD = 'smtp-password';

  try {
    const { getEmailProvider } = loadEmailService();
    assert.equal(getEmailProvider(), null);
  } finally {
    restoreEnv(previousEnv);
  }
});

test('payment-success customer email uses the dedicated subject and template', async () => {
  const previousEnv = snapshotEnv();
  const previousFetch = global.fetch;
  let payload;

  process.env.BREVO_API_KEY = 'test-api-key';
  process.env.EMAIL_FROM = 'orders@kesarabathik.com';
  process.env.EMAIL_FROM_NAME = 'Kesara Bathik';

  global.fetch = async (_url, options) => {
    payload = JSON.parse(options.body);
    return {
      ok: true,
      status: 201,
      text: async () => JSON.stringify({ messageId: '<payment-success-message-id>' }),
    };
  };

  const order = {
    _id: '507f1f77bcf86cd799439011',
    orderNumber: 'KB01003',
    shippingAddress: {
      fullName: 'Test Customer',
      email: 'customer@example.com',
      address: '12 Test Road',
      city: 'Colombo',
      country: 'Sri Lanka',
    },
    pricing: {
      subtotal: 8000,
      shipping: 450,
      total: 8450,
      currency: 'LKR',
    },
    payment: {
      method: 'genie',
      status: 'paid',
      transactionId: 'genie-transaction-123',
      gatewayAmountMajor: 8450,
      gatewayCurrency: 'LKR',
      paidAt: new Date('2026-07-14T05:25:26.000Z'),
    },
    items: [{
      name: 'Batik Saree',
      price: 8000,
      quantity: 1,
      image: 'https://example.com/saree.jpg',
      variant: { color: 'Pink & Black' },
    }],
  };

  try {
    const { sendPaymentSuccessEmail } = loadEmailService();
    const result = await sendPaymentSuccessEmail(order, 'customer');

    assert.equal(result.ok, true);
    assert.equal(payload.subject, 'Payment Successful — Order #KB01003 | Kesara Bathik');
    assert.deepEqual(payload.to, [{ email: 'customer@example.com' }]);
    assert.match(payload.htmlContent, /Payment successful/i);
    assert.match(payload.htmlContent, /genie-transaction-123/);
    assert.match(payload.htmlContent, /Rs\. 8,450\.00/);
  } finally {
    global.fetch = previousFetch;
    restoreEnv(previousEnv);
  }
});
