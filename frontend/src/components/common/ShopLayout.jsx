import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore, useAuthStore, useWishlistStore, useCurrencyStore } from '../../store'
import { FiShoppingCart, FiHeart, FiUser, FiSearch, FiMenu, FiX, FiChevronDown, FiTrash2, FiPlus, FiMinus } from 'react-icons/fi'
import api from '../../utils/api'
import { detectCountry } from '../../utils/geolocation'
import { getUnitPrice } from '../../utils/pricing'
import toast from 'react-hot-toast'
import logo from '../../assets/logo.png'

const CATEGORIES = {
  Women: ["Women's Saree", "Women's Lungi", "Batik Kandyan designs", "Batik Frocks", "Batik Tops & Skirts", "Batik Tops & Pants", "Batik Kurtha Sets", "Batik Kaftan"],
  Men: ["Men's Avurudu Kits", "Men's Sarong", "Batik Shirts"],
  Kids: ["Kid's Focks", "Kid's Lama Saree", "Kids Shirts and Sarong"],
  'Family Kits': [],
  Accessories: ["Bags", "Jewellery", "Clutches", "Slippers", "Hair Accessories"],
}

export default function ShopLayout() {
  const { items, isOpen, closeCart, toggleCart, removeItem, updateQty, subtotal, itemCount, shipping, total } = useCartStore()
  const { user, logout } = useAuthStore()
  const { items: wishlist } = useWishlistStore()
  const { currency, setCurrency, formatAmount, setRates, isFromSriLanka, currencyLocked, setCountryInfo, rates } = useCurrencyStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // Detect user's country on first load
    const detectAndSetLocation = async () => {
      const geo = await detectCountry()
      setCountryInfo(geo.isFromSriLanka)
      
      if (geo.isFromSriLanka) {
        setCurrency('LKR')
        toast.success('Welcome! Currency locked to LKR 🇱🇰', { duration: 2 })
      }
    }
    
    detectAndSetLocation()
  }, [setCountryInfo, setCurrency])

  useEffect(() => {
    const fetchRates = () => {
      api.get('currency/rates').then(data => {
        if (data?.rates) setRates(data.rates, data.updatedAt)
      }).catch(() => {})
    }
    fetchRates()
    const interval = setInterval(fetchRates, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [setRates])

  const handleQtyChange = (key, qty) => {
    const result = updateQty(key, qty)
    if (result && !result.success) toast.error(result.message)
    else if (result?.capped) toast(result.message, { icon: '⚠️' })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) { navigate(`/products?search=${encodeURIComponent(search)}`); setSearch('') }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Announcement */}
      <div className="bg-deep text-gold-light text-center py-2 text-xs font-medium tracking-wide px-4">
        ✈️ Free shipping to Canada &amp; USA on orders over CA$120 &nbsp;|&nbsp; Ships from Colombo, Sri Lanka
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0">
             <img src={logo} alt="Kesara Bathik" className="h-10 w-10 object-contain" />
              <div className="hidden sm:block">
                <div className="font-display text-lg font-bold text-deep leading-tight">කේසර බතික්</div>
                <div className="text-xs text-gold font-medium tracking-widest">KESARA BATHIK</div>
              </div>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
              <div className="relative w-full">
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sarees, sarongs, shirts…" className="input pr-10 text-sm" />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gold"><FiSearch /></button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <select value={currency} onChange={e => setCurrency(e.target.value)} disabled={currencyLocked} className={`text-xs border border-gray-200 rounded-lg px-2 py-1 bg-cream focus:outline-none hidden sm:block ${currencyLocked ? 'opacity-60 cursor-not-allowed' : ''}`}>
                  {['CAD','USD','GBP','AED',...(isFromSriLanka ? ['LKR'] : []),'JPY','KRW'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {currencyLocked && <span className="text-xs text-gold font-semibold hidden sm:block" title="Currency locked for Sri Lanka">🔒</span>}
              </div>

              <Link to="/wishlist" className="relative p-2 text-deep hover:text-gold transition-colors hidden sm:block">
                <FiHeart size={20} />
                {wishlist.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{wishlist.length}</span>}
              </Link>

              {user ? (
                <div className="relative group hidden sm:block">
                  <button className="flex items-center gap-2 text-sm font-medium text-deep hover:text-gold transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gold-light flex items-center justify-center text-gold font-bold text-sm">
                      {user.avatar ? <img src={user.avatar} className="w-8 h-8 rounded-full object-cover" /> : user.name[0].toUpperCase()}
                    </div>
                  </button>
                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-50">
                    <Link to="/account" className="block px-4 py-2 text-sm hover:bg-cream hover:text-gold transition-colors">My Account</Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-cream hover:text-gold transition-colors">My Orders</Link>
                    {user.role === 'admin' && <Link to="/admin" className="block px-4 py-2 text-sm text-gold font-semibold hover:bg-cream transition-colors">Admin Panel</Link>}
                    <hr className="my-1" />
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">Logout</button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="hidden sm:flex items-center gap-1 text-sm font-medium text-deep hover:text-gold transition-colors">
                  <FiUser size={18} /> Login
                </Link>
              )}

              <button onClick={toggleCart} className="relative p-2 text-deep hover:text-gold transition-colors">
                <FiShoppingCart size={22} />
                {itemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold text-deep text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{itemCount()}</span>
                )}
              </button>

              <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-deep">
                {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="bg-deep hidden lg:block">
          <div className="max-w-7xl mx-auto px-8 flex">
            {Object.entries(CATEGORIES).map(([cat, subs]) => (
              <div key={cat} className="relative group">
                <Link to={`/products?parentCategory=${cat}`} className="flex items-center gap-1 px-4 py-3 text-sm text-gray-300 hover:text-gold transition-colors font-medium">
                  {cat} {subs.length > 0 && <FiChevronDown size={14} />}
                </Link>
                {subs.length > 0 && (
                  <div className="absolute top-full left-0 bg-white shadow-xl rounded-b-xl w-56 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border-t-2 border-gold">
                    {subs.map(s => (
                      <Link key={s} to={`/products?category=${encodeURIComponent(s)}`} className="block px-4 py-2 text-sm text-deep hover:text-gold hover:bg-cream transition-colors">{s}</Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link to="/products?newArrival=true" className="px-4 py-3 text-sm text-gold font-semibold hover:text-gold-light transition-colors ml-auto">✨ New Arrivals</Link>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="lg:hidden bg-white border-t shadow-lg py-4 px-4">
              {Object.entries(CATEGORIES).map(([cat, subs]) => (
                <div key={cat} className="mb-2">
                  <Link to={`/products?parentCategory=${cat}`} onClick={() => setMobileOpen(false)} className="block font-semibold text-deep py-2 border-b border-gray-100">{cat}</Link>
                  <div className="pl-4 mt-1">
                    {subs.map(s => <Link key={s} to={`/products?category=${encodeURIComponent(s)}`} onClick={() => setMobileOpen(false)} className="block text-sm text-gray-600 py-1 hover:text-gold">{s}</Link>)}
                  </div>
                </div>
              ))}
              {user ? (
                <div className="mt-4 pt-4 border-t">
                  <Link to="/account" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>My Account</Link>
                  <Link to="/orders" className="block py-2 text-sm" onClick={() => setMobileOpen(false)}>My Orders</Link>
                  <button onClick={() => { logout(); setMobileOpen(false) }} className="block py-2 text-sm text-red-500">Logout</button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block mt-4 btn-gold text-center">Login / Register</Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-deep text-gray-400 mt-20">
        <div className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="Kesara Bathik" className="h-12 w-12 object-contain" />
              <div>
                <div className="font-display text-white text-lg font-bold">කේසර බතික්</div>
                <div className="text-gold text-xs tracking-widest">KESARA BATHIK</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-500">Authentic handcrafted Sri Lankan Batik fashion. Shipped from Colombo to Canada, USA, UAE and worldwide.</p>
            <div className="flex gap-3 mt-4">
              {['f','📸','💬'].map((s,i) => <a key={i} href="#" className="w-9 h-9 border border-gold/30 rounded-full flex items-center justify-center text-gold hover:bg-gold hover:text-deep transition-colors text-sm">{s}</a>)}
            </div>
          </div>
          {[
            { title: 'Shop', links: [['Women', '/products?parentCategory=Women'], ["Men", '/products?parentCategory=Men'], ['Kids', '/products?parentCategory=Kids'], ['Family Kits', '/products?parentCategory=Family+Kits'], ['New Arrivals', '/products?newArrival=true']] },
            { title: 'Help', links: [['Privacy Policy', '/privacy-policy'], ['Return and Refund Policy', '/return-refund-policy'], ['Terms & Conditions', '/terms-and-conditions'], ['FAQs', '/faq']] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-gold text-xs font-bold uppercase tracking-widest mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(([label, href]) => <li key={label}><Link to={href} className="text-sm hover:text-gold transition-colors">{label}</Link></li>)}
              </ul>
            </div>
          ))}
          <div>
            <h4 className="text-gold text-xs font-bold uppercase tracking-widest mb-4">Contact</h4>
            <div className="space-y-3 text-sm">
              <p>📱 WhatsApp: +94 77 488 1013</p>
              <p>✉️ kesarabatik.info@gmail.com</p>
              <p>📍 Colombo, Sri Lanka 🇱🇰</p>
              <p className="text-xs text-gray-600 mt-4">Shipping to 🇨🇦 Canada · 🇺🇸 USA · 🇦🇪 UAE · 🇬🇧 UK · 🇯🇵 Japan · 🇰🇷 Korea & more</p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 py-6 px-8 flex flex-wrap items-center justify-between gap-4 max-w-7xl mx-auto">
          <p className="text-xs text-gray-600">© 2024 Kesara Bathik. All rights reserved.</p>
          <div className="flex gap-2">
            {['💳 Visa','💳 Mastercard','🔌 Dialog Genie','🏦 Bank Wire'].map(p => (
              <span key={p} className="text-xs px-2 py-1 border border-white/10 rounded text-gray-500">{p}</span>
            ))}
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeCart} className="fixed inset-0 bg-black/50 z-50" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="font-display text-xl font-bold">My Cart ({itemCount()})</h2>
                <button onClick={closeCart}><FiX size={22} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-4">🛒</div>
                    <p className="text-gray-500">Your cart is empty</p>
                    <button onClick={closeCart} className="mt-4 btn-gold">Continue Shopping</button>
                  </div>
                ) : items.map(item => (
                  <div key={item.key} className="flex gap-4 p-3 bg-cream rounded-xl">
                    <img src={item.product.images?.[0]?.url || '/placeholder.jpg'} alt={item.product.name} className="w-20 h-20 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold truncate">{item.product.name}</h4>
                      {item.variant.size && <p className="text-xs text-gray-500">Size: {item.variant.size}</p>}
                      <p className="text-gold font-bold mt-1">{formatAmount(getUnitPrice(item.product, currency, rates))}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => handleQtyChange(item.key, item.quantity - 1)} className="w-7 h-7 border rounded-full flex items-center justify-center hover:border-gold hover:text-gold transition-colors"><FiMinus size={12} /></button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <button onClick={() => handleQtyChange(item.key, item.quantity + 1)} className="w-7 h-7 border rounded-full flex items-center justify-center hover:border-gold hover:text-gold transition-colors"><FiPlus size={12} /></button>
                        <button onClick={() => removeItem(item.key)} className="ml-auto text-red-400 hover:text-red-600 transition-colors"><FiTrash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {items.length > 0 && (
                <div className="p-6 border-t bg-white">
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatAmount(subtotal())}</span></div>
                    <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{currency === 'LKR' ? formatAmount(shipping()) : shipping() === 0 ? <span className="text-green-600 font-semibold">FREE 🎉</span> : formatAmount(shipping())}</span></div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span className="text-gold">{formatAmount(total())}</span></div>
                  </div>
                  <Link to="/checkout" onClick={closeCart} className="btn-gold w-full block text-center">Checkout →</Link>
                  <p className="text-center text-xs text-gray-400 mt-3">🔒 Secure checkout · Dialog Genie & Bank Wire</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* WhatsApp Float */}
      <a href="https://wa.me/94XXXXXXXXXX" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 text-2xl">💬</a>
    </div>
  )
}
