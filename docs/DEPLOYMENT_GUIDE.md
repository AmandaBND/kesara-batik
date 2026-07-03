# 🦁 Kesara Batik — Complete A–Z Setup & Deployment Guide

## OVERVIEW

This is a full-stack MERN application:
- **Frontend**: React + Vite + TailwindCSS → Deploy on **Vercel** (free)
- **Backend**: Node.js + Express → Deploy on **Railway** (free tier)
- **Database**: MongoDB Atlas (free tier – 512MB)
- **Images**: Cloudinary (free tier – 10GB)
- **Payments**: Stripe + PayPal + Google Pay

---

## STEP 1 — Create MongoDB Atlas Database (FREE)

1. Go to https://cloud.mongodb.com → Create free account
2. Click **"Build a Database"** → Choose **FREE M0** tier
3. Choose region: **AWS us-east-1** (close to Canada)
4. Create username & password (save these!)
5. Under "Network Access" → Click **"Add IP Address"** → **"Allow Access from Anywhere"** (0.0.0.0/0)
6. Click **"Connect"** → **"Connect your application"** → Copy the connection string
7. Replace `<password>` with your password in the string — this is your `MONGODB_URI`

Example: `mongodb+srv://admin:yourpassword@cluster0.xxxxx.mongodb.net/kesara-batik?retryWrites=true&w=majority`

---

## STEP 2 — Set Up Cloudinary (Image Hosting — FREE)

1. Go to https://cloudinary.com → Create free account
2. Go to **Dashboard** → Note your:
   - Cloud Name
   - API Key
   - API Secret
3. These become: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

---

## STEP 3 — Set Up Google OAuth (FREE)

1. Go to https://console.cloud.google.com
2. Create new project: "Kesara Batik"
3. Go to **APIs & Services** → **OAuth Consent Screen**
   - Choose "External" → Fill your app name & email
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized JavaScript origins: `https://kesarabatik.com`, `http://localhost:3000`
   - Authorized redirect URIs: `https://kesarabatik.com`
5. Copy **Client ID** → this is `GOOGLE_CLIENT_ID`

---

## STEP 4 — Set Up Stripe Payment (Credit/Debit Cards)

1. Go to https://stripe.com → Create account
2. Go to **Developers** → **API Keys**
3. Copy **Secret Key** (sk_live_...) → `STRIPE_SECRET_KEY`
4. Copy **Publishable Key** (pk_live_...) → `VITE_STRIPE_PUBLISHABLE_KEY`
5. Go to **Webhooks** → Add endpoint: `https://your-backend.railway.app/api/payments/stripe/webhook`
6. Select event: `payment_intent.succeeded`
7. Copy **Webhook Secret** → `STRIPE_WEBHOOK_SECRET`

> ⚠️ Sri Lanka Note: Use Stripe Atlas or add a Canadian business address to enable Stripe in Sri Lanka. Alternatively, use PayPal as the primary gateway.

---

## STEP 5 — Set Up PayPal (Works in Sri Lanka!)

1. Go to https://developer.paypal.com → Create Business Account
2. Go to **My Apps & Credentials** → **Live** tab
3. Click **Create App** → Name it "Kesara Batik"
4. Copy **Client ID** → `PAYPAL_CLIENT_ID`
5. Copy **Secret** → `PAYPAL_CLIENT_SECRET`
6. Set `PAYPAL_MODE=live`

> ✅ PayPal works in Sri Lanka and sends money directly to your PayPal account!

---

## STEP 6 — Set Up Brevo (Transactional Order Emails)

You're using **Brevo** (formerly Sendinblue) to send order confirmation emails to customers and new-order alerts to your inbox. Free tier covers 300 emails/day, plenty for a new store.

1. Go to https://app.brevo.com → **Settings** → **SMTP & API** → **SMTP** tab
2. Copy these four values:
   - SMTP server → `smtp-relay.brevo.com`
   - Port → `587`
   - Login → looks like `xxxxxxx@smtp-brevo.com` → this is `BREVO_SMTP_LOGIN`
   - Password (the SMTP key, not your Brevo account password) → `BREVO_SMTP_PASSWORD`
