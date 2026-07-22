import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { FiArrowRight, FiFilter, FiX } from 'react-icons/fi'
import ProductCard from '../../components/shop/ProductCard'
import Seo from '../../components/common/Seo'
import api from '../../utils/api'

const SUBCATEGORIES = {
  Women: ["Women's Saree", "Women's Lungi", 'Batik Kandyan designs', 'Batik Frocks', 'Batik Tops & Skirts', 'Batik Tops & Pants', 'Batik Kurtha Sets', 'Batik Kaftan'],
  Men: ["Men's Avurudu Kits", "Men's Sarong", 'Batik Shirts'],
  Kids: ["Kid's Focks", "Kid's Lama Saree", 'Kids Shirts and Sarong'],
  'Family Kits': [],
  Accessories: ['Bags', 'Jewellery', 'Clutches', 'Slippers', 'Hair Accessories'],
}

const PATH_CATEGORY_MAP = {
  '/women': 'Women',
  '/men': 'Men',
  '/kids': 'Kids',
  '/family-kits': 'Family Kits',
  '/accessories': 'Accessories',
}

const CATEGORY_PATHS = {
  Women: '/women',
  Men: '/men',
  Kids: '/kids',
  'Family Kits': '/family-kits',
  Accessories: '/accessories',
}

const NEW_ARRIVALS_PATH = '/new-arrivals'

const CATEGORY_SEO = {
  Women: {
    title: "Batik Sarees & Women's Bathik Prices in Sri Lanka | Kesara Bathik",
    description: 'Shop Sri Lankan batik sarees, Kandyan bathik designs, frocks, kaftans, tops and kurtha sets. View current LKR prices and order online.',
    keywords: ['batik sarees Sri Lanka', 'bathik saree price Sri Lanka', 'Kandyan batik saree', 'batik frocks Sri Lanka', 'women bathik Sri Lanka'],
  },
  Men: {
    title: "Men's Batik Shirts & Sarongs Sri Lanka | Kesara Bathik",
    description: 'Shop handcrafted men’s batik shirts, Sri Lankan sarongs and Avurudu kits. View bathik prices in Sri Lanka and order online worldwide.',
    keywords: ['batik shirts Sri Lanka', 'men bathik shirts', 'batik sarong Sri Lanka', 'Avurudu batik kits', 'Sri Lankan batik men'],
  },
  Kids: {
    title: 'Kids Batik Clothing Sri Lanka | Frocks, Sarees & Shirts',
    description: 'Shop colourful Sri Lankan batik clothing for kids, including frocks, lama sarees, shirts and sarongs. Current LKR prices shown online.',
    keywords: ['kids batik Sri Lanka', 'bathik frocks for kids', 'kids batik shirts', 'lama saree batik', 'children bathik clothing'],
  },
  'Family Kits': {
    title: 'Batik Family Kits Sri Lanka | Matching Bathik Outfits',
    description: 'Shop matching Sri Lankan batik family kits for Avurudu, weddings and celebrations. Coordinated bathik outfits with current online prices.',
    keywords: ['batik family kits Sri Lanka', 'matching bathik clothes', 'Avurudu family batik', 'Sri Lankan family outfits'],
  },
  Accessories: {
    title: 'Batik Accessories Sri Lanka | Bags, Clutches & Jewellery',
    description: 'Shop handcrafted Sri Lankan batik bags, clutches, jewellery, slippers and hair accessories. View local prices and order online.',
    keywords: ['batik accessories Sri Lanka', 'batik bags Sri Lanka', 'bathik clutch', 'Sri Lankan handmade accessories'],
  },
}

