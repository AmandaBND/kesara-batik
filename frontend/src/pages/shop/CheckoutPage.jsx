import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore, useAuthStore, useCurrencyStore } from '../../store'
import { getUnitPrice, getCartSubtotal, getShipping, getCartTotal } from '../../utils/pricing'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import Seo from '../../components/common/Seo'

const HNB_ACCOUNT = {
  bank:    'HNB — Hatton National Bank',
  branch:  'Tangalle (086)',
  account: '086020259190',
  name:    'Himal G M H',
}

const COUNTRIES = [
  'Sri Lanka','Canada','USA','United Kingdom','Australia',
  'UAE','Japan','South Korea','Germany','France','Other',
]

export default function CheckoutPage() {
  const { items, clear } = useCartStore()
  const { user } = useAuthStore()
  const { formatAmount, currency, rates } = useCurrencyStore()
  const navigate = useNavigate()

  const genieAvailable = ['CAD', 'USD', 'GBP', 'AED', 'LKR', 'JPY', 'KRW'].includes(currency)
  const [payMethod, setPayMethod] = useState(() => genieAvailable ? 'genie' : 'bank_transfer')
  const [loading,   setLoading]   = useState(false)
  const [validationError, setValidationError] = useState('')
  const [address,   setAddress]   = useState({
    fullName:   user?.name  || '',
    email:      user?.email || '',
    phone:      '',
    address:    '',
    city:       '',
    state:      '',
    postalCode: '',
    country:    'Sri Lanka',
  })

  const addressComplete = address.fullName && address.email && address.address && address.city && address.country

  const validateAddress = () => {
    const fullName = address.fullName.trim()
    const email = address.email.trim()
    const phone = address.phone.trim()
    const postalCode = address.postalCode.trim()
    const city = address.city.trim()
    const state = address.state.trim()
    const street = address.address.trim()

    if (!/^[A-Za-z\s]+$/.test(fullName)) {
      return 'Full Name can only contain letters and spaces.'
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Email should be in a valid format like name@example.com.'
    }

    if (phone && !/^\d+$/.test(phone)) {
      return 'Phone number should contain only numbers.'
    }

    if (!street) {
      return 'Street Address is required.'
    }

    if (!/^[A-Za-z\s]+$/.test(city)) {
      return 'City can only contain letters and spaces.'
    }

    if (state && !/^[A-Za-z\s]+$/.test(state)) {
      return 'State / Province can only contain letters and spaces.'
    }

    if (postalCode && !/^\d+$/.test(postalCode)) {
      return 'Postal Code should contain only numbers.'
    }

    return ''
  }

  // Never convert an overseas price into the separate Sri Lankan price list.
  // LKR continues to use priceLKR, while every overseas checkout currency is
  // derived from the product's CAD price using the current CAD exchange rate.
  const checkoutCurrency = currency || 'CAD'
  const checkoutSubtotal = getCartSubtotal(items, checkoutCurrency, rates)
  const checkoutShipping = getShipping(items, checkoutCurrency, rates)
  const checkoutTotal = getCartTotal(items, checkoutCurrency, rates)
  const formatCheckoutAmount = (amount) =>
    checkoutCurrency === 'LKR' ? `LKR ${Number(amount).toFixed(2)}` : formatAmount(amount)

  useEffect(() => {
    if (!genieAvailable && payMethod === 'genie') {
      setPayMethod('bank_transfer')
    }
  }, [genieAvailable, payMethod])

  const createOrderPayload = () => ({
    items: items.map(i => ({
      product:  i.product._id,
      quantity: i.quantity,
      price:    i.price,
      variant:  i.variant,
    })),
    shippingAddress: address,
    pricing: {
      subtotal: checkoutSubtotal,
      shipping: checkoutShipping,
      tax:      0,
      discount: 0,
      total:    checkoutTotal,
      currency: checkoutCurrency,
    },
    payment: { method: payMethod, status: 'pending' },
  })

  // ── GENIE: create order → get Genie payment URL → redirect ──
  const handleGenieCheckout = async () => {
    if (!genieAvailable) { toast.error(`Dialog Genie is not available for ${checkoutCurrency}`); return }
    if (!addressComplete) { toast.error('Please complete your shipping address'); return }
    const validationMessage = validateAddress()
    if (validationMessage) {
      setValidationError(validationMessage)
      toast.error(validationMessage)
      return
    }
    setValidationError('')
    setLoading(true)
    try {
      // 1. Create order in our system
      const order = await api.post('orders', createOrderPayload())
      // 2. Request Genie payment session from our backend
      const { paymentUrl } = await api.post('payments/genie/create', { orderId: order._id })
      if (!paymentUrl) throw new Error('Could not get Genie payment URL')
      clear()
      // 3. Redirect to Genie hosted checkout page
      window.location.href = paymentUrl
    } catch (err) {
      toast.error(err.message || 'Could not initiate Genie payment. Try bank transfer.')
      setLoading(false)
    }
    // Note: loading stays true while redirecting — intentional
  }

  // ── BANK TRANSFER: create order, show instructions ──────────
  const handleBankTransfer = async () => {
    if (!addressComplete) { toast.error('Please complete your shipping address'); return }
    const validationMessage = validateAddress()
    if (validationMessage) {
      setValidationError(validationMessage)
      toast.error(validationMessage)
      return
    }
    setValidationError('')
    setLoading(true)
    try {
      const order = await api.post('orders', createOrderPayload())
      clear()
      navigate(`/order-success/${order._id}?method=bank`)
      toast.success('Order placed! Please complete your bank transfer. 🏦')
    } catch (err) {
      toast.error(err.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  const handlePlaceOrder = payMethod === 'genie' ? handleGenieCheckout : handleBankTransfer

  if (items.length === 0) return (
    <div className="section text-center py-20">
      <div className="text-6xl mb-4">🛒</div>
      <p className="text-gray-500 text-lg">Your cart is empty</p>
    </div>
  )

  return (
    <>
      <Seo title="Checkout | Kesara Bathik" path="/checkout" />
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
        <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* ── LEFT: Address + Payment ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Step 1: Shipping */}
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-gold text-deep flex items-center justify-center text-sm font-bold">1</span>
                Shipping Address
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {validationError && <div className="col-span-2 text-sm text-red-600">{validationError}</div>}
                <div className="col-span-2">
                  <label className="text-sm font-semibold block mb-1">Full Name *</label>
                  <input required value={address.fullName}
                    onChange={e => {
                      setAddress(a => ({ ...a, fullName: e.target.value }))
                      if (validationError) setValidationError('')
                    }}
                    className="input" placeholder="Himal Perera" />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1">Email *</label>
                  <input type="email" required value={address.email}
                    onChange={e => {
                      setAddress(a => ({ ...a, email: e.target.value }))
                      if (validationError) setValidationError('')
                    }}
                    className="input" placeholder="you@email.com" />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1">Phone</label>
                  <input value={address.phone}
                    onChange={e => {
                      setAddress(a => ({ ...a, phone: e.target.value }))
                      if (validationError) setValidationError('')
                    }}
                    className="input" placeholder="0771234567" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-semibold block mb-1">Street Address *</label>
                  <input required value={address.address}
                    onChange={e => {
                      setAddress(a => ({ ...a, address: e.target.value }))
                      if (validationError) setValidationError('')
                    }}
                    className="input" placeholder="45 Temple Road" />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1">City *</label>
                  <input required value={address.city}
                    onChange={e => {
                      setAddress(a => ({ ...a, city: e.target.value }))
                      if (validationError) setValidationError('')
                    }}
                    className="input" placeholder="Colombo" />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1">State / Province</label>
                  <input value={address.state}
                    onChange={e => {
                      setAddress(a => ({ ...a, state: e.target.value }))
                      if (validationError) setValidationError('')
                    }}
                    className="input" placeholder="Western" />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1">Postal Code</label>
                  <input value={address.postalCode}
                    onChange={e => {
                      setAddress(a => ({ ...a, postalCode: e.target.value }))
                      if (validationError) setValidationError('')
                    }}
                    className="input" placeholder="00300" />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1">Country *</label>
                  <select required value={address.country}
                    onChange={e => setAddress(a => ({ ...a, country: e.target.value }))}
                    className="input">
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Payment */}
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-gold text-deep flex items-center justify-center text-sm font-bold">2</span>
                Payment Method
              </h2>

              {/* Method selector */}
              <div className={`grid ${genieAvailable ? 'grid-cols-2' : 'grid-cols-1'} gap-3 mb-6`}>
                {/* Genie card — available for every supported checkout currency */}
                {genieAvailable && (
                  <button
                    onClick={() => setPayMethod('genie')}
                    className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                      payMethod === 'genie'
                        ? 'border-gold bg-amber-50 shadow-md'
                        : 'border-gray-200 hover:border-gold/40'
                    }`}
                  >
                    <img src="/genie-logo.jpg" alt="Dialog Genie" className="h-8 object-contain rounded" />
                    <span className="text-xs font-semibold text-deep">Visa / Dialog Genie</span>
                    <span className="text-[10px] text-gray-400">Cards · Genie Wallet · QR</span>
                  </button>
                )}

                {/* Bank Transfer card */}
                <button
                  onClick={() => setPayMethod('bank_transfer')}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                    payMethod === 'bank_transfer'
                      ? 'border-gold bg-amber-50 shadow-md'
                      : 'border-gray-200 hover:border-gold/40'
                  }`}
                >
                  <div className="text-3xl">🏦</div>
                  <span className="text-xs font-semibold text-deep">Bank Transfer</span>
                  <span className="text-[10px] text-gray-400">HNB Direct Deposit</span>
                </button>
              </div>

              {!genieAvailable && (
                <p className="text-xs text-gray-500 mb-5">
                  Dialog Genie is not available for the selected checkout currency.
                </p>
              )}

              {/* Genie info panel */}
              {payMethod === 'genie' && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-5">
                  <div className="flex items-center gap-3 mb-3">
                    <img src="/genie-logo.jpg" alt="Genie" className="h-7 rounded" />
                    <div>
                      <p className="text-sm font-bold text-deep">Pay with Dialog Genie</p>
                      <p className="text-xs text-gray-500">
                        Pay securely in {checkoutCurrency} with Visa, Mastercard or Genie Wallet
                      </p>
                    </div>
                  </div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>✅ Secure, encrypted payment hosted by Dialog Genie</li>
                    <li>✅ The gateway amount matches your displayed {checkoutCurrency} order total</li>
                    {checkoutCurrency === 'LKR' ? (
                      <li>✅ LKR continues to use the separate Sri Lankan product price list</li>
                    ) : (
                      <li>✅ This amount is calculated from each product’s CAD price and the current CAD exchange rate</li>
                    )}
                    <li>✅ You'll be redirected to Genie's payment page</li>
                    <li>✅ Your order is confirmed instantly on payment success</li>
                  </ul>
                </div>
              )}

              {/* Bank Transfer info panel */}
              {payMethod === 'bank_transfer' && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 mb-5">
                  <p className="text-sm font-bold text-deep mb-3">🏦 HNB Bank Transfer Details</p>
                  <table className="w-full text-sm">
                    <tbody className="space-y-1">
                      {[
                        ['Bank',           HNB_ACCOUNT.bank],
                        ['Branch',         HNB_ACCOUNT.branch],
                        ['Account Number', HNB_ACCOUNT.account],
                        ['Account Name',   HNB_ACCOUNT.name],
                        ['Reference',      'Your Name + Order #'],
                      ].map(([label, value]) => (
                        <tr key={label}>
                          <td className="py-1 pr-3 text-gray-500 font-medium w-36">{label}</td>
                          <td className="py-1 font-semibold text-deep select-all">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-gray-500 mt-3 border-t border-blue-100 pt-3">
                    📱 After transferring, please send a screenshot of the receipt via
                    <a href="https://wa.me/94771234567" className="text-green-600 font-semibold ml-1" target="_blank" rel="noopener noreferrer">
                      WhatsApp
                    </a>.
                    Your order will be processed once payment is verified.
                  </p>
                </div>
              )}

              {/* Place Order button */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading || !addressComplete}
                className="btn-gold w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    {payMethod === 'genie' ? 'Redirecting to Genie...' : 'Placing order...'}
                  </>
                ) : payMethod === 'genie' ? (
                  <>
                    <img src="/genie-logo.jpg" alt="" className="h-5 rounded inline" />
                    Pay {formatCheckoutAmount(checkoutTotal)} via Genie →
                  </>
                ) : (
                  `Place Order · ${formatCheckoutAmount(checkoutTotal)}`
                )}
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">
                🔒 Payments secured by Dialog Genie · All transactions encrypted
              </p>
            </div>
          </div>

          {/* ── RIGHT: Order Summary ── */}
          <div>
            <div className="card p-6 sticky top-20">
              <h3 className="font-bold mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.key} className="flex gap-3">
                    <img
                      src={item.product.images?.[0]?.url || '/logo.png'}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      alt={item.product.name}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      {item.variant?.size  && <p className="text-xs text-gray-400">Size: {item.variant.size}</p>}
                      {item.variant?.color && <p className="text-xs text-gray-400">Colour: {item.variant.color}</p>}
                      <p className="text-sm font-bold text-gold">
                        {formatCheckoutAmount(getUnitPrice(item.product, checkoutCurrency, rates))} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span><span>{formatCheckoutAmount(checkoutSubtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span>
                    {checkoutShipping === 0
                      ? <span className="text-green-600 font-semibold">FREE 🎉</span>
                      : formatCheckoutAmount(checkoutShipping)
                    }
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span className="text-gold">{formatCheckoutAmount(checkoutTotal)}</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-4 pt-4 border-t flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <img src="/genie-logo.jpg" alt="Genie" className="h-5 rounded" />
                  <span className="text-xs text-gray-500">Visa / Dialog Genie accepted</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">🏦</span>
                  <span className="text-xs text-gray-500">HNB Bank Transfer</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">🔒</span>
                  <span className="text-xs text-gray-500">SSL Encrypted Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
