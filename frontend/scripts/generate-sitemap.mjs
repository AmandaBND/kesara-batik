import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const SITE_URL = 'https://www.kesarabathik.com'
const DEFAULT_API = 'https://kesara-batik-production.up.railway.app/api'
const SEO_LAST_UPDATED = '2026-07-30'
const here = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(here, '..', 'public')

const corePages = [
  '/',
  '/products',
  '/new-arrivals',
  '/women',
  '/men',
  '/kids',
  '/family-kits',
  '/accessories',
  '/faq',
]

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

function validDate(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

async function readFallbackProducts() {
  try {
    return JSON.parse(await readFile(path.join(here, 'product-fallback.json'), 'utf8'))
  } catch {
    return []
  }
}

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
    const products = Array.isArray(data.products) ? data.products : []
    if (!products.length) throw new Error('API returned no products')
    return { products, source: 'API' }
  } catch (error) {
    const products = await readFallbackProducts()
    console.warn(`[sitemap] Product API unavailable (${error.message}); using ${products.length} stable fallback products`)
    return { products, source: 'fallback' }
  } finally {
    clearTimeout(timeout)
  }
}

const { products, source } = await fetchProducts()
const rows = [
  ...corePages.map((route) => ({
    loc: `${SITE_URL}${route}`,
    lastmod: SEO_LAST_UPDATED,
  })),
  ...products
    .filter((product) => product?.slug && product?.isActive !== false)
    .map((product) => ({
      loc: `${SITE_URL}/products/${encodeURIComponent(product.slug)}`,
      lastmod: validDate(product.updatedAt),
    })),
]

const uniqueRows = [...new Map(rows.map((row) => [row.loc, row])).values()]
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueRows.map((row) => `  <url>
    <loc>${escapeXml(row.loc)}</loc>${row.lastmod ? `
    <lastmod>${escapeXml(row.lastmod)}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>
`

await writeFile(path.join(publicDir, 'sitemap.xml'), xml, 'utf8')
console.log(`[sitemap] Wrote ${uniqueRows.length} canonical URLs using ${source} product data`)
