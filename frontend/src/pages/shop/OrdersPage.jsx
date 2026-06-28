import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useCurrencyStore } from '../../store'
import api from '../../utils/api'

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { format } = useCurrencyStore()

  useEffect(() => {
    api.get('orders/my').then(setOrders).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Helmet><title>My Orders | Kesara Bathik</title></Helmet>
      <div className="section max-w-4xl">
        <h1 className="font-display text-3xl font-bold mb-8">My Orders</h1>
        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_,i) => <div key={i} className="card p-6 skeleton h-24" />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
            <Link to="/products" className="btn-gold">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order._id} className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <span className="font-bold text-deep">#{order.orderNumber}</span>
                    <span className="text-sm text-gray-500 ml-3">{new Date(order.createdAt).toLocaleDateString('en-CA', { year:'numeric',month:'short',day:'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>{order.status}</span>
                    <span className="font-bold text-gold">{format(order.pricing.total)}</span>
                  </div>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {order.items.map((item, i) => (
                    <div key={i} className="shrink-0 flex items-center gap-2 bg-cream rounded-lg px-3 py-2">
                      <img src={item.image || '/placeholder.jpg'} alt={item.name} className="w-10 h-10 rounded object-cover" />
                      <div className="text-xs"><p className="font-medium max-w-[120px] truncate">{item.name}</p><p className="text-gray-500">×{item.quantity}</p></div>
                    </div>
                  ))}
                </div>
                {order.trackingNumber && (
                  <p className="text-xs text-gray-500 mt-3">📦 Tracking: <span className="font-mono font-semibold">{order.trackingNumber}</span> via {order.courier}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
