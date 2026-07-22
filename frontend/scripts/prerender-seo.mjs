import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SITE_URL = 'https://www.kesarabathik.com'
const DEFAULT_API = 'https://kesara-batik-production.up.railway.app/api'
const here = path.dirname(fileURLToPath(import.meta.url))
const frontendDir = path.resolve(here, '..')
const distDir = path.join(frontendDir, 'dist')

function apiBaseUrl() {
  let value = process.env.VITE_API_URL || DEFAULT_API
  value = value.replace(/\/+$/, '')
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`
  if (!/\/api$/i.test(value)) value = `${value}/api`
  return value
}

const routes = [
  {
    path: '/',
    title: 'Batik Sri Lanka | Bathik Sarees, Shirts & Prices | Kesara Bathik',
    description: 'Shop authentic Sri Lankan batik and bathik sarees, shirts, sarongs, frocks, family kits and accessories. View current LKR prices and order online.',
    heading: 'Authentic Sri Lankan Batik and Bathik Clothing',
    intro: 'Kesara Bathik offers handcrafted Sri Lankan batik sarees, shirts, sarongs, frocks, family kits and accessories, with current prices for local and overseas customers.',
    category: '',
    priorityLinks: [
      ['/women', "Women's Batik"],
      ['/men', "Men's Batik"],
      ['/kids', "Kids' Batik"],
      ['/family-kits', 'Batik Family Kits'],
      ['/accessories', 'Batik Accessories'],
      ['/products', 'All Batik Products'],
    ],
  },
  {
    path: '/products',
    title: 'Batik Clothing Sri Lanka | Sarees, Shirts & Bathik Prices',
    description: 'Browse authentic Sri Lankan batik and bathik sarees, shirts, sarongs, frocks, family kits and accessories with current online prices.',
    heading: 'Sri Lankan Batik Clothing and Current Bathik Prices',
    intro: 'Browse the complete Kesara Bathik collection of handmade Sri Lankan batik clothing and accessories.',
    category: '',
  },
  {
    path: '/new-arrivals',
    title: 'New Sri Lankan Batik Clothing | Kesara Bathik',
    description: 'Discover the latest Sri Lankan batik sarees, shirts, sarongs, frocks, family kits and accessories newly added to Kesara Bathik.',
    heading: 'New Sri Lankan Batik Arrivals',
    intro: 'Explore recently added handcrafted batik and bathik clothing from Kesara Bathik.',
    newArrival: true,
  },
  {
    path: '/women',
    title: "Batik Sarees & Women's Bathik Prices in Sri Lanka | Kesara Bathik",
    description: 'Shop Sri Lankan batik sarees, Kandyan bathik designs, frocks, kaftans, tops and kurtha sets. View current LKR prices and order online.',
    heading: "Women's Batik Sarees and Bathik Clothing in Sri Lanka",
    intro: 'Shop handcrafted Sri Lankan batik sarees, Kandyan designs, frocks, kaftans, tops and kurtha sets with current local prices.',
    category: 'Women',
  },
  {
    path: '/men',
    title: "Men's Batik Shirts & Sarongs Sri Lanka | Kesara Bathik",
    description: 'Shop handcrafted men’s batik shirts, Sri Lankan sarongs and Avurudu kits. View bathik prices in Sri Lanka and order online worldwide.',
    heading: "Men's Batik Shirts, Sarongs and Avurudu Kits",
    intro: 'Discover Sri Lankan men’s batik shirts, traditional sarongs and coordinated Avurudu kits, handcrafted by Kesara Bathik.',
    category: 'Men',
  },
  {
    path: '/kids',
    title: 'Kids Batik Clothing Sri Lanka | Frocks, Sarees & Shirts',
    description: 'Shop colourful Sri Lankan batik clothing for kids, including frocks, lama sarees, shirts and sarongs. Current LKR prices shown online.',
    heading: "Kids' Batik Clothing in Sri Lanka",
    intro: 'Shop colourful handmade batik frocks, lama sarees, shirts and sarongs for children.',
    category: 'Kids',
  },
  {
    path: '/family-kits',
    title: 'Batik Family Kits Sri Lanka | Matching Bathik Outfits',
    description: 'Shop matching Sri Lankan batik family kits for Avurudu, weddings and celebrations. Coordinated bathik outfits with current online prices.',
    heading: 'Matching Sri Lankan Batik Family Kits',
    intro: 'Find coordinated handmade batik outfits for families, Avurudu celebrations, weddings and special occasions.',
    category: 'Family Kits',
  },
  {
    path: '/accessories',
    title: 'Batik Accessories Sri Lanka | Bags, Clutches & Jewellery',
    description: 'Shop handcrafted Sri Lankan batik bags, clutches, jewellery, slippers and hair accessories. View local prices and order online.',
    heading: 'Handcrafted Batik Accessories in Sri Lanka',
    intro: 'Browse Sri Lankan batik bags, clutches, jewellery, slippers and hair accessories made to complement your clothing.',
    category: 'Accessories',
  },
  {
    path: '/faq',
    title: 'Sri Lankan Batik FAQ | Prices, Orders & Shipping',
    description: 'Answers about Sri Lankan batik and bathik prices, online ordering, payment, shipping, sizing and returns from Kesara Bathik.',
    heading: 'Sri Lankan Batik and Bathik Frequently Asked Questions',
    intro: 'Learn about batik prices in Sri Lanka, online ordering, international delivery, payment options, sizing and returns.',
    category: '',
  },
]

const categoryAliases = {
  Men: ["men's", 'mens', 'men ', 'shirt', 'sarong', 'lungi', 'avurudu'],
  Women: ["women's", 'womens', 'women ', 'saree', 'kaftan', 'kurtha', 'frock', 'top'],
  Kids: ['kid', 'child', 'lama'],
  'Family Kits': ['family'],
  Accessories: ['bag', 'jewellery', 'jewelry', 'clutch', 'slipper', 'hair'],
}

function belongsToCategory(product, category) {
  if (!category) return true
  if (String(product.parentCategory || '').toLowerCase() === category.toLowerCase()) return true
  const searchable = [product.name, product.category, product.subcategory, ...(product.tags || [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return (categoryAliases[category] || []).some((term) => searchable.includes(term))
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function replaceMeta(html, attribute, key, value) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const expression = new RegExp(`<meta\\s+${attribute}=["']${escapedKey}["'][^>]*>`, 'i')
  const replacement = `<meta ${attribute}="${escapeHtml(key)}" content="${escapeHtml(value)}" />`
  return expression.test(html)
    ? html.replace(expression, replacement)
    : html.replace('</head>', `  ${replacement}\n</head>`)
}

function replaceTitle(html, title) {
  return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
}

function setCanonical(html, url) {
  const tag = `<link rel="canonical" href="${escapeHtml(url)}" />`
  const expression = /<link\s+rel=["']canonical["'][^>]*>/i
  return expression.test(html)
    ? html.replace(expression, tag)
    : html.replace('</head>', `  ${tag}\n</head>`)
}

function productPath(product) {
  return product?.slug ? `/products/${encodeURIComponent(product.slug)}` : '/products'
}

function staticSnapshot(route, products) {
  let selected = products
  if (route.category) selected = selected.filter((product) => belongsToCategory(product, route.category))
  if (route.newArrival) selected = selected.filter((product) => Boolean(product.newArrival))
  selected = selected.slice(0, 12)

  const links = route.priorityLinks || [
    ['/products', 'All Batik Products'],
    ['/women', "Women's Batik Sarees"],
    ['/men', "Men's Batik Shirts and Sarongs"],
    ['/kids', "Kids' Batik Clothing"],
    ['/family-kits', 'Batik Family Kits'],
    ['/accessories', 'Batik Accessories'],
  ]

  const productMarkup = selected.length
    ? `<section aria-labelledby="seo-products-heading">
        <h2 id="seo-products-heading">Available Batik Products</h2>
        <ul>${selected.map((product) => `<li><a href="${escapeHtml(productPath(product))}">${escapeHtml(product.name)}</a></li>`).join('')}</ul>
      </section>`
    : `<section aria-labelledby="seo-category-heading">
        <h2 id="seo-category-heading">Explore Kesara Bathik Collections</h2>
        <p>New handmade designs are added regularly. Browse the full collection and current prices online.</p>
      </section>`

  return `<main class="seo-snapshot" aria-label="${escapeHtml(route.heading)}">
    <div class="seo-snapshot__inner">
      <p class="seo-snapshot__eyebrow">Kesara Bathik · Handmade in Sri Lanka</p>
      <h1>${escapeHtml(route.heading)}</h1>
      <p>${escapeHtml(route.intro)}</p>
      <nav aria-label="Batik shopping categories"><ul>${links.map(([href, label]) => `<li><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></li>`).join('')}</ul></nav>
      ${productMarkup}
    </div>
  </main>`
}

function routeSchema(route, products) {
  let selected = products
  if (route.category) selected = selected.filter((product) => belongsToCategory(product, route.category))
  if (route.newArrival) selected = selected.filter((product) => Boolean(product.newArrival))

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': route.path === '/' ? 'WebPage' : 'CollectionPage',
        '@id': `${SITE_URL}${route.path === '/' ? '/' : route.path}#webpage`,
        url: `${SITE_URL}${route.path === '/' ? '/' : route.path}`,
        name: route.heading,
        description: route.description,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        inLanguage: 'en-LK',
      },
      {
        '@type': 'ItemList',
        name: `${route.heading} products`,
        numberOfItems: selected.length,
        itemListElement: selected.slice(0, 12).map((product, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: product.name,
          url: `${SITE_URL}${productPath(product)}`,
        })),
      },
    ],
  }
}

