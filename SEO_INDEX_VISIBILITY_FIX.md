# Google index visibility stability fix

This build adds route-specific static HTML snapshots for the homepage and public collection pages. The React application still becomes fully interactive after JavaScript loads.

## Why

Search Console's live test only confirms that a page is eligible for indexing. It does not guarantee that Google will select or rank the page for a particular query. The prior deployment also relied on client-side React for route-specific metadata and content.

## Included

- Static build snapshots for `/`, `/products`, `/new-arrivals`, `/women`, `/men`, `/kids`, `/family-kits`, `/accessories`, and `/faq`
- Unique title, description, canonical URL, JSON-LD, heading, category links, and product links in the initial HTML
- Static route files served directly by Vercel
- SPA rewrites retained only for dynamic/private routes
- Homepage canonical added to source `index.html`
- Sitemap generation retained

## After deployment

1. Confirm `view-source:https://www.kesarabathik.com/` contains the homepage title, canonical, H1, category links, and product links.
2. Confirm `view-source:https://www.kesarabathik.com/men` contains the men's title and H1.
3. Submit `https://www.kesarabathik.com/sitemap.xml` in Search Console.
4. Inspect the homepage using the Google Index tab and then request indexing once.
5. Use Search Console Performance to review actual queries, impressions, positions, and clicks.
