// CartPage.jsx
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi'
import { useCartStore, useCurrencyStore } from '../../store'
import { getLineTotal, getUnitPrice } from '../../utils/pricing'
import toast from 'react-hot-toast'

export function CartPage() {
  const { items, removeItem, updateQty, subtotal, shipping, total } = useCartStore()
  const { formatAmount, currency, rates } = useCurrencyStore()

  const handleQtyChange = (key, qty) => {
    const result = updateQty(key, qty)
    if (result && !result.success) toast.error(result.message)
    else if (result?.capped) toast(result.message, { icon: '⚠️' })
  }

  return (
    <>
      <Helmet><title>Cart | Kesara Bathik</title></Helmet>
      <div className="section max-w-5xl">
        <h1 className="font-display text-3xl font-bold mb-8">Shopping Cart</h1>
        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-7xl mb-4">🛒</div>
            <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
            <Link to="/products" className="btn-gold">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div key={item.key} className="card p-4 flex gap-4">
                  <img src={item.product.images?.[0]?.url || '/placeholder.jpg'} alt={item.product.name} className="w-24 h-28 object-cover rounded-xl" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-deep">{item.product.name}</h3>
                    {item.variant?.size && <p className="text-sm text-gray-500 mt-0.5">Size: {item.variant.size}</p>}
                    {item.variant?.color && <p className="text-sm text-gray-500">Color: {item.variant.color}</p>}
                    <p className="text-gold font-bold mt-1">{formatAmount(getUnitPrice(item.product, currency, rates))}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border rounded-xl overflow-hidden">
                        <button onClick={() => handleQtyChange(item.key, item.quantity - 1)} className="px-3 py-1.5 hover:bg-cream transition-colors"><FiMinus size={12} /></button>
                        <span className="px-3 py-1.5 font-medium min-w-[36px] text-center text-sm">{item.quantity}</span>
                        <button onClick={() => handleQtyChange(item.key, item.quantity + 1)} className="px-3 py-1.5 hover:bg-cream transition-colors"><FiPlus size={12} /></button>
                      </div>
                      <button onClick={() => removeItem(item.key)} className="text-red-400 hover:text-red-600 transition-colors p-2"><FiTrash2 size={16} /></button>
                    </div>
                  </div>
                  <div className="text-right"><p className="font-bold text-deep font-display">{formatAmount(getLineTotal(item.product, item.quantity, currency, rates))}</p></div>
                </div>
              ))}
            </div>
            <div className="card p-6 h-fit sticky top-20">
              <h3 className="font-bold text-lg mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatAmount(subtotal())}</span></div>
                <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{currency === 'LKR' ? formatAmount(shipping()) : shipping() === 0 ? <span className="text-green-600 font-semibold">FREE 🎉</span> : formatAmount(shipping())}</span></div>
                {currency !== 'LKR' && shipping() > 0 && <p className="text-xs text-gray-400">Free shipping on orders over CA$120</p>}
                <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span className="text-gold">{formatAmount(total())}</span></div>
              </div>
              <Link to="/checkout" className="btn-gold w-full block text-center py-4">Proceed to Checkout →</Link>
              <Link to="/products" className="text-center block text-sm text-gray-500 hover:text-gold mt-3 transition-colors">← Continue Shopping</Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default CartPage
