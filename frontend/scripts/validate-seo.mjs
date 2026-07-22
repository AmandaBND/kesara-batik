import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(here, '..', 'dist')
const expected = [
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

const failures = []
for (const [file, canonical] of expected) {
  let html
  try {
    html = await readFile(path.join(distDir, file), 'utf8')
  } catch {
    failures.push(`${file}: missing`)
    continue
  }

  if (!html.includes(`<link rel="canonical" href="${canonical}"`)) failures.push(`${file}: canonical missing or incorrect`)
  if (!/<h1>[^<]{8,}<\/h1>/i.test(html)) failures.push(`${file}: meaningful H1 missing`)
  if (!html.includes('name="robots" content="index, follow')) failures.push(`${file}: index robots directive missing`)
  if (html.includes('No products found')) failures.push(`${file}: contains soft-404 style text`)
  if (!html.includes('application/ld+json')) failures.push(`${file}: structured data missing`)
}

const sitemap = await readFile(path.join(distDir, 'sitemap.xml'), 'utf8').catch(() => '')
if (!sitemap.startsWith('<?xml')) failures.push('sitemap.xml: missing or not XML')
for (const [, canonical] of expected) {
  if (!sitemap.includes(`<loc>${canonical}</loc>`)) failures.push(`sitemap.xml: missing ${canonical}`)
}

const robots = await readFile(path.join(distDir, 'robots.txt'), 'utf8').catch(() => '')
if (!robots.includes('Sitemap: https://www.kesarabathik.com/sitemap.xml')) failures.push('robots.txt: sitemap declaration missing')

if (failures.length) {
  console.error('[seo-validate] Failed:')
  failures.forEach((failure) => console.error(` - ${failure}`))
  process.exit(1)
}

console.log(`[seo-validate] Passed ${expected.length} prerendered routes, sitemap and robots checks`)
