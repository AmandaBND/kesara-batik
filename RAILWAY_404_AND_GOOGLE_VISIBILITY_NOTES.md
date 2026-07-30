# Railway 404 logs and Google visibility

## What the Railway 404 entries mean

The storefront is hosted on Vercel. Railway hosts only the API. Requests such as `/h5/`, `/wap/`, `/zz.php`, `/config.json`, `/index/login`, and unrelated JavaScript/CSS paths are automated internet scans looking for other products or vulnerable software. Returning a real `404 Route not found` is the correct and secure response.

These Railway API 404 responses do not affect indexing or ranking of `https://www.kesarabathik.com/`.

## Backend improvements in this project

The backend now provides successful responses for legitimate service checks:

- `/`
- `/api`
- `/api/health`
- `/health`
- `/health-check`
- `/healthz`
- `/favicon.ico`

All Railway API responses include `X-Robots-Tag: noindex, nofollow, noarchive`, and the Railway `/robots.txt` blocks the API hostname from search indexes.

Known high-volume scanner paths still receive 404 responses, but their repetitive production access-log entries are skipped so Railway deploy logs remain useful.

## Railway health-check setting

Set the Railway service health-check path to:

`/api/health`

## Google status

The public homepage, sitemap, canonical tags, robots directives and static SEO snapshots remain in the frontend. This backend logging change does not modify the storefront SEO.
