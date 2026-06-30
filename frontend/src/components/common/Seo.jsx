import { Helmet } from 'react-helmet-async'

// Single source of truth for the canonical domain.
// Everything (sitemap.xml, robots.txt, index.html) should match this.
export const SITE_URL = 'https://www.kesarabathik.com'

/**
 * Drop this on every page. It sets the title, description, a canonical
 * link, and matching Open Graph / Twitter tags so each route has its own
 * unique, correct metadata instead of inheriting the homepage's.
 *
 * @param {string} title - Full page title (include "| Kesara Bathik")
 * @param {string} [description] - 150-160 char meta description
 * @param {string} [path] - Route path starting with "/", e.g. "/products/blue-sarong"
 * @param {string} [image] - Absolute image URL for social sharing; defaults to the site OG image
 */
export default function Seo({ title, description, path = '/', image }) {
  const url = `${SITE_URL}${path === '/' ? '/' : path.replace(/\/$/, '')}`
  const ogImage = image || `${SITE_URL}/og-image.jpg`

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={url} />

      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  )
}
