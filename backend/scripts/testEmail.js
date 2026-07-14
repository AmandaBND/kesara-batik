require('dotenv').config();

const { sendEmail, logEmailConfiguration } = require('../src/services/emailService');

async function main() {
  const recipient = process.argv[2] || process.env.ADMIN_EMAIL;

  if (!recipient) {
    console.error('Usage: npm run email:test -- you@example.com');
    console.error('Or set ADMIN_EMAIL in the environment.');
    process.exitCode = 1;
    return;
  }

  logEmailConfiguration();

  const result = await sendEmail({
    to: recipient,
    subject: 'Kesara Bathik email service test',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px">
        <h2 style="color:#9a6700">Kesara Bathik email test</h2>
        <p>The Brevo transactional email service is working correctly.</p>
        <p style="color:#666;font-size:13px">Sent at ${new Date().toISOString()}</p>
      </div>
    `,
  });

  if (!result.ok) {
    console.error('[email:test] Failed:', result.error || result.reason || 'Unknown error');
    process.exitCode = 1;
    return;
  }

  console.log('[email:test] Success:', result.messageId || 'accepted by provider');
}

main().catch((error) => {
  console.error('[email:test] Unexpected failure:', error);
  process.exitCode = 1;
});
