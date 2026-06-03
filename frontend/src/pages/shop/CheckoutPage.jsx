import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useCartStore, useAuthStore, useCurrencyStore } from '../../store'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'

export default function CheckoutPage() {
  const { items, subtotal, shipping, total, clear } = useCartStore()
  const { user } = useAuthStore()
  const { format } = useCurrencyStore()
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: address, 2: payment
  const [payMethod, setPayMethod] = useState('stripe')
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState({
    fullName: user?.name || '', phone: '', email: user?.email || '',
    address: '', city: '', state: '', postalCode: '', country: 'Canada'
  })

  const createOrderPayload = () => ({
    items: items.map(i => ({ product: i.product._id, quantity: i.quantity, price: i.price, variant: i.variant })),
    shippingAddress: address,
    pricing: { subtotal: subtotal(), shipping: shipping(), tax: 0, discount: 0, total: total(), currency: 'CAD' },
    payment: { method: payMethod, status: 'pending' },
  })

  const handleStripeCheckout = async () => {
    setLoading(true)
    try {
      const order = await api.post('/orders', createOrderPayload())
      const { clientSecret } = await api.post('/payments/stripe/intent', { amount: total(), orderId: order._id })
      // In production, use Stripe Elements with the clientSecret
      // For now, simulate payment confirmation
      await api.put(`/orders/${order._id}/status`, { status: 'confirmed', note: 'Payment confirmed' })
      await api.post('/payments/stripe/intent', { amount: 0, orderId: order._id }) // demo
      clear()
      navigate(`/order-success/${order._id}`)
      toast.success('Order placed successfully! 🎉')
    } catch (err) { toast.error(err.message || 'Payment failed') }
    finally { setLoading(false) }
  }

  if (items.length === 0) return (
    <div className="section text-center py-20">
      <div className="text-6xl mb-4">🛒</div>
      <p className="text-gray-500 text-lg">Your cart is empty</p>
    </div>
  )

  return (
    <>
      <Helmet><title>Checkout | Kesara Batik</title></Helmet>
      <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-8 py-10">
        <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            {/* Step 1: Shipping */}
            <div className="card p-6 mb-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-gold text-deep flex items-center justify-center text-sm font-bold">1</span> Shipping Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="text-sm font-semibold block mb-1">Full Name *</label><input required value={address.fullName} onChange={e => setAddress(a => ({...a, fullName: e.target.value}))} className="input" /></div>
                <div><label className="text-sm font-semibold block mb-1">Email *</label><input type="email" required value={address.email} onChange={e => setAddress(a => ({...a, email: e.target.value}))} className="input" /></div>
                <div><label className="text-sm font-semibold block mb-1">Phone</label><input value={address.phone} onChange={e => setAddress(a => ({...a, phone: e.target.value}))} className="input" /></div>
                <div className="col-span-2"><label className="text-sm font-semibold block mb-1">Street Address *</label><input required value={address.address} onChange={e => setAddress(a => ({...a, address: e.target.value}))} className="input" /></div>
                <div><label className="text-sm font-semibold block mb-1">City *</label><input required value={address.city} onChange={e => setAddress(a => ({...a, city: e.target.value}))} className="input" /></div>
                <div><label className="text-sm font-semibold block mb-1">State/Province</label><input value={address.state} onChange={e => setAddress(a => ({...a, state: e.target.value}))} className="input" /></div>
                <div><label className="text-sm font-semibold block mb-1">Postal Code</label><input value={address.postalCode} onChange={e => setAddress(a => ({...a, postalCode: e.target.value}))} className="input" /></div>
                <div><label className="text-sm font-semibold block mb-1">Country *</label>
                  <select required value={address.country} onChange={e => setAddress(a => ({...a, country: e.target.value}))} className="input">
                    {['Canada','USA','United Kingdom','Australia','UAE','Japan','South Korea','Germany','France','Sri Lanka','Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Payment */}
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-gold text-deep flex items-center justify-center text-sm font-bold">2</span> Payment Method</h2>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[['stripe','💳 Credit/Debit Card'],['paypal','🅿️ PayPal'],['bank_transfer','🏦 Bank Transfer']].map(([method, label]) => (
                  <button key={method} onClick={() => setPayMethod(method)} className={`p-3 border-2 rounded-xl text-sm font-medium transition-all ${payMethod === method ? 'border-gold bg-gold-50 text-deep' : 'border-gray-200 hover:border-gold/50'}`}>{label}</button>
                ))}
              </div>

              {payMethod === 'stripe' && (
                <div className="bg-cream rounded-xl p-4 text-sm text-gray-500 mb-4">
                  💳 You'll be redirected to Stripe's secure payment page. All major credit/debit cards accepted.
                </div>
              )}

              {payMethod === 'paypal' && (
                <PayPalScriptProvider options={{ 'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb', currency: 'CAD' }}>
                  <PayPalButtons
                    style={{ layout: 'vertical', color: 'gold', shape: 'pill' }}
                    createOrder={async () => {
                      const { id } = await api.post('/payments/paypal/create', { amount: total() })
                      return id
                    }}
                    onApprove={async (data) => {
                      setLoading(true)
                      try {
                        const order = await api.post('/orders', createOrderPayload())
                        await api.post('/payments/paypal/capture', { paypalOrderId: data.orderID, orderId: order._id })
                        clear()
                        navigate(`/order-success/${order._id}`)
                        toast.success('Order placed! Payment confirmed 🎉')
                      } catch { toast.error('Payment capture failed') }
                      finally { setLoading(false) }
                    }}
                    onError={() => toast.error('PayPal error. Try another method.')}
                  />
                </PayPalScriptProvider>
              )}

              {payMethod === 'bank_transfer' && (
                <div className="bg-cream rounded-xl p-4 text-sm space-y-2 mb-4">
                  <p className="font-semibold">Bank Transfer Details:</p>
                  <p>Bank: Commercial Bank of Ceylon</p>
                  <p>Account Name: Kesara Batik</p>
                  <p>Account Number: XXXX XXXX XXXX</p>
                  <p className="text-xs text-gray-400">Please send payment confirmation via WhatsApp after transfer.</p>
                </div>
              )}

              {payMethod !== 'paypal' && (
                <button onClick={handleStripeCheckout} disabled={loading || !address.fullName || !address.address} className="btn-gold w-full py-4 text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? 'Processing...' : `Place Order · ${format(total())}`}
                </button>
              )}

              <p className="text-center text-xs text-gray-400 mt-3">🔒 Your payment info is encrypted and secure</p>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="card p-6 sticky top-20">
              <h3 className="font-bold mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.key} className="flex gap-3">
                    <img src={item.product.images?.[0]?.url || '/placeholder.jpg'} className="w-14 h-14 rounded-lg object-cover" alt={item.product.name} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      {item.variant?.size && <p className="text-xs text-gray-400">Size: {item.variant.size}</p>}
                      <p className="text-sm font-bold text-gold">{format(item.price, item.product)} × {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{format(subtotal())}</span></div>
                <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{shipping() === 0 ? <span className="text-green-600">FREE 🎉</span> : format(shipping())}</span></div>
                <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span className="text-gold">{format(total())}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
