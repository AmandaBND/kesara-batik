# Kesara Bathik rendered brand visibility fix

This release fixes a mobile-first brand signal regression on the homepage.

## What changed

- The hero H1 contains the exact visible text `Kesara Bathik` after React renders.
- The Sinhala title image uses descriptive alt text: `කේසර බතික් – Kesara Bathik`.
- The Latin brand name remains visible in the header at mobile widths.
- The footer retains a visible brand signal.
- Build-time validation now checks the React source, not only the prerendered HTML snapshot.
- The build fails if the visible H1, mobile header brand, footer brand, or Sinhala alt text disappears.

## Correct Search Console verification

After deployment use:

1. URL Inspection → Test Live URL.
2. View Tested Page → HTML.
3. Confirm the rendered H1 contains `Kesara Bathik`.
4. Confirm the mobile header contains `KESARA BATHIK`.
5. Confirm the canonical is `https://www.kesarabathik.com/`.

`view-source:` only shows the initial prerendered response and does not prove what remains after JavaScript runs.

## Domain checks outside source code

In Vercel Domains, set `www.kesarabathik.com` as the primary domain and confirm these redirect permanently to it:

- `http://kesarabathik.com/`
- `https://kesarabathik.com/`
- `http://www.kesarabathik.com/`

Also check Search Console → Security & Manual Actions → Manual actions.
