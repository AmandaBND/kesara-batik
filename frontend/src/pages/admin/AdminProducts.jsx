import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiSearch } from 'react-icons/fi'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [deleting, setDeleting] = useState(null)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 15, ...(search && { search }) })
      // Admin gets all products including inactive
      const data = await api.get(`/products?${params}&showAll=true`)
      setProducts(data.products || [])
      setTotal(data.total || 0)
      setPages(data.pages || 1)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchProducts() }, [page, search])

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      await api.delete(`/products/${id}`)
      setProducts(ps => ps.filter(p => p._id !== id))
      toast.success('Product deleted')
    } catch (err) { toast.error(err.message) }
    finally { setDeleting(null) }
  }

  const handleToggle = async (id) => {
    try {
      const { isActive } = await api.patch(`/products/${id}/toggle`)
      setProducts(ps => ps.map(p => p._id === id ? { ...p, isActive } : p))
      toast.success(isActive ? 'Product activated' : 'Product hidden')
    } catch (err) { toast.error(err.message) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-deep">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total products</p>
        </div>
        <Link to="/admin/products/new" className="btn-gold flex items-center gap-2 text-sm py-2.5 px-5">
          <FiPlus size={16} /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search products…"
          className="input pl-9 text-sm"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              {['Product','Category','SKU','Price','Stock','Status','Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i} className="border-t"><td colSpan={7} className="px-4 py-3"><div className="skeleton h-8 rounded" /></td></tr>
              ))
            ) : products.map(p => (
              <tr key={p._id} className="border-t border-gray-50 hover:bg-cream/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.images?.[0]?.url || '/placeholder.jpg'} alt={p.name} className="w-12 h-12 rounded-lg object-cover border border-gray-100" />
                    <div>
                      <p className="font-medium text-deep max-w-[200px] truncate">{p.name}</p>
                      {p.nameLocal && <p className="text-xs text-gray-400">{p.nameLocal}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">{p.category}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.sku || '—'}</td>
                <td className="px-4 py-3 font-semibold text-deep">CA${p.price}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.stockCount > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                    {p.stockCount > 0 ? `${p.stockCount} in stock` : 'Out of stock'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleToggle(p._id)} className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${p.isActive ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'}`}>
                    {p.isActive ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
                    {p.isActive ? 'Active' : 'Hidden'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link to={`/admin/products/${p._id}/edit`} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><FiEdit2 size={15} /></Link>
                    <button onClick={() => handleDelete(p._id, p.name)} disabled={deleting === p._id} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"><FiTrash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && products.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">📦</div>
            <p>No products found</p>
            <Link to="/admin/products/new" className="btn-gold mt-4 inline-block text-sm">Add First Product</Link>
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(pages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${page === i+1 ? 'bg-gold text-deep' : 'border hover:border-gold text-gray-500'}`}>{i+1}</button>
          ))}
        </div>
      )}
    </div>
  )
}
