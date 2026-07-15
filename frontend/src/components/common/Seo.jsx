import { Helmet } from 'react-helmet-async'

export const SITE_URL = 'https://www.kesarabathik.com'

const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`

function normalizePath(path = '/') {
  const withoutQuery = String(path).split('?')[0].split('#')[0]
  if (!withoutQuery || withoutQuery === '/') return '/'
  return `/${withoutQuery.replace(/^\/+|\/+$/g, '')}`
}

function normalizeKeywords(keywords) {
  if (!keywords) return ''
  if (Array.isArray(keywords)) return keywords.filter(Boolean).join(', ')
  return String(keywords)
}

/**
 * Route-level SEO metadata.
 *
 * Supports canonical URLs, crawler directives, social metadata, keyword
 * hints for non-Google engines and JSON-LD structured data.
 */
export default function Seo({
  title,
  description,
  path = '/',
  image,
  imageAlt = 'Kesara Bathik - authentic Sri Lankan batik fashion',
  keywords,
  type = 'website',
  noindex = false,
  jsonLd,
}) {
  const canonicalPath = normalizePath(path)
  const url = `${SITE_URL}${canonicalPath}`
  const ogImage = image || DEFAULT_IMAGE
  const keywordContent = normalizeKeywords(keywords)
  const robots = noindex
    ? 'noindex, follow, noarchive'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
  const schemas = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []

  return (
    <Helmet>
      <html lang="en-LK" />
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {keywordContent && <meta name="keywords" content={keywordContent} />}
      <meta name="robots" content={robots} />
      <meta name="googlebot" content={robots} />
      <meta name="bingbot" content={robots} />
      <meta name="author" content="Kesara Bathik" />
      <link rel="canonical" href={url} />

      <meta property="og:site_name" content="Kesara Bathik" />
      <meta property="og:locale" content="en_LK" />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:type" content={type} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={imageAlt} />

      {schemas.map((schema, index) => (
        <script key={`seo-jsonld-${index}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  )
}
