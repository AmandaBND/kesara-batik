import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.join(here, '..', 'src')
const failures = []

const [homeSource, layoutSource, mainSource] = await Promise.all([
  readFile(path.join(srcDir, 'pages', 'shop', 'HomePage.jsx'), 'utf8').catch(() => ''),
  readFile(path.join(srcDir, 'components', 'common', 'ShopLayout.jsx'), 'utf8').catch(() => ''),
  readFile(path.join(srcDir, 'main.jsx'), 'utf8').catch(() => ''),
])

function classValue(tag) {
  return tag.match(/className=["']([^"']*)["']/)?.[1] || ''
}

function markerTag(source, marker) {
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return source.match(new RegExp(`<[^>]+data-seo-brand=["']${escaped}["'][^>]*>`, 'i'))?.[0] || ''
}

function checkVisibleMarker(source, marker, label) {
  const tag = markerTag(source, marker)
  if (!tag) {
    failures.push(`${label}: data-seo-brand="${marker}" marker is missing`)
    return
  }

  const classes = classValue(tag).split(/\s+/)
  const hiddenClasses = new Set(['hidden', 'invisible', 'sr-only', 'opacity-0'])
  const blocked = classes.filter((name) => hiddenClasses.has(name))
  if (blocked.length) failures.push(`${label}: brand marker is hidden by ${blocked.join(', ')}`)
}

const renderedH1 = homeSource.match(/<h1[\s\S]*?<\/h1>/)?.[0] || ''
const renderedH1WithoutComments = renderedH1.replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
if (!renderedH1) {
  failures.push('HomePage.jsx: no rendered H1 was found')
} else {
  if (!renderedH1.includes('data-seo-brand="hero"')) {
    failures.push('HomePage.jsx: H1 is missing the visible hero brand marker')
  }
  if (!/>Kesara Bathik<\/span>/.test(renderedH1)) {
    failures.push('HomePage.jsx: H1 does not contain exact visible text "Kesara Bathik"')
  }
  if (/\bsr-only\b/.test(renderedH1WithoutComments)) {
    failures.push('HomePage.jsx: brand H1 still relies on sr-only text')
  }
  if (/aria-hidden=["']true["']/.test(renderedH1WithoutComments)) {
    failures.push('HomePage.jsx: brand H1 contains aria-hidden title content')
  }
  if (/<img[^>]*\balt=["']["']/.test(renderedH1)) {
    failures.push('HomePage.jsx: Sinhala title image has empty alt text')
  }
  if (!/alt=["']කේසර බතික්\s*[–-]\s*Kesara Bathik["']/.test(renderedH1)) {
    failures.push('HomePage.jsx: Sinhala title image alt must connect කේසර බතික් with Kesara Bathik')
  }
}

checkVisibleMarker(homeSource, 'hero', 'HomePage.jsx')
checkVisibleMarker(layoutSource, 'header', 'ShopLayout.jsx')
checkVisibleMarker(layoutSource, 'footer', 'ShopLayout.jsx')

if (!/Kesara Bathik makes authentic Sri Lankan batik and bathik clothing/.test(homeSource)) {
  failures.push('HomePage.jsx: visible brand description is missing from the hero')
}

if (/data-seo-brand=["']header["'][^>]*className=["'][^"']*\bhidden\b/.test(layoutSource)) {
  failures.push('ShopLayout.jsx: mobile header brand is hidden')
}

if (mainSource.includes('rootElement.replaceChildren()')) {
  console.log('[brand-visibility] Prerender snapshot is cleared before React mounts; validating React-visible brand signals')
}

if (failures.length) {
  console.error('[brand-visibility] Failed:')
  failures.forEach((failure) => console.error(` - ${failure}`))
  process.exit(1)
}

console.log('[brand-visibility] Passed hero H1, Sinhala alt text, mobile header, footer and visible brand-copy checks')
