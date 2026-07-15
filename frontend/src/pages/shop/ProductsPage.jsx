import { useState, useEffect } from 'react'
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom'
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi'
import ProductCard from '../../components/shop/ProductCard'
import Seo from '../../components/common/Seo'
import api from '../../utils/api'

const SUBCATEGORIES = {
  Women: ["Women's Saree","Women's Lungi","Batik Kandyan designs","Batik Frocks","Batik Tops & Skirts","Batik Tops & Pants","Batik Kurtha Sets","Batik Kaftan"],
  Men: ["Men's Avurudu Kits","Men's Sarong","Batik Shirts"],
  Kids: ["Kid's Focks","Kid's Lama Saree","Kids Shirts and Sarong"],
  'Family Kits': [],
  Accessories: ["Bags","Jewellery","Clutches","Slippers","Hair Accessories"],
}

// Clean URLs like /women should behave as a filtered view of /products,
// not a separate empty/duplicate page.
const PATH_CATEGORY_MAP = {
  '/women': 'Women',
  '/men': 'Men',
  '/kids': 'Kids',
  '/family-kits': 'Family Kits',
  '/accessories': 'Accessories',
}

const NEW_ARRIVALS_PATH = '/new-arrivals'

const CATEGORY_PATHS = {
  Women: '/women',
  Men: '/men',
  Kids: '/kids',
  'Family Kits': '/family-kits',
  Accessories: '/accessories',
}


const CATEGORY_SEO = {
  Women: {
    title: "Batik Sarees & Women's Bathik Prices in Sri Lanka | Kesara Bathik",
    description:
      'Shop Sri Lankan batik sarees, Kandyan bathik designs, frocks, kaftans, tops and kurtha sets. View current LKR prices and order online.',
    keywords: ['batik sarees Sri Lanka', 'bathik saree price Sri Lanka', 'Kandyan batik saree', 'batik frocks Sri Lanka', 'women bathik Sri Lanka'],
  },
  Men: {
    title: "Men's Batik Shirts & Sarongs Sri Lanka | Kesara Bathik",
    description:
      'Shop handcrafted men’s batik shirts, Sri Lankan sarongs and Avurudu kits. View bathik prices in Sri Lanka and order online worldwide.',
    keywords: ['batik shirts Sri Lanka', 'men bathik shirts', 'batik sarong Sri Lanka', 'Avurudu batik kits', 'Sri Lankan batik men'],
  },
  Kids: {
    title: 'Kids Batik Clothing Sri Lanka | Frocks, Sarees & Shirts',
    description:
      'Shop colourful Sri Lankan batik clothing for kids, including frocks, lama sarees, shirts and sarongs. Current LKR prices shown online.',
    keywords: ['kids batik Sri Lanka', 'bathik frocks for kids', 'kids batik shirts', 'lama saree batik', 'children bathik clothing'],
  },
  'Family Kits': {
    title: 'Batik Family Kits Sri Lanka | Matching Bathik Outfits',
    description:
      'Shop matching Sri Lankan batik family kits for Avurudu, weddings and celebrations. Coordinated bathik outfits with current online prices.',
    keywords: ['batik family kits Sri Lanka', 'matching bathik clothes', 'Avurudu family batik', 'Sri Lankan family outfits'],
  },
  Accessories: {
    title: 'Batik Accessories Sri Lanka | Bags, Clutches & Jewellery',
    description:
      'Shop handcrafted Sri Lankan batik bags, clutches, jewellery, slippers and hair accessories. View local prices and order online.',
    keywords: ['batik accessories Sri Lanka', 'batik bags Sri Lanka', 'bathik clutch', 'Sri Lankan handmade accessories'],
  },
}

const DEFAULT_PRODUCTS_SEO = {
  title: 'Batik Clothing Sri Lanka | Sarees, Shirts & Bathik Prices',
  description:
    'Browse authentic Sri Lankan batik and bathik sarees, shirts, sarongs, frocks, family kits and accessories with current online prices.',
  keywords: ['Batik Sri Lanka', 'Bathik Sri Lanka', 'bathik price in Sri Lanka', 'batik clothing online', 'Sri Lankan batik shop'],
}

const NEW_ARRIVALS_SEO = {
  title: 'New Sri Lankan Batik Clothing | Kesara Bathik',
  description:
    'Discover the latest Sri Lankan batik sarees, shirts, sarongs, frocks, family kits and accessories newly added to Kesara Bathik.',
  keywords: ['new batik designs Sri Lanka', 'latest bathik sarees', 'new batik shirts', 'Sri Lankan batik new arrivals'],
}

