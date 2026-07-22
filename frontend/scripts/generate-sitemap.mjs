import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const SITE_URL = 'https://www.kesarabathik.com'
const DEFAULT_API = 'https://kesara-batik-production.up.railway.app/api'
const buildDate = new Date().toISOString()

function apiBaseUrl() {
  let value = process.env.VITE_API_URL || DEFAULT_API
  value = value.replace(/\/+$/, '')
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`
  if (!/\/api$/i.test(value)) value = `${value}/api`
  return value
}

function escapeXml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

const corePages = [
  ['/', 'daily', '1.0'],
  ['/products', 'daily', '0.9'],
  ['/new-arrivals', 'daily', '0.9'],
  ['/women', 'weekly', '0.9'],
  ['/men', 'weekly', '0.9'],
  ['/kids', 'weekly', '0.8'],
  ['/family-kits', 'weekly', '0.8'],
  ['/accessories', 'weekly', '0.8'],
  ['/faq', 'monthly', '0.6'],
]

async function fetchProducts() {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20000)
  try {
    const response = await fetch(`${apiBaseUrl()}/products?limit=1000&sort=newest`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) throw new Error(`API responded ${response.status}`)
    const data = await response.json()
    return Array.isArray(data.products) ? data.products : []
  } catch (error) {
    console.warn(`[sitemap] Product fetch skipped: ${error.message}`)
    return []
  } finally {
    clearTimeout(timeout)
  }
}

const products = await fetchProducts()
const rows = [
  ...corePages.map(([route, changefreq, priority]) => ({
    loc: `${SITE_URL}${route}`,
    lastmod: buildDate,
    changefreq,
    priority,
  })),
  ...products
    .filter((product) => product?.slug && product?.isActive !== false)
    .map((product) => ({
      loc: `${SITE_URL}/products/${encodeURIComponent(product.slug)}`,
      lastmod: product.updatedAt ? new Date(product.updatedAt).toISOString() : buildDate,
      changefreq: 'weekly',
      priority: '0.7',
    })),
]

const uniqueRows = [...new Map(rows.map((row) => [row.loc, row])).values()]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueRows.map((row) => `  <url>
    <loc>${escapeXml(row.loc)}</loc>
    <lastmod>${escapeXml(row.lastmod)}</lastmod>
    <changefreq>${row.changefreq}</changefreq>
    <priority>${row.priority}</priority>
  </url>`).join('\n')}
</urlset>
`

const here = path.dirname(fileURLToPath(import.meta.url))
await writeFile(path.join(here, '..', 'public', 'sitemap.xml'), xml, 'utf8')
console.log(`[sitemap] Wrote ${uniqueRows.length} canonical URLs (${products.length} products fetched)`)