const CATEGORY_GUIDES = {
  Women: {
    heading: "Women's Sri Lankan Batik and Bathik Collection",
    paragraphs: [
      'Explore handcrafted Sri Lankan batik sarees and women’s clothing made with expressive colour combinations, wax-resist patterns and traditional design influences. Kesara Bathik brings together sarees, Kandyan styles, frocks, kaftans, kurtha sets, tops and coordinated outfits in one collection.',
      'Product pages show the current price, available colours, sizes and stock information. Sri Lankan visitors see the separately maintained LKR price, while overseas customers can view supported international currencies through the website’s CAD-based pricing system.',
      'Use the product photographs and descriptions to compare designs before ordering. For sizing or availability questions, contact Kesara Bathik through the support options shown on the website.',
    ],
    highlights: ['Batik sarees and Kandyan-inspired designs', 'Frocks, kaftans, tops and kurtha sets', 'Current online prices and availability'],
    faqs: [
      ['Where can I view bathik saree prices in Sri Lanka?', 'Open any women’s product page to see its current LKR price, images, available options and stock information.'],
      ['Can overseas customers order Sri Lankan batik sarees?', 'Yes. Overseas customers can browse supported currencies and complete delivery details during checkout.'],
    ],
  },
  Men: {
    heading: "Men's Batik Shirts, Sarongs and Avurudu Clothing",
    paragraphs: [
      'The men’s collection is dedicated to Sri Lankan batik shirts, traditional sarongs and coordinated Avurudu clothing. These pages help shoppers find men’s bathik designs without mixing them with unrelated women’s or children’s categories.',
      'Each available item includes its own product photographs, description, price and stock information. Older products that were saved only under categories such as Batik Shirts or Men’s Sarong are also included in this collection, even when their parent-category field was not previously completed.',
      'When a particular design is temporarily unavailable, this page remains a useful men’s batik guide with links to the full shop and other current handcrafted collections instead of behaving like a missing page.',
    ],
    highlights: ['Handcrafted men’s batik shirts', 'Sri Lankan sarongs and Avurudu kits', 'Local and overseas online ordering'],
    faqs: [
      ['What men’s batik products are listed here?', 'The category can include batik shirts, men’s sarongs and coordinated Avurudu kits that are active in the store.'],
      ['How can I check the latest bathik price?', 'Open the individual product page because prices, variants and availability may differ by design.'],
    ],
  },
  Kids: {
    heading: "Kids' Batik Clothing Made in Sri Lanka",
    paragraphs: [
      'Browse colourful Sri Lankan batik clothing for children, including frocks, lama sarees, shirts and sarong sets. The collection groups children’s products under one clean URL so families and search engines can reach the correct category directly.',
      'Individual product pages provide the current price, images and available options. The collection is updated as new kids’ bathik designs become active in the online store.',
      'Parents can compare the available designs and use the website support details for questions about sizing, stock or delivery before placing an order.',
    ],
    highlights: ['Batik frocks and lama sarees', 'Kids’ shirts and sarong sets', 'Current prices and product availability'],
    faqs: [
      ['Are prices shown in LKR for Sri Lankan visitors?', 'Yes. Sri Lankan visitors see the product’s separately maintained LKR price.'],
      ['Are new kids’ designs added to this page?', 'Active kids’ products are automatically listed here when they are added to the store.'],
    ],
  },
  'Family Kits': {
    heading: 'Matching Sri Lankan Batik Family Kits',
    paragraphs: [
      'Discover coordinated Sri Lankan batik outfits for families and special occasions. Family kits bring related colours and patterns together so family members can choose a consistent bathik look for celebrations and photographs.',
      'Available sets appear with their current product information, pricing and stock. Because family collections can vary by design and availability, check the individual product page for the exact items and options included.',
      'The clean family-kits page also links to women’s, men’s and kids’ collections, making it easier to compare separate pieces when a complete set is not currently listed.',
    ],
    highlights: ['Coordinated batik colours and patterns', 'Family clothing for celebrations', 'Links to women’s, men’s and kids’ collections'],
    faqs: [
      ['What is a batik family kit?', 'It is a coordinated group of batik outfits or pieces designed around a related colour and pattern theme.'],
      ['Where can I confirm what a set includes?', 'The individual product page contains the latest description, images, options and price.'],
    ],
  },
  Accessories: {
    heading: 'Handcrafted Batik Accessories in Sri Lanka',
    paragraphs: [
      'Complete a Sri Lankan batik outfit with handcrafted accessories such as bags, clutches, jewellery, slippers and hair accessories. This category keeps accessory products separate from clothing while connecting them to the wider Kesara Bathik collection.',
      'Each active product page shows its own photographs, description, price and stock information. Designs may use different fabrics, colours and decorative details, so review the individual listing before ordering.',
      'Accessories can be explored alongside women’s, men’s, kids’ and family categories through the internal links on this page.',
    ],
    highlights: ['Batik bags and clutches', 'Jewellery, slippers and hair accessories', 'Product-specific prices and availability'],
    faqs: [
      ['Which batik accessories are available?', 'Active products may include bags, clutches, jewellery, slippers and hair accessories.'],
      ['Can I order accessories with clothing?', 'Available products can be added to the same shopping cart before checkout.'],
    ],
  },
}

