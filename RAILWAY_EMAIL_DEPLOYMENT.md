# Kesara Bathik — Railway Deployment & Brevo Email Setup Guide

## ✅ What is already done
- Domain `kesarabathik.com` authenticated in Brevo (DKIM 1 ✅ DKIM 2 ✅ DMARC ✅)
- Email templates coded (customer invoice + admin notification + shipping update)
- Email fires automatically on every new order and every shipment

---

## Step 1 — Set Environment Variables in Railway

Go to your Railway project → select the **backend service** → click **Variables**.

Add these variables one by one:

| Variable | Value |
|---|---|
| `BREVO_SMTP_HOST` | `smtp-relay.brevo.com` |
| `BREVO_SMTP_PORT` | `587` |
| `BREVO_SMTP_LOGIN` | `b07266001@smtp-brevo.com` |
| `BREVO_SMTP_PASSWORD` | *(your Brevo SMTP password — from Brevo → Settings → SMTP & API → SMTP tab → the Password field)* |
| `EMAIL_FROM` | `orders@kesarabathik.com` |
| `EMAIL_FROM_NAME` | `Kesara Bathik` |
| `ADMIN_EMAIL` | *(your personal Gmail or inbox you check daily, e.g. `yourname@gmail.com`)* |

> ⚠️ `EMAIL_FROM` must end in `@kesarabathik.com` because that is the domain
> you authenticated in Brevo. Using any other domain will cause emails to be
> rejected or land in spam.

---

## Step 2 — Deploy the Backend

Railway auto-deploys when you push to GitHub. If your repo is connected:

```bash
git add .
git commit -m "feat: brevo email — invoice + shipping notifications"
git push
```

If you are deploying manually, drag the `/backend` folder into Railway or
use the Railway CLI:

```bash
railway up --service kesara-batik-backend
```

---

## Step 3 — Verify Emails are Working

### Option A: Place a real test order
1. Go to `https://www.kesarabathik.com`
2. Add any product to cart → proceed to checkout → place an order
3. Check your `ADMIN_EMAIL` inbox — you should receive the admin notification within 30 seconds
4. Check the email address entered at checkout — the customer invoice should arrive

### Option B: Check Railway logs
In Railway → your backend service → **Deployments** → click the latest deployment → **Logs**.

Look for lines like:
```
[email] ✅ Sent "Order Confirmed — #KB01001" → customer@email.com
[email] ✅ Sent "🛍️ New Order #KB01001 — ..." → your_admin@gmail.com
```

If you see `❌ Failed` lines, check that the `BREVO_SMTP_PASSWORD` is correct.

---

## Step 4 — Test Shipping Email

1. Log in as admin at `https://www.kesarabathik.com/admin`
2. Find any order → change its status to **Shipped**
3. (Optionally enter a tracking number and courier name before saving)
4. The customer will automatically receive the shipping update email

---

## How Emails Are Triggered

| Event | Who gets emailed | Template |
|---|---|---|
| Customer places an order | **Customer** (order confirmation + invoice) | `orderInvoiceEmail.js → buildCustomerInvoiceEmail` |
| Customer places an order | **Admin** (new order notification) | `orderInvoiceEmail.js → buildAdminOrderEmail` |
| Admin marks order as **Shipped** | **Customer** (shipping update + tracking) | `orderInvoiceEmail.js → buildShippingEmail` |

---

## Sender Address Setup in Brevo (one-time, if not done yet)

1. Go to **Brevo → Settings → Senders, Domains, IPs → Senders tab**
2. Click **Add a new sender**
3. Set:
   - **Name:** `Kesara Bathik`
   - **Email:** `orders@kesarabathik.com`
4. Save. No verification email required because `kesarabathik.com` is already
   authenticated as a domain.

---

## Troubleshooting

### Emails not arriving
- Check Railway logs for `[email]` lines
- Confirm `BREVO_SMTP_PASSWORD` matches exactly what is shown in Brevo → SMTP & API
- Confirm `EMAIL_FROM` ends in `@kesarabathik.com`

### Emails landing in spam
- Your domain's DKIM and DMARC are already verified — this should not happen
- Make sure `EMAIL_FROM` is `orders@kesarabathik.com`, not a Gmail or other address
- Check Brevo → **Deliverability Centre** for any bounce/block reports

### "Authentication failed" error in logs
- The SMTP password in Brevo can be regenerated: **Brevo → Settings → SMTP & API → Generate a new SMTP key**
- Update `BREVO_SMTP_PASSWORD` in Railway after regenerating

---

## Brevo Free Plan Limits

The Brevo free plan includes **300 emails/day**. For a new store this is
plenty. If you grow past ~300 orders/day, upgrade to the Starter plan.
Each order sends 2 emails (customer + admin), so the limit effectively covers
~150 orders/day on the free tier.

---

*Last updated: $(date +%Y-%m-%d)*
