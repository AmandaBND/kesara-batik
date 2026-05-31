import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi'
import ProductCard from '../../components/shop/ProductCard'
import api from '../../utils/api'

const SUBCATEGORIES = {
  Women: ["Women's Saree","Women's Lungi","Batik Kandyan designs","Batik Frocks","Batik Tops & Skirts","Batik Tops & Pants","Batik Kurtha Sets","Batik Kaftan"],
  Men: ["Men's Avurudu Kits","Men's Sarong","Batik Shirts"],
  Kids: ["Kid's Focks","Kid's Lama Saree","Kids Shirts and Sarong"],
  'Family Kits': [],
  Accessories: ["Bags","Jewellery","Clutches","Slippers","Hair Accessories"],
}

export default function ProductsPage() {
  const [params, setParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [sort, setSort] = useState('newest')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })

  const category = params.get('category') || ''
  const parentCategory = params.get('parentCategory') || ''
  const search = params.get('search') || ''
  const newArrival = params.get('newArrival') || ''
  const featured = params.get('featured') || ''

  useEffect(() => {
    setPage(1)
  }, [category, parentCategory, search, sort])

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const q = new URLSearchParams({ page, limit: 12, sort, ...(category && { category }), ...(parentCategory && { parentCategory }), ...(search && { search }), ...(newArrival && { newArrival }), ...(featured && { featured }), ...(priceRange.min && { minPrice: priceRange.min }), ...(priceRange.max && { maxPrice: priceRange.max }) })
        const data = await api.get(`/products?${q}`)
        setProducts(data.products)
        setTotal(data.total)
        setPages(data.pages)
      } finally { setLoading(false) }
    }
    fetch()
  }, [category, parentCategory, search, newArrival, featured, sort, page, priceRange])

  const title = parentCategory || category || (search ? `Search: "${search}"` : null) || (newArrival ? 'New Arrivals' : 'All Products')

  return (
    <>
      <Helmet><title>{title} | Kesara Batik</title></Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-deep">{title}</h1>
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
                  <button onClick={() => { const p = new URLSearchParams(params); p.set('parentCategory', parent); p.delete('category'); setParams(p) }} className={`block w-full text-left text-sm font-semibold py-1 hover:text-gold transition-colors ${parentCategory === parent ? 'text-gold' : 'text-deep'}`}>{parent}</button>
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
