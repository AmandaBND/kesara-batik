# Googlebot API Resource Fix

Google Search Console previously reported that these Railway XHR resources were blocked by `robots.txt`:

- `/api/currency/rates`
- `/api/products?featured=true&limit=8`
- `/api/products?newArrival=true&limit=8`
- product detail and product review reads

The Railway `robots.txt` used `Disallow: /`, which prevented Google's Web Rendering Service from fetching data required by the React storefront.

The backend now allows only public, read-only rendering resources while keeping the API hostname and private routes out of search:

```txt
User-agent: *
Allow: /api/products
Allow: /api/products/
Disallow: /api/products/admin/
Allow: /api/currency/rates
Allow: /api/reviews/product/
Disallow: /
```

Public API responses retain `X-Robots-Tag: noindex, noarchive`, so JSON endpoints are not indexed as pages. Private endpoints retain `noindex, nofollow, noarchive`.

After Railway deployment, verify:

- `https://kesara-batik-production.up.railway.app/robots.txt`
- Search Console → URL Inspection → Test Live URL → View Tested Page → More Info

The public XHR resources should no longer say “Googlebot blocked by robots.txt”.
