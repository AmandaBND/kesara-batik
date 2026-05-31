import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import ProductCard from '../../components/shop/ProductCard'
import api from '../../utils/api'

const CATEGORIES = [
  { name: 'Women', icon: '👘', desc: 'Sarees, Kurthas, Frocks & more', href: '/products?parentCategory=Women', color: 'from-pink-100 to-rose-200' },
  { name: 'Men', icon: '👔', desc: 'Shirts, Sarongs & Avurudu Kits', href: '/products?parentCategory=Men', color: 'from-blue-100 to-blue-200' },
  { name: 'Kids', icon: '🧒', desc: 'Frocks, Sarees & Shirts', href: '/products?parentCategory=Kids', color: 'from-yellow-100 to-amber-200' },
  { name: 'Family Kits', icon: '👨‍👩‍👧‍👦', desc: 'Matching sets for the family', href: '/products?parentCategory=Family+Kits', color: 'from-green-100 to-emerald-200' },
  { name: 'Accessories', icon: '👜', desc: 'Bags, Jewellery & more', href: '/products?parentCategory=Accessories', color: 'from-purple-100 to-violet-200' },
]

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/products?featured=true&limit=8'),
      api.get('/products?newArrival=true&limit=8'),
      api.get('/products?trending=true&limit=4'),
    ]).then(([f, n, t]) => {
      setFeatured(f.products || [])
      setNewArrivals(n.products || [])
      setTrending(t.products || [])
    }).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Helmet>
        <title>Kesara Batik | Authentic Sri Lankan Handcrafted Batik Fashion</title>
        <meta name="description" content="Shop authentic handcrafted Sri Lankan Batik sarees, sarongs, shirts and family kits. Free shipping to Canada & USA on orders over CA$120." />
      </Helmet>

      {/* HERO */}
      <section className="bg-gradient-to-br from-deep via-deep-brown to-[#3D2B0E] min-h-[600px] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C8923A' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E\")"}} />
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-4">Authentic Sri Lankan Craftsmanship</p>
              <h1 className="font-display text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                කේසර<br /><em className="text-gold not-italic">බතික්</em><br />
                <span className="text-3xl lg:text-4xl">Fashion</span>
              </h1>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed max-w-lg">
                Handcrafted in the heart of Sri Lanka. Every piece carries centuries of artisan tradition — shipped to Canada, USA, UAE and worldwide.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products" className="btn-gold text-base">Shop Collection</Link>
                <Link to="/products?newArrival=true" className="btn-outline-gold text-base">New Arrivals ✨</Link>
              </div>
              <div className="flex gap-8 mt-10 pt-8 border-t border-white/10">
                {[['500+','Products'],['1200+','Happy Customers'],['15+','Countries']].map(([n,l]) => (
                  <div key={l}><div className="font-display text-2xl text-gold font-bold">{n}</div><div className="text-xs text-gray-500 uppercase tracking-wide">{l}</div></div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="hidden lg:grid grid-cols-2 gap-4">
              {[['✈️','Ships to Canada','Door-to-door delivery from Colombo'],['🎨','100% Handcrafted','Traditional wax-resist dyeing'],['🔒','Secure Payment','PayPal, Stripe & Google Pay'],['🔄','Easy Returns','14-day return guarantee']].map(([icon,t,d]) => (
                <div key={t} className="bg-white/5 border border-gold/20 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="text-3xl mb-3">{icon}</div>
                  <h3 className="text-gold font-semibold text-sm mb-2">{t}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{d}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-display text-3xl font-bold text-deep">Shop by <span className="text-gold">Category</span></h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div key={cat.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Link to={cat.href} className={`block p-6 rounded-2xl bg-gradient-to-br ${cat.color} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center`}>
                <div className="text-4xl mb-3">{cat.icon}</div>
                <h3 className="font-bold text-deep text-sm">{cat.name}</h3>
                <p className="text-xs text-gray-600 mt-1 hidden sm:block">{cat.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="bg-gold-50 py-16">
        <div className="section">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-display text-3xl font-bold text-deep">New <span className="text-gold">Arrivals</span></h2>
            <Link to="/products?newArrival=true" className="text-gold text-sm font-semibold border-b border-gold pb-0.5 hover:opacity-70 transition-opacity">View All →</Link>
          </div>
          {loading ? <ProductGridSkeleton /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {newArrivals.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* FEATURED */}
      <section className="section">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-display text-3xl font-bold text-deep">Featured <span className="text-gold">Products</span></h2>
          <Link to="/products?featured=true" className="text-gold text-sm font-semibold border-b border-gold pb-0.5 hover:opacity-70">View All →</Link>
        </div>
        {loading ? <ProductGridSkeleton /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {featured.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* TRUST BADGES */}
      <section className="bg-deep py-12">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[['✈️','International Shipping','7–14 days tracked delivery'],['📦','Carefully Packaged','Arrives in pristine condition'],['🛡️','Buyer Protection','Full 14-day return policy'],['💬','WhatsApp Support','Chat for sizing & tracking']].map(([icon,t,d]) => (
            <div key={t} className="flex items-center gap-4">
              <div className="text-3xl shrink-0">{icon}</div>
              <div><h4 className="text-gold font-semibold text-sm">{t}</h4><p className="text-gray-500 text-xs mt-1">{d}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section">
        <h2 className="font-display text-3xl font-bold text-center mb-10">Customer <span className="text-gold">Love</span></h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name:'Priya Fernando', loc:'Toronto, Canada', text:"Ordered two sarees and they arrived in 10 days beautifully packed. The quality is outstanding — my mother was in tears!", rating:5 },
            { name:'Rajiv Silva', loc:'Vancouver, Canada', text:"The batik shirts are exactly what I was looking for — authentic Sri Lankan craftsmanship at a fair price. Fast shipping!", rating:5 },
            { name:'Nishani Kumari', loc:'Melbourne, Australia', text:"Bought a family kit for Avurudu celebrations — we all matched beautifully! Will definitely order again.", rating:5 },
          ].map(t => (
            <div key={t.name} className="card p-6">
              <div className="flex text-gold mb-3">{[...Array(t.rating)].map((_,i) => <span key={i}>★</span>)}</div>
              <p className="text-gray-600 italic text-sm leading-relaxed mb-4">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-light flex items-center justify-center text-gold font-bold text-sm">{t.name[0]}</div>
                <div><div className="font-semibold text-sm">{t.name}</div><div className="text-xs text-gray-500">📍 {t.loc}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="skeleton aspect-[3/4]" />
          <div className="p-4 space-y-2"><div className="skeleton h-4 rounded w-3/4" /><div className="skeleton h-4 rounded w-1/2" /></div>
        </div>
      ))}
    </div>
  )
}
