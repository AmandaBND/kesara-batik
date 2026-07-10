// AdminOrders.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiSearch, FiFilter, FiTrash2 } from 'react-icons/fi'
import api from '../../utils/api'

const STATUS_COLORS = { pending:'bg-yellow-100 text-yellow-700', confirmed:'bg-blue-100 text-blue-700', processing:'bg-purple-100 text-purple-700', shipped:'bg-indigo-100 text-indigo-700', delivered:'bg-green-100 text-green-700', cancelled:'bg-red-100 text-red-600', refunded:'bg-gray-100 text-gray-600' }

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [deletingId, setDeletingId] = useState('')

  const fetch = async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ page, limit: 20, ...(search && { search }), ...(status && { status }) })
      const data = await api.get(`orders?${p}`)
      setOrders(data.orders || [])
      setTotal(data.total || 0)
      setPages(data.pages || 1)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [page, search, status])

  const handleDelete = async (orderId) => {
    if (!window.confirm('Delete this order and restore its stock?')) return
    try {
      setDeletingId(orderId)
      await api.delete(`orders/${orderId}`)
      await fetch()
    } finally {
      setDeletingId('')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl font-bold text-deep">Orders</h1><p className="text-sm text-gray-500">{total} total orders</p></div>
      </div>
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} /><input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search by order # or name…" className="input pl-9 text-sm w-64" /></div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} className="input w-auto text-sm py-2">
          <option value="">All Statuses</option>
          {['pending','confirmed','processing','shipped','delivered','cancelled','refunded'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b">{['Order #','Customer','Date','Items','Total','Status','Payment',''].map(h => <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody>
            {loading ? [...Array(8)].map((_,i) => <tr key={i} className="border-t"><td colSpan={8} className="px-4 py-3"><div className="skeleton h-6 rounded" /></td></tr>)
            : orders.map(order => (
              <tr key={order._id} className="border-t hover:bg-cream/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-bold text-gold">#{order.orderNumber}</td>
                <td className="px-4 py-3"><div className="font-medium">{order.user?.name || 'Guest'}</div><div className="text-xs text-gray-400">{order.shippingAddress?.country}</div></td>
                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-gray-600">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</td>
                <td className="px-4 py-3 font-bold">CA${order.pricing?.total?.toFixed(2)}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>{order.status}</span></td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${order.payment?.status==='paid'?'bg-green-100 text-green-700':order.payment?.status==='refunded'?'bg-gray-100 text-gray-600':'bg-yellow-100 text-yellow-700'}`}>{order.payment?.status}</span></td>
                <td className="px-4 py-3 flex items-center gap-2">
                  <Link to={`/admin/orders/${order._id}`} className="text-blue-500 hover:text-blue-700 text-xs font-medium">View →</Link>
                  <button
                    onClick={() => handleDelete(order._id)}
                    disabled={deletingId === order._id}
                    className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-60"
                  >
                    <FiTrash2 size={13} /> {deletingId === order._id ? 'Deleting…' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && <div className="flex justify-center gap-2 mt-5">{[...Array(pages)].map((_,i) => <button key={i} onClick={() => setPage(i+1)} className={`w-9 h-9 rounded-full text-sm ${page===i+1?'bg-gold text-deep font-bold':'border hover:border-gold text-gray-500'}`}>{i+1}</button>)}</div>}
    </div>
  )
}