async function fetchProducts() {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const response = await fetch(`${apiBaseUrl()}/products?limit=1000&sort=newest`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) throw new Error(`API responded ${response.status}`)
    const body = await response.json()
    return Array.isArray(body.products) ? body.products : []
  } catch (error) {
    console.warn(`[prerender] Product fetch skipped: ${error.message}`)
    return []
  } finally {
    clearTimeout(timeout)
  }
}

const baseHtml = await readFile(path.join(distDir, 'index.html'), 'utf8')
const products = await fetchProducts()

const snapshotStyle = `<style id="seo-snapshot-style">
.seo-snapshot{min-height:70vh;background:#f8f4ed;color:#21140c;font-family:Arial,sans-serif;padding:64px 24px}.seo-snapshot__inner{max-width:1120px;margin:0 auto}.seo-snapshot__eyebrow{color:#a66f18;font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}.seo-snapshot h1{font-family:Georgia,serif;font-size:40px;line-height:1.15;margin:14px 0}.seo-snapshot h2{font-family:Georgia,serif;font-size:26px;margin:34px 0 12px}.seo-snapshot p{max-width:800px;line-height:1.7;color:#5b5148}.seo-snapshot ul{display:flex;flex-wrap:wrap;gap:12px 22px;padding:0;list-style:none}.seo-snapshot a{color:#8b5c10;font-weight:700;text-decoration:none}.seo-snapshot a:hover{text-decoration:underline}@media(max-width:640px){.seo-snapshot{padding:40px 18px}.seo-snapshot h1{font-size:31px}}
</style>`