3. **Authenticate your domain** (you've already done this ✅ — `kesarabathik.com` shows "Authenticated" under **Senders, domains, IPs → Domains**). This is what lets you send `@kesarabathik.com` emails without landing in spam:
   - Brevo code (TXT) on `@`
   - DKIM 1 + DKIM 2 (CNAME records)
   - DMARC (TXT on `_dmarc`)
   - All of these live in **Namecheap → Domain List → kesarabathik.com → Advanced DNS**
4. Pick an address to send from, e.g. `orders@kesarabathik.com` — it doesn't need to be a real working inbox since the domain itself is authenticated; this just becomes `EMAIL_FROM`
5. Pick a real inbox you actually check for `ADMIN_EMAIL` (where "new order" alerts land) — this can be a Gmail address, doesn't have to be on your domain

> ⚠️ Treat the SMTP password as a secret, same as a database password. Never commit it to GitHub — it only goes into Railway's environment variables (Step 8) and your local `.env` file, both of which are already git-ignored.

---

## STEP 7 — Deploy Backend on Railway (FREE)

1. Go to https://railway.app → Sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub Repo"**
3. Upload or push your code to GitHub first:
   ```bash
   git init
   git add .
   git commit -m "Initial Kesara Batik commit"
   git remote add origin https://github.com/YOURUSERNAME/kesara-batik.git
   git push -u origin main
   ```
4. Select your repo → Railway auto-detects Node.js
5. Set **Root Directory** to `/backend`
6. Go to **Variables** tab → Add ALL variables from `.env.example`:
   ```
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_super_secret_key_make_it_long_random
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   PAYPAL_CLIENT_ID=...
   PAYPAL_CLIENT_SECRET=...
   PAYPAL_MODE=live
   BREVO_SMTP_HOST=smtp-relay.brevo.com
   BREVO_SMTP_PORT=587
   BREVO_SMTP_LOGIN=xxxxxxx@smtp-brevo.com
   BREVO_SMTP_PASSWORD=your_brevo_smtp_password
   EMAIL_FROM=orders@kesarabathik.com
   EMAIL_FROM_NAME=Kesara Bathik
   ADMIN_EMAIL=your_admin_inbox@kesarabathik.com
   FRONTEND_URL=https://kesarabatik.com
   ```
7. Railway gives you a URL like: `https://kesara-batik-production.up.railway.app`
8. Note this URL → it becomes `VITE_API_URL`

---

## STEP 8 — Deploy Frontend on Vercel (FREE)

1. Go to https://vercel.com → Sign in with GitHub
2. Click **"New Project"** → Import your GitHub repo
3. Set **Root Directory** to `frontend`
4. Set **Framework Preset** to "Vite"
5. Add Environment Variables:
   ```
   VITE_API_URL=https://kesara-batik-production.up.railway.app/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```
6. Click **Deploy** → Vercel gives you: `https://kesarabatik.vercel.app`

---

## STEP 8 — Buy & Connect Domain

1. Buy domain from **Namecheap.com**: `kesarabatik.com` (~$12/year)
2. In **Vercel**: Settings → Domains → Add `kesarabatik.com`
3. In **Namecheap**: DNS Settings → Add Vercel's records:
   - A Record: `@` → `76.76.21.21`
   - CNAME: `www` → `cname.vercel-dns.com`
4. SSL (HTTPS) is automatic on Vercel ✅

---

## STEP 9 — Create First Admin User

After deployment, open MongoDB Atlas → Collections → users
1. Find your user record
2. Change `role` from `"user"` to `"admin"`
3. Save
Now login at `kesarabatik.com/login` → Go to `/admin`

---

## STEP 10 — SEO Setup for Canada, UAE, USA, Japan, Korea

### Google Search Console
1. Go to https://search.google.com/search-console
2. Add your domain → Verify ownership (Vercel makes this easy)
3. Submit sitemap: `https://kesarabatik.com/sitemap.xml`

### Google Analytics
1. Go to https://analytics.google.com → Create property
2. Add tracking code to your `index.html`

### Bing Webmaster (for UAE/Japan markets)
1. Go to https://www.bing.com/webmasters
2. Add your site

### Key SEO Already Built In:
- ✅ Structured data (Schema.org) in `index.html`
- ✅ Meta tags for each product page
- ✅ Canonical URLs
- ✅ Open Graph for social sharing
- ✅ Mobile-responsive design
- ✅ Fast loading (Vite + React)

### hreflang for Multi-Country (optional)
Add to `index.html`:
```html
<link rel="alternate" hreflang="en-ca" href="https://kesarabatik.com" />
<link rel="alternate" hreflang="en-us" href="https://kesarabatik.com" />
<link rel="alternate" hreflang="en-ae" href="https://kesarabatik.com" />
<link rel="alternate" hreflang="ja" href="https://kesarabatik.com/ja" />
<link rel="alternate" hreflang="ko" href="https://kesarabatik.com/ko" />
```

---

## LOCAL DEVELOPMENT

### Prerequisites
- Node.js 18+ (download from nodejs.org)
- Git (download from git-scm.com)

### Setup
```bash
# 1. Install all dependencies
cd kesara-batik
cd backend && npm install && cd ../frontend && npm install

# 2. Create environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# → Edit both files with your actual keys

# 3. Start backend (Terminal 1)
cd backend && npm run dev
# → Running on http://localhost:5000

# 4. Start frontend (Terminal 2)
cd frontend && npm run dev
# → Running on http://localhost:5173
```

---

## PAYMENT FLOW SUMMARY

| Method | Works in Sri Lanka | Receives Money |
|--------|-------------------|----------------|
| PayPal | ✅ Yes | PayPal account |
| Stripe | ⚠️ Needs setup | Bank account |
| Google Pay | Via Stripe | Bank account |
| Bank Transfer | ✅ Yes | Direct bank |

**Recommended for Sri Lanka**: Start with **PayPal** + **Bank Transfer**.
Once business grows, add Stripe via Stripe Atlas (or partner with Canadian entity).

---

## MONTHLY STATEMENT

- Auto-generated every **20th of the month** via cron job
- Contains all orders, revenue, refunds for that month
- Admin can also download manually from `/admin/reports`
- PDF includes: Order table, payment status, revenue summary

---

## SUPPORT & UPDATES

For any issues:
1. Check Railway logs (backend errors)
2. Check Vercel logs (frontend build errors)
3. Check MongoDB Atlas metrics (database issues)

Common issues:
- CORS error → Add your frontend URL to `FRONTEND_URL` in Railway
- Images not uploading → Check Cloudinary keys
- Payments failing → Check Stripe/PayPal test mode vs live mode
