import { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../../store'
import api from '../../utils/api'
import Seo from '../../components/common/Seo'

export default function GenieReturnPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { clear } = useCartStore()
  const status = searchParams.get('status')
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!orderId) { setChecking(false); return }

    // Poll our backend to confirm payment status (webhook may beat us here)
    let attempts = 0
    const poll = async () => {
      try {
        const data = await api.get(`payments/genie/status/${orderId}`)
        if (data.paymentStatus === 'paid' || data.status === 'confirmed' || attempts >= 5) {
          setOrder(data)
          setChecking(false)
          if (data.paymentStatus === 'paid' || data.status === 'confirmed') {
            clear() // clear cart only on confirmed payment
          }
          return
        }
      } catch {
        setChecking(false)
        return
      }
      attempts++
      setTimeout(poll, 2000)
    }
    poll()
  }, [orderId, clear])

  const isPaid = order?.paymentStatus === 'paid' || order?.status === 'confirmed' || status === 'success'
  const isFailed = status === 'failed' && !isPaid

  if (checking) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-spin">⏳</div>
        <p className="text-gray-600 font-medium">Confirming your payment with Genie...</p>
        <p className="text-gray-400 text-sm mt-2">Please wait, this may take a few seconds.</p>
      </div>
    </div>
  )

  if (isFailed) return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <Seo title="Payment Failed | Kesara Bathik" path="/payment/genie/return" />
      <div className="max-w-lg w-full text-center">
        <div className="text-7xl mb-6">❌</div>
        <h1 className="font-display text-3xl font-bold text-red-600 mb-3">Payment Not Completed</h1>
        <p className="text-gray-500 mb-6">Your Genie payment was not completed. Your order has not been charged.</p>
        <div className="card p-6 text-left mb-6 text-sm space-y-2">
          <p>💬 Need help? Contact us on WhatsApp and we'll assist you.</p>
          <p>🔄 You can try again or select Bank Transfer at checkout.</p>
          {orderId && <p className="text-gray-400">Order ref: {orderId}</p>}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/checkout" className="btn-gold">Try Again</Link>
          <a href="https://wa.me/94771234567" target="_blank" rel="noopener noreferrer"
             className="bg-green-500 text-white font-semibold px-6 py-3 rounded-full hover:bg-green-600 transition-colors">
            💬 WhatsApp Us
          </a>
          <Link to="/" className="btn-outline-gold">Continue Shopping</Link>
        </div>
      </div>
    </div>
  )

  // Success
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <Seo title="Order Confirmed | Kesara Bathik" path="/payment/genie/return" />
      <div className="max-w-lg w-full text-center">
        <div className="text-7xl mb-6 animate-bounce">🎉</div>
        <h1 className="font-display text-4xl font-bold text-deep mb-3">Order Confirmed!</h1>
        <p className="text-gray-500 mb-2">Your Genie payment was successful.</p>
        {order?.orderNumber && (
          <p className="text-gold font-bold text-lg mb-6">Order #{order.orderNumber}</p>
        )}
        <div className="card p-4 mb-4 flex items-center justify-center gap-3">
          <img src="/genie-logo.jpg" alt="Paid via Dialog Genie" className="h-8 rounded" />
          <span className="text-sm text-green-600 font-semibold">✓ Payment verified by Dialog Genie</span>
        </div>
        <div className="card p-6 text-left mb-6 space-y-2 text-sm">
          <p>📧 A confirmation email has been sent to you.</p>
          <p>📦 Ships from Colombo, Sri Lanka within 2–3 business days.</p>
          <p>📱 For tracking updates, contact us on WhatsApp.</p>
          <p>⏱️ Estimated delivery: 7–14 business days.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {orderId && <Link to={`/orders`} className="btn-gold">View My Order</Link>}
          <a href="https://wa.me/94771234567" target="_blank" rel="noopener noreferrer"
             className="bg-green-500 text-white font-semibold px-6 py-3 rounded-full hover:bg-green-600 transition-colors">
            💬 WhatsApp Us
          </a>
          <Link to="/" className="btn-outline-gold">Continue Shopping</Link>
        </div>
      </div>
    </div>
  )
}
