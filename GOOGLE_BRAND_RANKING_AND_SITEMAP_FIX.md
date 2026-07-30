# Google Brand Ranking and Sitemap Stability Fix

## What the Search Console message means

The homepage is indexed, crawlable, and Google selected the inspected URL as canonical. The `Temporary processing error` shown beside **Discovery → Sitemaps** is a Search Console reporting/retrieval status, not proof that the homepage is blocked. The separate Sitemaps report should remain the source of truth for sitemap submission status.

## Technical improvements in this project

1. The homepage title now begins with the exact brand name:
   - `Kesara Bathik | Authentic Sri Lankan Batik & Bathik Clothing`
2. The prerendered homepage H1 begins with `Kesara Bathik`.
3. The homepage description explicitly identifies the site as the official Kesara Bathik store.
4. Website and Organization structured data use the same exact brand name and a proper logo ImageObject.
5. The sitemap uses stable, accurate `lastmod` values instead of changing every URL on every deployment.
6. Ignored sitemap fields (`changefreq` and `priority`) were removed.
7. The sitemap keeps a stable product fallback list if the Railway API is temporarily unavailable during a Vercel build.
8. Product detail URLs now receive product-specific prerendered HTML, titles, canonical tags, H1 text and Product structured data. Previously, product URLs initially returned the homepage SEO snapshot.
9. Privacy, refund and terms pages now receive their own prerendered `noindex` HTML instead of initially returning homepage metadata.
10. SEO validation now fails the build if canonical tags, robots directives, product snapshots, sitemap URLs, or the brand-first homepage title are missing.

## Deployment

Vercel settings:

- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

After deploying, make `www.kesarabathik.com` the primary production domain in Vercel so the non-WWW hostname permanently redirects to WWW.

## Verification after deployment

Open these URLs:

- `https://www.kesarabathik.com/robots.txt`
- `https://www.kesarabathik.com/sitemap.xml`
- `view-source:https://www.kesarabathik.com/`
- `view-source:https://www.kesarabathik.com/products/green-and-white-bathik-kit-gents-1784274576410`

The homepage source should contain:

- Brand-first title
- Canonical `https://www.kesarabathik.com/`
- H1 beginning with `Kesara Bathik`

A product source should contain its own product name, canonical URL and Product JSON-LD rather than the homepage title and H1.

## Search Console actions

1. Keep only `https://www.kesarabathik.com/sitemap.xml` submitted.
2. Confirm the Sitemaps report says `Success`.
3. Inspect the homepage and run one Live Test after deployment.
4. Request indexing once.
5. Do not repeatedly remove and resubmit the sitemap.
6. Check **Performance → Search results → Queries** for `Kesara Bathik` and compare impressions and average position after Google recrawls the new title and H1.

## Important limitation

No code change can guarantee the first Google position. Search Console's temporary sitemap-processing message can also remain temporarily even when the sitemap report says Success. These changes remove the site-level technical weaknesses that can cause duplicate content, unstable sitemap output, weak exact-brand signals and slow product-page understanding.
