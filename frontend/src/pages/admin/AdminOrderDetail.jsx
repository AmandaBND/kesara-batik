import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded']
const STATUS_COLORS = { pending:'bg-yellow-100 text-yellow-700', confirmed:'bg-blue-100 text-blue-700', processing:'bg-purple-100 text-purple-700', shipped:'bg-indigo-100 text-indigo-700', delivered:'bg-green-100 text-green-700', cancelled:'bg-red-100 text-red-600', refunded:'bg-gray-100 text-gray-600' }

export default function AdminOrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [note, setNote] = useState('')
  const [tracking, setTracking] = useState('')
  const [courier, setCourier] = useState('')
  const [updating, setUpdating] = useState(false)
  const [refundAmt, setRefundAmt] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [refunding, setRefunding] = useState(false)

  useEffect(() => {
    api.get(`/orders/${id}`).then(o => {
      setOrder(o)
      setStatus(o.status)
      setTracking(o.trackingNumber || '')
      setCourier(o.courier || '')
    }).finally(() => setLoading(false))
  }, [id])

  const handleStatusUpdate = async () => {
    setUpdating(true)
    try {
      const updated = await api.put(`/orders/${id}/status`, { status, note, trackingNumber: tracking, courier })
      setOrder(updated)
      toast.success('Order status updated!')
      setNote('')
    } catch (err) { toast.error(err.message) }
    finally { setUpdating(false) }
  }

  const handleRefund = async () => {
    if (!refundAmt || !refundReason) return toast.error('Amount and reason required')
    if (!confirm(`Process refund of CA$${refundAmt}?`)) return
    setRefunding(true)
    try {
      const { order: updated } = await api.post(`/orders/${id}/refund`, { amount: parseFloat(refundAmt), reason: refundReason })
      setOrder(updated)
      toast.success('Refund processed!')
      setRefundAmt(''); setRefundReason('')
    } catch (err) { toast.error(err.message) }
    finally { setRefunding(false) }
  }

  if (loading) return <div className="skeleton h-96 rounded-2xl" />
  if (!order) return <p>Order not found</p>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/orders" className="text-gray-400 hover:text-deep">← Orders</Link>
        <h1 className="font-display text-2xl font-bold text-deep">Order #{order.orderNumber}</h1>
        <span className={`text-sm px-3 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[order.status]}`}>{order.status}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-3 items-center py-2 border-b last:border-0">
                  <img src={item.image || '/placeholder.jpg'} alt={item.name} className="w-14 h-14 rounded-lg object-cover" />
                  <div className="flex-1"><p className="font-medium text-sm">{item.name}</p>{item.variant?.size && <p className="text-xs text-gray-400">Size: {item.variant.size}</p>}{item.sku && <p className="text-xs text-gray-400">SKU: {item.sku}</p>}</div>
                  <div className="text-right"><p className="font-bold">CA${item.price}</p><p className="text-xs text-gray-400">×{item.quantity}</p></div>
                  <div className="font-bold text-gold">CA${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t space-y-1 text-sm">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>CA${order.pricing.subtotal?.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Shipping</span><span>CA${order.pricing.shipping?.toFixed(2)}</span></div>
              {order.pricing.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-CA${order.pricing.discount?.toFixed(2)}</span></div>}
              <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span className="text-gold">CA${order.pricing.total?.toFixed(2)}</span></div>
              {order.payment.refundAmount > 0 && <div className="flex justify-between text-red-500"><span>Refunded</span><span>CA${order.payment.refundAmount?.toFixed(2)}</span></div>}
            </div>
          </div>

          {/* Status Update */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold mb-4">Update Status</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">New Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="input text-sm py-2">
                  {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Note (optional)</label>
                <input value={note} onChange={e => setNote(e.target.value)} className="input text-sm py-2" placeholder="Status note…" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Tracking Number</label>
                <input value={tracking} onChange={e => setTracking(e.target.value)} className="input text-sm py-2" placeholder="e.g. LK123456789" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Courier</label>
                <input value={courier} onChange={e => setCourier(e.target.value)} className="input text-sm py-2" placeholder="e.g. EMS Sri Lanka" />
              </div>
            </div>
            <button onClick={handleStatusUpdate} disabled={updating} className="btn-gold text-sm py-2 px-5">{updating ? 'Updating…' : 'Update Status'}</button>
          </div>

          {/* Refund */}
          {order.payment.status === 'paid' && (
            <div className="bg-white rounded-2xl border border-red-100 p-5">
              <h3 className="font-bold mb-4 text-red-600">Process Refund</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><label className="text-xs font-semibold block mb-1">Refund Amount (CAD)</label><input type="number" min="0" max={order.pricing.total} step="0.01" value={refundAmt} onChange={e => setRefundAmt(e.target.value)} className="input text-sm" placeholder={`Max: CA$${order.pricing.total}`} /></div>
                <div><label className="text-xs font-semibold block mb-1">Reason</label><input value={refundReason} onChange={e => setRefundReason(e.target.value)} className="input text-sm" placeholder="e.g. Item damaged in shipping" /></div>
              </div>
              <button onClick={handleRefund} disabled={refunding} className="bg-red-500 text-white font-semibold px-5 py-2 rounded-xl text-sm hover:bg-red-600 transition-colors disabled:opacity-50">{refunding ? 'Processing…' : 'Process Refund'}</button>
            </div>
          )}

          {/* Status History */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold mb-4">Status History</h3>
            <div className="space-y-3">
              {order.statusHistory?.map((h, i) => (
                <div key={i} className="flex gap-3 text-sm"><div className="w-2 h-2 rounded-full bg-gold mt-1.5 shrink-0" /><div><p className="font-medium capitalize">{h.status}</p><p className="text-xs text-gray-500">{h.note}</p><p className="text-xs text-gray-400">{new Date(h.updatedAt).toLocaleString()}</p></div></div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold mb-3">Customer</h3>
            <p className="font-medium">{order.user?.name || 'Guest'}</p>
            <p className="text-sm text-gray-500">{order.user?.email || order.guestEmail}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold mb-3">Shipping Address</h3>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="font-medium text-deep">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
              <p>{order.shippingAddress.phone}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold mb-3">Payment</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="font-medium capitalize">{order.payment.method?.replace('_',' ')}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${order.payment.status==='paid'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{order.payment.status}</span></div>
              {order.payment.transactionId && <div className="flex justify-between"><span className="text-gray-500">Transaction</span><span className="font-mono text-xs truncate max-w-[120px]">{order.payment.transactionId}</span></div>}
              {order.payment.paidAt && <div className="flex justify-between"><span className="text-gray-500">Paid at</span><span className="text-xs">{new Date(order.payment.paidAt).toLocaleDateString()}</span></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