export default function ProductsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    setPage(1)
  }, [category, parentCategory, search, sort])

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const q = new URLSearchParams({ page, limit: 12, sort, ...(category && { category }), ...(parentCategory && { parentCategory }), ...(search && { search }), ...(newArrival && { newArrival }), ...(featured && { featured }), ...(priceRange.min && { minPrice: priceRange.min }), ...(priceRange.max && { maxPrice: priceRange.max }) })
        const data = await api.get(`products?${q}`)
        setProducts(data.products)
        setTotal(data.total)
        setPages(data.pages)
      } finally { setLoading(false) }
    }
    fetch()
  }, [category, parentCategory, search, newArrival, featured, sort, page, priceRange])

  const heading = parentCategory || category || (search ? `Search: "${search}"` : null) || (newArrival ? 'New Arrivals' : 'All Batik Products')
  const seo = parentCategory
    ? (CATEGORY_SEO[parentCategory] || DEFAULT_PRODUCTS_SEO)
    : newArrival
      ? NEW_ARRIVALS_SEO
      : DEFAULT_PRODUCTS_SEO
  const canonicalPath = (pathCategory || isNewArrivalsPath) ? location.pathname : '/products'
  const isFilteredQuery = location.pathname === '/products' && Boolean(search || category || params.get('parentCategory') || featured || newArrival)
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: seo.title.replace(/ \| .*$/, ''),
    description: seo.description,
    url: `https://www.kesarabathik.com${canonicalPath}`,
    isPartOf: { '@id': 'https://www.kesarabathik.com/#website' },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
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

  return (
    <>
      <Seo
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        path={canonicalPath}
        noindex={isFilteredQuery}
        jsonLd={[collectionSchema, breadcrumbSchema]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-deep">{heading}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">{seo.description}</p>
            {!loading && <p className="text-sm text-gray-500 mt-1">{total} products found</p>}
          </div>
          <div className="flex items-center gap-3">
            <select value={sort} onChange={e => setSort(e.target.value)} className="input w-auto text-sm py-2">
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Best Rated</option>
            </select>
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm hover:border-gold transition-colors lg:hidden">
              <FiFilter size={14} /> Filters
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`shrink-0 w-56 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
              <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-4">Categories</h3>
              {Object.entries(SUBCATEGORIES).map(([parent, subs]) => (
                <div key={parent} className="mb-4">
                  <button onClick={() => navigate(CATEGORY_PATHS[parent] || `/products?parentCategory=${encodeURIComponent(parent)}`)} className={`block w-full text-left text-sm font-semibold py-1 hover:text-gold transition-colors ${parentCategory === parent ? 'text-gold' : 'text-deep'}`}>{parent}</button>
                  {subs.map(s => (
                    <button key={s} onClick={() => { const p = new URLSearchParams(params); p.set('category', s); p.delete('parentCategory'); setParams(p) }} className={`block text-xs pl-3 py-1 hover:text-gold transition-colors w-full text-left ${category === s ? 'text-gold font-semibold' : 'text-gray-500'}`}>{s}</button>
                  ))}
                </div>
              ))}

              <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-3 mt-6">Price Range (CAD)</h3>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={priceRange.min} onChange={e => setPriceRange(p => ({ ...p, min: e.target.value }))} className="input text-xs py-2 px-3" />
                <input type="number" placeholder="Max" value={priceRange.max} onChange={e => setPriceRange(p => ({ ...p, max: e.target.value }))} className="input text-xs py-2 px-3" />
              </div>

              <button onClick={() => { setParams({}); setPriceRange({ min: '', max: '' }) }} className="w-full mt-4 text-xs text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"><FiX size={12} /> Clear filters</button>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[...Array(12)].map((_,i) => <div key={i} className="card overflow-hidden"><div className="skeleton aspect-[3/4]"/><div className="p-4 space-y-2"><div className="skeleton h-4 rounded w-3/4"/><div className="skeleton h-4 rounded w-1/2"/></div></div>)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-500 text-lg">No products found</p>
                <button onClick={() => setParams({})} className="mt-4 btn-gold">Clear filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-6">
                  {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
                {pages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {[...Array(pages)].map((_, i) => (
                      <button key={i} onClick={() => setPage(i + 1)} className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${page === i + 1 ? 'bg-gold text-deep' : 'border hover:border-gold text-gray-600'}`}>{i + 1}</button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
