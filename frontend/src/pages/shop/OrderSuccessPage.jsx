// OrderSuccessPage.jsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../utils/api'

export default function OrderSuccessPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    api.get(`orders/${id}`).then(setOrder).catch(() => {})
  }, [id])

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="text-7xl mb-6 animate-bounce">🎉</div>
        <h1 className="font-display text-4xl font-bold text-deep mb-3">Order Placed!</h1>
        <p className="text-gray-500 mb-2">Thank you for shopping with Kesara Bathik.</p>
        {order && <p className="text-gold font-bold text-lg mb-6">Order #{order.orderNumber}</p>}
        <div className="card p-6 text-left mb-6 space-y-2 text-sm">
          <p>📦 You'll receive a confirmation email shortly.</p>
          <p>✈️ Ships from Colombo, Sri Lanka within 2–3 business days.</p>
          <p>📱 For tracking updates, contact us on WhatsApp.</p>
          <p>⏱️ Estimated delivery: 7–14 business days.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/orders" className="btn-gold">View My Orders</Link>
          <Link to="/" className="btn-outline-gold">Continue Shopping</Link>
          <a href="https://wa.me/94XXXXXXXXXX" target="_blank" rel="noopener noreferrer" className="bg-green-500 text-white font-semibold px-6 py-3 rounded-full hover:bg-green-600 transition-colors">💬 WhatsApp Us</a>
        </div>
      </div>
    </div>
  )
}
