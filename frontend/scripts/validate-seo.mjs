import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(here, '..', 'dist')
const indexable = [
  ['index.html', 'https://www.kesarabathik.com/'],
  ['products.html', 'https://www.kesarabathik.com/products'],
  ['new-arrivals.html', 'https://www.kesarabathik.com/new-arrivals'],
  ['women.html', 'https://www.kesarabathik.com/women'],
  ['men.html', 'https://www.kesarabathik.com/men'],
  ['kids.html', 'https://www.kesarabathik.com/kids'],
  ['family-kits.html', 'https://www.kesarabathik.com/family-kits'],
  ['accessories.html', 'https://www.kesarabathik.com/accessories'],
  ['faq.html', 'https://www.kesarabathik.com/faq'],
]
const noindexPages = [
  ['privacy-policy.html', 'https://www.kesarabathik.com/privacy-policy'],
  ['return-refund-policy.html', 'https://www.kesarabathik.com/return-refund-policy'],
  ['terms-and-conditions.html', 'https://www.kesarabathik.com/terms-and-conditions'],
]

const failures = []

async function validatePage(file, canonical, shouldIndex) {
  let html
  try {
    html = await readFile(path.join(distDir, file), 'utf8')
  } catch {
    failures.push(`${file}: missing`)
    return
  }

  if (!html.includes(`<link rel="canonical" href="${canonical}"`)) failures.push(`${file}: canonical missing or incorrect`)
  if (!/<h1>[^<]{8,}<\/h1>/i.test(html)) failures.push(`${file}: meaningful H1 missing`)
  if (shouldIndex && !html.includes('name="robots" content="index, follow')) failures.push(`${file}: index robots directive missing`)
  if (!shouldIndex && !html.includes('name="robots" content="noindex, follow, noarchive')) failures.push(`${file}: noindex robots directive missing`)
  if (html.includes('No products found')) failures.push(`${file}: contains soft-404 style text`)
  if (!html.includes('application/ld+json')) failures.push(`${file}: structured data missing`)
}

for (const [file, canonical] of indexable) await validatePage(file, canonical, true)
for (const [file, canonical] of noindexPages) await validatePage(file, canonical, false)

const fallbackProducts = JSON.parse(await readFile(path.join(here, 'product-fallback.json'), 'utf8'))
for (const product of fallbackProducts) {
  const file = path.join('products', `${product.slug}.html`)
  const canonical = `https://www.kesarabathik.com/products/${product.slug}`
  await validatePage(file, canonical, true)
  const html = await readFile(path.join(distDir, file), 'utf8').catch(() => '')
  if (html && !html.includes(product.name.replaceAll('&', '&amp;'))) failures.push(`${file}: product-specific title or H1 missing`)
}

const sitemap = await readFile(path.join(distDir, 'sitemap.xml'), 'utf8').catch(() => '')
if (!sitemap.startsWith('<?xml')) failures.push('sitemap.xml: missing or not XML')
for (const [, canonical] of indexable) {
  if (!sitemap.includes(`<loc>${canonical}</loc>`)) failures.push(`sitemap.xml: missing ${canonical}`)
}
for (const product of fallbackProducts) {
  const canonical = `https://www.kesarabathik.com/products/${product.slug}`
  if (!sitemap.includes(`<loc>${canonical}</loc>`)) failures.push(`sitemap.xml: missing fallback product ${canonical}`)
}
if (sitemap.includes('<changefreq>') || sitemap.includes('<priority>')) failures.push('sitemap.xml: contains ignored changefreq or priority fields')

const robots = await readFile(path.join(distDir, 'robots.txt'), 'utf8').catch(() => '')
if (!robots.includes('Sitemap: https://www.kesarabathik.com/sitemap.xml')) failures.push('robots.txt: sitemap declaration missing')

const home = await readFile(path.join(distDir, 'index.html'), 'utf8').catch(() => '')
if (!home.includes('<title>Kesara Bathik | Authentic Sri Lankan Batik &amp; Bathik Clothing</title>')) failures.push('index.html: brand-first title missing')
if (!home.includes('Kesara Bathik – Authentic Sri Lankan Batik and Bathik Clothing')) failures.push('index.html: exact brand H1 missing')

// The checks above only inspect the prerendered snapshot. main.jsx calls
// rootElement.replaceChildren() before React mounts, so Google's renderer
// throws that snapshot away and indexes the React output instead. These guards
// make sure the React output still carries the brand as visible text.
const srcDir = path.join(here, '..', 'src')
const homeSource = await readFile(path.join(srcDir, 'pages', 'shop', 'HomePage.jsx'), 'utf8').catch(() => '')
const layoutSource = await readFile(path.join(srcDir, 'components', 'common', 'ShopLayout.jsx'), 'utf8').catch(() => '')

const renderedH1 = homeSource.match(/<h1[\s\S]*?<\/h1>/)?.[0] ?? ''
if (!renderedH1) {
  failures.push('HomePage.jsx: no H1 found in the rendered homepage')
} else {
  const visibleH1 = renderedH1
    .replace(/<span[^>]*\bsr-only\b[\s\S]*?<\/span>/g, '')
    .replace(/<span[^>]*aria-hidden="true"[\s\S]*?<\/span>/g, '')
  if (!/Kesara Bathik/.test(visibleH1)) {
    failures.push('HomePage.jsx: rendered H1 has no visible "Kesara Bathik" text (sr-only or aria-hidden does not count)')
  }
  if (!renderedH1.includes('data-seo-brand="hero"')) {
    failures.push('HomePage.jsx: rendered H1 is missing the visible brand regression marker')
  }
  if (/<img[^>]*\balt=""/.test(renderedH1)) {
    failures.push('HomePage.jsx: rendered H1 contains an image with empty alt text')
  }
  if (!/alt="කේසර බතික් – Kesara Bathik"/.test(renderedH1)) {
    failures.push('HomePage.jsx: Sinhala title image does not connect the Sinhala and Latin brand names')
  }
}

if (/className="hidden sm:block"[\s\S]{0,400}KESARA BATHIK/.test(layoutSource)) {
  failures.push('ShopLayout.jsx: header brand name is hidden at mobile width, which is the width Googlebot renders')
}

if (!layoutSource.includes('data-seo-brand="header"')) {
  failures.push('ShopLayout.jsx: mobile-visible header brand regression marker is missing')
}
if (!layoutSource.includes('data-seo-brand="footer"')) {
  failures.push('ShopLayout.jsx: footer brand regression marker is missing')
}

if (failures.length) {
  console.error('[seo-validate] Failed:')
  failures.forEach((failure) => console.error(` - ${failure}`))
  process.exit(1)
}

console.log(`[seo-validate] Passed ${indexable.length} indexable routes, ${noindexPages.length} policy routes, ${fallbackProducts.length} product routes, sitemap and robots checks`)