const DEFAULT_PRODUCTS_SEO = {
  title: 'Batik Clothing Sri Lanka | Sarees, Shirts & Bathik Prices',
  description: 'Browse authentic Sri Lankan batik and bathik sarees, shirts, sarongs, frocks, family kits and accessories with current online prices.',
  keywords: ['Batik Sri Lanka', 'Bathik Sri Lanka', 'bathik price in Sri Lanka', 'batik clothing online', 'Sri Lankan batik shop'],
}

const NEW_ARRIVALS_SEO = {
  title: 'New Sri Lankan Batik Clothing | Kesara Bathik',
  description: 'Discover the latest Sri Lankan batik sarees, shirts, sarongs, frocks, family kits and accessories newly added to Kesara Bathik.',
  keywords: ['new batik designs Sri Lanka', 'latest bathik sarees', 'new batik shirts', 'Sri Lankan batik new arrivals'],
}

export default function ProductsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [relatedProducts, setRelatedProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [sort, setSort] = useState('newest')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })

  const pathCategory = PATH_CATEGORY_MAP[location.pathname]
  const isNewArrivalsPath = location.pathname === NEW_ARRIVALS_PATH
  const category = params.get('category') || ''
  const parentCategory = params.get('parentCategory') || pathCategory || ''
  const search = params.get('search') || ''
  const newArrival = params.get('newArrival') || (isNewArrivalsPath ? 'true' : '')
  const featured = params.get('featured') || ''
  const isCanonicalCategoryPage = Boolean(pathCategory)

  useEffect(() => {
    setPage(1)
  }, [category, parentCategory, search, sort])

  useEffect(() => {
    let cancelled = false

    const fetchProducts = async () => {
      setLoading(true)
      setLoadError(false)
      setRelatedProducts([])

      try {
        const query = new URLSearchParams({
          page,
          limit: 12,
          sort,
          ...(category && { category }),
          ...(parentCategory && { parentCategory }),
          ...(search && { search }),
          ...(newArrival && { newArrival }),
          ...(featured && { featured }),
          ...(priceRange.min && { minPrice: priceRange.min }),
          ...(priceRange.max && { maxPrice: priceRange.max }),
        })

        const data = await api.get(`products?${query}`)
        if (cancelled) return

        const receivedProducts = Array.isArray(data.products) ? data.products : []
        setProducts(receivedProducts)
        setTotal(Number(data.total) || 0)
        setPages(Number(data.pages) || 1)

        if (isCanonicalCategoryPage && receivedProducts.length === 0) {
          const related = await api.get('products?limit=4&sort=newest')
          if (!cancelled) setRelatedProducts(Array.isArray(related.products) ? related.products : [])
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load products:', error)
          setProducts([])
          setTotal(0)
          setPages(1)
          setLoadError(true)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchProducts()
    return () => { cancelled = true }
  }, [category, parentCategory, search, newArrival, featured, sort, page, priceRange, isCanonicalCategoryPage])

  const heading = parentCategory || category || (search ? `Search: "${search}"` : null) || (newArrival ? 'New Arrivals' : 'All Batik Products')
  const seo = parentCategory
    ? (CATEGORY_SEO[parentCategory] || DEFAULT_PRODUCTS_SEO)
    : newArrival
      ? NEW_ARRIVALS_SEO
      : DEFAULT_PRODUCTS_SEO
  const canonicalPath = (pathCategory || isNewArrivalsPath) ? location.pathname : '/products'
  const isFilteredQuery = location.pathname === '/products' && Boolean(search || category || params.get('parentCategory') || featured || newArrival)
  const guide = pathCategory ? CATEGORY_GUIDES[pathCategory] : null

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: seo.title.replace(/ \| .*$/, ''),
    description: seo.description,
    url: `https://www.kesarabathik.com${canonicalPath}`,
    isPartOf: { '@id': 'https://www.kesarabathik.com/#website' },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: total,
      itemListElement: products.slice(0, 12).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://www.kesarabathik.com/products/${product.slug}`,
        name: product.name,
      })),
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.kesarabathik.com/' },
      { '@type': 'ListItem', position: 2, name: heading, item: `https://www.kesarabathik.com${canonicalPath}` },
    ],
  }

  const faqSchema = guide ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faqs.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  } : null

  return (
    <>
      <Seo
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        path={canonicalPath}
        noindex={isFilteredQuery}
        jsonLd={[collectionSchema, breadcrumbSchema, ...(faqSchema ? [faqSchema] : [])]}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 lg:px-8">
        <header className="mb-6 flex items-start justify-between gap-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold">Kesara Bathik Collection</p>
            <h1 className="font-display text-3xl font-bold text-deep lg:text-4xl">{guide?.heading || heading}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">{seo.description}</p>
            {!loading && total > 0 && <p className="mt-2 text-sm text-gray-500">{total} products available</p>}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <select value={sort} onChange={(event) => setSort(event.target.value)} className="input w-auto py-2 text-sm">
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Best Rated</option>
            </select>
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm transition-colors hover:border-gold lg:hidden">
              <FiFilter size={14} /> Filters
            </button>
          </div>
        </header>

        <div className="flex gap-8">
          <aside className={`w-56 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-20 rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">Categories</h2>
              {Object.entries(SUBCATEGORIES).map(([parent, subs]) => (
                <div key={parent} className="mb-4">
                  <button onClick={() => navigate(CATEGORY_PATHS[parent] || `/products?parentCategory=${encodeURIComponent(parent)}`)} className={`block w-full py-1 text-left text-sm font-semibold transition-colors hover:text-gold ${parentCategory === parent ? 'text-gold' : 'text-deep'}`}>{parent}</button>
                  {subs.map((subcategory) => (
                    <button key={subcategory} onClick={() => { const next = new URLSearchParams(params); next.set('category', subcategory); next.delete('parentCategory'); setParams(next) }} className={`block w-full py-1 pl-3 text-left text-xs transition-colors hover:text-gold ${category === subcategory ? 'font-semibold text-gold' : 'text-gray-500'}`}>{subcategory}</button>
                  ))}
                </div>
              ))}

              <h2 className="mb-3 mt-6 text-sm font-bold uppercase tracking-wider text-gray-500">Price Range (CAD)</h2>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={priceRange.min} onChange={(event) => setPriceRange((current) => ({ ...current, min: event.target.value }))} className="input px-3 py-2 text-xs" />
                <input type="number" placeholder="Max" value={priceRange.max} onChange={(event) => setPriceRange((current) => ({ ...current, max: event.target.value }))} className="input px-3 py-2 text-xs" />
              </div>

              <button onClick={() => { setParams({}); setPriceRange({ min: '', max: '' }) }} className="mt-4 flex w-full items-center gap-1 text-xs text-red-500 transition-colors hover:text-red-700"><FiX size={12} /> Clear filters</button>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            {loading ? (
              <ProductGridSkeleton />
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-6">
                  {products.map((product) => <ProductCard key={product._id} product={product} />)}
                </div>
                {pages > 1 && (
                  <div className="mt-10 flex justify-center gap-2">
                    {[...Array(pages)].map((_, index) => (
                      <button key={index} onClick={() => setPage(index + 1)} className={`h-10 w-10 rounded-full text-sm font-medium transition-all ${page === index + 1 ? 'bg-gold text-deep' : 'border text-gray-600 hover:border-gold'}`}>{index + 1}</button>
                    ))}
                  </div>
                )}
              </>
            ) : isCanonicalCategoryPage ? (
              <CanonicalCategoryFallback category={pathCategory} loadError={loadError} relatedProducts={relatedProducts} />
            ) : (
              <div className="rounded-2xl border border-dashed border-gold/30 bg-gold-50 px-6 py-14 text-center">
                <h2 className="font-display text-2xl font-bold text-deep">No matching products</h2>
                <p className="mt-2 text-sm text-gray-600">Try clearing the current search or filter options.</p>
                <button onClick={() => { setParams({}); setPriceRange({ min: '', max: '' }) }} className="btn-gold mt-5">Clear filters</button>
              </div>
            )}
          </div>
        </div>

        {guide && <CategoryGuide guide={guide} />}
      </div>
    </>
  )
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {[...Array(12)].map((_, index) => (
        <div key={index} className="card overflow-hidden">
          <div className="skeleton aspect-[3/4]" />
          <div className="space-y-2 p-4"><div className="skeleton h-4 w-3/4 rounded" /><div className="skeleton h-4 w-1/2 rounded" /></div>
        </div>
      ))}
    </div>
  )
}

function CanonicalCategoryFallback({ category, loadError, relatedProducts }) {
  return (
    <div>
      <section className="rounded-3xl border border-gold/20 bg-gradient-to-br from-gold-50 to-white px-6 py-10 sm:px-9">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">{category} collection</p>
        <h2 className="mt-2 font-display text-2xl font-bold text-deep">Explore handcrafted Sri Lankan batik</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600">
          {loadError
            ? 'The live product list could not be refreshed at this moment, but this category page and its shopping information remain available.'
            : `The online ${category.toLowerCase()} selection is being updated. New active designs will appear here automatically.`}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/products" className="btn-gold">Browse all products</Link>
          <Link to="/new-arrivals" className="btn-outline-gold">View new arrivals</Link>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="mt-8" aria-labelledby="related-batik-heading">
          <div className="mb-5 flex items-center justify-between">
            <h2 id="related-batik-heading" className="font-display text-2xl font-bold text-deep">Other available batik designs</h2>
            <Link to="/products" className="flex items-center gap-1 text-sm font-semibold text-gold">View all <FiArrowRight /></Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {relatedProducts.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        </section>
      )}
    </div>
  )
}

function CategoryGuide({ guide }) {
  return (
    <section className="mt-12 border-t border-gray-100 pt-10" aria-labelledby="category-guide-heading">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h2 id="category-guide-heading" className="font-display text-3xl font-bold text-deep">{guide.heading}</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-gray-600">
            {guide.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </div>
        <aside className="rounded-3xl bg-deep p-7 text-white">
          <h3 className="font-display text-xl font-bold text-gold">Collection highlights</h3>
          <ul className="mt-5 space-y-3 text-sm text-gray-300">
            {guide.highlights.map((highlight) => <li key={highlight} className="flex gap-3"><span className="text-gold">◆</span><span>{highlight}</span></li>)}
          </ul>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/products" className="btn-gold">Shop all batik</Link>
            <Link to="/faq" className="rounded-xl border border-gold/40 px-4 py-2 text-sm font-semibold text-gold transition-colors hover:bg-gold/10">Read FAQs</Link>
          </div>
        </aside>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {guide.faqs.map(([question, answer]) => (
          <article key={question} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-deep">{question}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">{answer}</p>
          </article>
        ))}
      </div>

      <nav className="mt-9 flex flex-wrap gap-x-6 gap-y-3 border-t border-gray-100 pt-6 text-sm font-semibold" aria-label="Related batik categories">
        {Object.entries(CATEGORY_PATHS).map(([label, path]) => <Link key={path} to={path} className="text-gold hover:underline">{label}</Link>)}
        <Link to="/new-arrivals" className="text-gold hover:underline">New Arrivals</Link>
      </nav>
    </section>
  )
}
