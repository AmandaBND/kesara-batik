import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiFeather,
  FiGlobe,
  FiMapPin,
  FiMessageCircle,
  FiPackage,
  FiRefreshCw,
  FiSend,
  FiShield,
} from 'react-icons/fi'
import ProductCard from '../../components/shop/ProductCard'
import Seo from '../../components/common/Seo'
import api from '../../utils/api'
import heroPeacockSaree from '../../assets/home/hero-peacock-saree.webp'
import womenCategoryImage from '../../assets/categories/women.png'
import menCategoryImage from '../../assets/categories/men.png'
import kidsCategoryImage from '../../assets/categories/kids.png'
import familyCategoryImage from '../../assets/categories/family.png'
import accessoriesCategoryImage from '../../assets/categories/accessories.png'

const CATEGORIES = [
  {
    name: 'Women',
    image: womenCategoryImage,
    desc: 'Sarees, Kurthas & more',
    href: '/products?parentCategory=Women',
  },
  {
    name: 'Men',
    image: menCategoryImage,
    desc: 'Shirts, Sarongs & kits',
    href: '/products?parentCategory=Men',
  },
  {
    name: 'Kids',
    image: kidsCategoryImage,
    desc: 'Batik styles for children',
    href: '/products?parentCategory=Kids',
  },
  {
    name: 'Family Kits',
    image: familyCategoryImage,
    desc: 'Matching sets for the family',
    href: '/products?parentCategory=Family+Kits',
  },
  {
    name: 'Accessories',
    image: accessoriesCategoryImage,
    desc: 'Bags, jewellery & more',
    href: '/products?parentCategory=Accessories',
  },
]

const HERO_HIGHLIGHTS = [
  {
    title: 'Ships to Overseas',
    description: 'Door-to-door delivery from Colombo',
    Icon: FiGlobe,
  },
  {
    title: '100% Handcrafted',
    description: 'Traditional wax-resist dyeing',
    Icon: FiFeather,
  },
  {
    title: 'Secure Payment',
    description: 'Dialog Genie & HNB Bank Transfer',
    Icon: FiShield,
  },
  {
    title: 'Easy Returns',
    description: '14-day return guarantee',
    Icon: FiRefreshCw,
  },
]

const TRUST_BADGES = [
  {
    title: 'International Shipping',
    description: '7–14 days tracked delivery',
    Icon: FiSend,
  },
  {
    title: 'Carefully Packaged',
    description: 'Arrives in pristine condition',
    Icon: FiPackage,
  },
  {
    title: 'Buyer Protection',
    description: 'Full 14-day return policy',
    Icon: FiShield,
  },
  {
    title: 'WhatsApp Support',
    description: 'Chat for sizing & tracking',
    Icon: FiMessageCircle,
  },
]

const TESTIMONIALS = [
  {
    name: 'Priya Fernando',
    loc: 'Toronto, Canada',
    text: 'Ordered two sarees and they arrived in 10 days beautifully packed. The quality is outstanding — my mother was in tears!',
    rating: 5,
  },
  {
    name: 'Rajiv Silva',
    loc: 'Vancouver, Canada',
    text: 'The batik shirts are exactly what I was looking for — authentic Sri Lankan craftsmanship at a fair price. Fast shipping!',
    rating: 5,
  },
  {
    name: 'Nishani Kumari',
    loc: 'Melbourne, Australia',
    text: 'Bought a family kit for Avurudu celebrations — we all matched beautifully! Will definitely order again.',
    rating: 5,
  },
]

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('products?featured=true&limit=8'),
      api.get('products?newArrival=true&limit=8'),
      api.get('products?trending=true&limit=4'),
    ]).then(([f, n, t]) => {
      setFeatured(f.products || [])
      setNewArrivals(n.products || [])
      setTrending(t.products || [])
    }).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Seo
        title="Kesara Bathik | Authentic Sri Lankan Handcrafted Batik Fashion"
        description="Shop authentic handcrafted Sri Lankan Batik sarees, sarongs, shirts and family kits. Free shipping to Canada & USA on orders over CA$120."
        path="/"
      />

      {/* HERO */}
      <section className="bg-gradient-to-br from-deep via-deep-brown to-[#3D2B0E] min-h-[600px] flex items-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C8923A' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
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
                <Link to="/products?newArrival=true" className="btn-outline-gold text-base">New Arrivals</Link>
              </div>
              <div className="flex gap-8 mt-10 pt-8 border-t border-white/10">
                {[
                  ['500+', 'Products'],
                  ['1200+', 'Happy Customers'],
                  ['15+', 'Countries'],
                ].map(([n, l]) => (
                  <div key={l}>
                    <div className="font-display text-2xl text-gold font-bold">{n}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">{l}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden lg:block relative min-h-[520px]"
            >
              <div className="absolute inset-y-0 right-[-4.5rem] w-[115%] pointer-events-none select-none">
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#2B1A0F] opacity-80" />
                <img
                  src={heroPeacockSaree}
                  alt="Kesara Bathik peacock saree"
                  className="absolute right-0 bottom-[-2.5rem] h-[620px] w-auto max-w-none object-contain object-right opacity-85 drop-shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
                />
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-4 max-w-[560px] ml-auto pt-10">
                {HERO_HIGHLIGHTS.map(({ title, description, Icon }) => (
                  <div
                    key={title}
                    className="bg-[#2B1A0F]/50 border border-gold/20 rounded-[1.75rem] p-6 backdrop-blur-md shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gold/15 border border-gold/20 text-gold flex items-center justify-center mb-4">
                      <Icon className="text-[1.4rem]" />
                    </div>
                    <h3 className="text-gold font-semibold text-sm mb-2">{title}</h3>
                    <p className="text-gray-300/75 text-xs leading-relaxed max-w-[14rem]">{description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-display text-3xl font-bold text-deep">Shop by <span className="text-gold">Category</span></h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
          {CATEGORIES.map((cat, i) => (
            <motion.div key={cat.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Link to={cat.href} className="group block overflow-hidden rounded-[1.75rem] border border-gold/15 bg-white shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                  <div className="absolute left-0 right-0 bottom-0 p-4 sm:p-5 text-white">
                    <h3 className="font-display text-xl font-bold leading-tight">{cat.name}</h3>
                    <p className="text-xs mt-1 text-white/85 leading-relaxed">{cat.desc}</p>
                  </div>
                </div>
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
          {TRUST_BADGES.map(({ title, description, Icon }) => (
            <div key={title} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl border border-gold/20 bg-gold/10 text-gold flex items-center justify-center shrink-0">
                <Icon className="text-[1.35rem]" />
              </div>
              <div>
                <h4 className="text-gold font-semibold text-sm">{title}</h4>
                <p className="text-gray-400 text-xs mt-1">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section">
        <h2 className="font-display text-3xl font-bold text-center mb-10">Customer <span className="text-gold">Love</span></h2>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="card p-6">
              <div className="flex text-gold mb-3">{[...Array(t.rating)].map((_, i) => <span key={i}>★</span>)}</div>
              <p className="text-gray-600 italic text-sm leading-relaxed mb-4">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-light flex items-center justify-center text-gold font-bold text-sm">{t.name[0]}</div>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1.5">
                    <FiMapPin className="text-gold" />
                    <span>{t.loc}</span>
                  </div>
                </div>
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