for (const route of routes) {
  const canonicalUrl = `${SITE_URL}${route.path === '/' ? '/' : route.path}`
  let html = replaceTitle(baseHtml, route.title)
  html = replaceMeta(html, 'name', 'description', route.description)
  html = replaceMeta(html, 'name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')
  html = replaceMeta(html, 'name', 'googlebot', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')
  html = replaceMeta(html, 'property', 'og:title', route.title)
  html = replaceMeta(html, 'property', 'og:description', route.description)
  html = replaceMeta(html, 'property', 'og:url', canonicalUrl)
  html = replaceMeta(html, 'name', 'twitter:title', route.title)
  html = replaceMeta(html, 'name', 'twitter:description', route.description)
  html = setCanonical(html, canonicalUrl)
  html = html.replace('</head>', `  ${snapshotStyle}\n  <script type="application/ld+json">${JSON.stringify(routeSchema(route, products))}</script>\n</head>`)
  html = html.replace('<div id="root"></div>', `<div id="root" data-prerendered="true">${staticSnapshot(route, products)}</div>`)

  const routeFile = route.path === '/'
    ? 'index.html'
    : `seo-${route.path.slice(1).replaceAll('/', '-')}.html`
  const output = path.join(distDir, routeFile)
  await mkdir(path.dirname(output), { recursive: true })
  await writeFile(output, html, 'utf8')
}

console.log(`[prerender] Wrote ${routes.length} route snapshots using ${products.length} products`)
