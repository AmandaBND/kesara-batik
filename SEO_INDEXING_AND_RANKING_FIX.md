# Kesara Bathik indexing and ranking fix

## What this release changes

1. Public SEO routes are emitted as real static HTML files:
   - `/products`
   - `/new-arrivals`
   - `/women`
   - `/men`
   - `/kids`
   - `/family-kits`
   - `/accessories`
   - `/faq`

2. Vercel `cleanUrls` serves `women.html` as `/women` directly. The older rewrite-to-`seo-women.html` approach has been removed.
3. Each category has a unique title, description, canonical URL, H1, category information, FAQ content, internal links and JSON-LD.
4. Clean category pages no longer render `No products found`. If inventory is temporarily empty or the API is unavailable, the page remains useful and links to current collections.
5. The backend includes legacy products whose subcategory identifies the parent category, even when an older database record is missing `parentCategory`.
6. The sitemap is generated on every build, includes all canonical public routes, adds product URLs when the API is available, and is declared in `robots.txt`.
7. The production build fails if a prerendered route, canonical, H1, sitemap entry, robots directive or structured-data block is missing.

## Deploy

### Vercel

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`

Deploy the frontend after pushing this release.

### Railway

Deploy the backend so legacy category matching is active.

Run this one time in the Railway service shell:

```bash
npm run products:backfill-categories
```

This only fills missing `parentCategory` values based on the existing product subcategory. It does not change prices, stock, images, payments or orders.

## Verify after deployment

Open these URLs in a browser:

- `https://www.kesarabathik.com/robots.txt`
- `https://www.kesarabathik.com/sitemap.xml`
- `https://www.kesarabathik.com/women`
- `https://www.kesarabathik.com/men`

Then inspect source:

- `view-source:https://www.kesarabathik.com/women`
- `view-source:https://www.kesarabathik.com/men`

The source must contain the route-specific title, canonical URL, H1, useful category text and JSON-LD before JavaScript runs.

## Search Console

1. Remove any old sitemap entry that reports an error.
2. Submit exactly: `https://www.kesarabathik.com/sitemap.xml`
3. Wait until the Sitemaps report says `Success`.
4. Inspect `/women`, `/men`, `/kids`, `/family-kits`, `/accessories`, `/products`, `/new-arrivals`.
5. Run `Test Live URL` once for each changed page.
6. Request indexing once for each page after the live test succeeds.

`No referring sitemaps detected` on an old crawl does not update instantly. It changes after Google processes the submitted sitemap and crawls the URL through it.

## Ranking priorities

1. Keep at least one real, active product in every category you want to rank commercially.
2. Write unique, detailed descriptions for every product. Do not copy supplier or competitor descriptions.
3. Add genuine customer reviews to product pages and Google Business Profile.
4. Connect Google Merchant Center and submit a product feed.
5. Earn genuine links and mentions from Sri Lankan fashion, craft, tourism, wedding and local-business websites.
6. Publish useful guides such as batik care, batik versus bathik, saree price guides and how Sri Lankan batik is made.
7. Improve mobile image size, Core Web Vitals and product-page speed.
8. Review Search Console Performance by page and query instead of repeatedly requesting indexing.

No technical change can guarantee first position. This release removes the sitemap, routing, soft-404 and thin-category-page problems that prevent Google from evaluating the pages normally.
