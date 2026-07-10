import { useEffect, useState } from 'react'
import api from '../../utils/api'

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  canceled: 'bg-red-100 text-red-700',
}

export default function AdminRefunds() {
  const [refunds, setRefunds] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const data = await api.get('orders/refunds')
      setRefunds(data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id, status) => {
    await api.put(`orders/refunds/${id}`, { status })
    await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-deep">Refund Requests</h1>
          <p className="text-sm text-gray-500">Manage bank-transfer refunds and stock restoration</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              {['Refund ID','Order','Date','Customer','Amount','Account','Bank','Status'].map(h => <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? [...Array(5)].map((_, i) => <tr key={i} className="border-t"><td colSpan={8} className="px-4 py-3"><div className="skeleton h-6 rounded" /></td></tr>) : refunds.map(refund => (
              <tr key={refund._id} className="border-t hover:bg-cream/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-bold text-gold">#{refund._id.slice(-6)}</td>
                <td className="px-4 py-3">{refund.order?.orderNumber || '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(refund.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{refund.customerName || 'Customer'}</div>
                  <div className="text-xs text-gray-400">{refund.customerEmail}</div>
                </td>
                <td className="px-4 py-3 font-bold">{refund.currency} {refund.amount}</td>
                <td className="px-4 py-3 text-xs">{refund.accountNumber || '—'}</td>
                <td className="px-4 py-3 text-xs">{refund.bankName || '—'}</td>
                <td className="px-4 py-3">
                  <select value={refund.status} onChange={(e) => updateStatus(refund._id, e.target.value)} className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_STYLES[refund.status] || 'bg-gray-100 text-gray-600'}`}>
                    <option value="pending">pending</option>
                    <option value="paid">paid</option>
                    <option value="canceled">canceled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
