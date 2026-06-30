import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiStar, FiHeart, FiShoppingCart, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi'
import { useCartStore, useWishlistStore, useAuthStore, useCurrencyStore } from '../../store'
import { getAvailableStock, findVariant, hasVariants, getCartQtyForVariant } from '../../utils/stock'
import Seo from '../../components/common/Seo'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [mainImg, setMainImg] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [qty, setQty] = useState(1)
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)

  const { addItem, openCart, items } = useCartStore()
  const { toggle, has } = useWishlistStore()
  const { user } = useAuthStore()
  const { format } = useCurrencyStore()
  const wishlisted = product ? has(product._id) : false

  useEffect(() => {
    Promise.all([
      api.get(`products/${slug}`),
      api.get(`reviews/product/${slug}`).catch(() => ({ data: [] }))
    ]).then(([prod, revs]) => {
      setProduct(prod)
      setReviews(Array.isArray(revs) ? revs : [])
      const firstVariant = prod.variants?.find(v => (v.stock || 0) > 0) || prod.variants?.[0]
      if (firstVariant?.size) setSelectedSize(firstVariant.size)
      if (firstVariant?.color) setSelectedColor(firstVariant.color)
      setQty(1)
    }).catch(() => toast.error('Product not found')).finally(() => setLoading(false))
  }, [slug])

  const selectedVariant = product ? findVariant(product, { size: selectedSize, color: selectedColor }) : null
  const availableStock = product ? getAvailableStock(product, { size: selectedSize, color: selectedColor }) : 0
  const inCartQty = product ? getCartQtyForVariant(items, product._id, { size: selectedSize, color: selectedColor }) : 0
  const maxAddable = Math.max(0, availableStock - inCartQty)
  const isOutOfStock = hasVariants(product) ? !selectedVariant || availableStock === 0 : availableStock === 0

  useEffect(() => {
    if (qty > maxAddable && maxAddable > 0) setQty(maxAddable)
    else if (maxAddable === 0 && qty !== 1) setQty(1)
  }, [maxAddable, qty])

  const handleAddToCart = () => {
    if (!product) return
    if (hasVariants(product) && !selectedVariant) {
      return toast.error('Please select a valid size and color combination')
    }
    if (isOutOfStock) {
      return toast.error('This item is out of stock')
    }
    const result = addItem(product, { size: selectedSize, color: selectedColor }, qty)
    if (!result.success) {
      toast.error(result.message)
      return
    }
    if (result.capped) toast(result.message, { icon: '⚠️' })
    else toast.success('Added to cart!')
    openCart()
  }

  const handleReview = async (e) => {
    e.preventDefault()
    if (!user) return toast.error('Please login to leave a review')
    setSubmittingReview(true)
    try {
      const rev = await api.post(`reviews/product/${product._id}`, reviewForm)
      setReviews(prev => [rev, ...prev])
      setReviewForm({ rating: 5, title: '', comment: '' })
      toast.success('Review submitted!')
    } catch (err) { toast.error(err.message || 'Failed to submit') }
    finally { setSubmittingReview(false) }
  }

  if (loading) return <div className="section"><div className="skeleton h-96 rounded-2xl" /></div>
  if (!product) return <div className="section text-center py-20"><p>Product not found</p></div>

  const sizes = [...new Set(product.variants?.map(v => v.size).filter(Boolean))]
  const colorsForSize = selectedSize
    ? [...new Set(product.variants?.filter(v => v.size === selectedSize).map(v => v.color).filter(Boolean))]
    : [...new Set(product.variants?.map(v => v.color).filter(Boolean))]
  const discount = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0

  const isColorAvailable = (color) => {
    if (!selectedSize) return product.variants?.some(v => v.color === color && (v.stock || 0) > 0)
    return product.variants?.some(v => v.size === selectedSize && v.color === color && (v.stock || 0) > 0)
  }

  const isSizeAvailable = (size) => product.variants?.some(v => v.size === size && (v.stock || 0) > 0)

  return (
    <>
      <Seo
        title={`${product.name} | Kesara Bathik`}
        description={product.shortDescription || product.description?.slice(0, 160)}
        path={`/products/${slug}`}
        image={product.images?.[0]?.url}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex gap-2 flex-wrap">
          <Link to="/" className="hover:text-gold">Home</Link> /
          <Link to={`/products?parentCategory=${product.parentCategory}`} className="hover:text-gold">{product.parentCategory}</Link> /
          <span className="text-deep">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gold-50 mb-4">
              <motion.img key={mainImg} initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={product.images?.[mainImg]?.url || '/placeholder.jpg'} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setMainImg(i)} className={`shrink-0 w-20 h-24 rounded-xl overflow-hidden border-2 transition-all ${mainImg === i ? 'border-gold' : 'border-transparent'}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-deep leading-tight">{product.name}</h1>
              <button onClick={() => toggle(product)} className={`p-2 rounded-full border transition-all shrink-0 ${wishlisted ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400'}`}>
                <FiHeart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {product.rating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => <FiStar key={i} size={14} className={i < Math.round(product.rating) ? 'text-gold fill-gold' : 'text-gray-300'} fill={i < Math.round(product.rating) ? 'currentColor' : 'none'} />)}
                <span className="text-sm text-gray-500">{product.rating} ({product.reviewCount} reviews)</span>
              </div>
            )}

            <div className="flex items-center gap-3 mb-6">
              <span className="font-display text-3xl font-bold text-deep">{format(product.price, product)}</span>
              {product.comparePrice && <span className="text-lg text-gray-400 line-through">{format(product.comparePrice, product)}</span>}
              {discount > 0 && <span className="badge-sale">-{discount}%</span>}
            </div>

            {/* Details */}
            <div className="bg-cream rounded-xl p-4 mb-6 space-y-2 text-sm">
              {product.fabric && <p>👔 <strong>Fabric:</strong> {product.fabric}</p>}
              {product.length && <p>📏 <strong>Length:</strong> {product.length}</p>}
              {product.width && <p>↔️ <strong>Width:</strong> {product.width}</p>}
              {product.sku && <p>🏷️ <strong>SKU:</strong> {product.sku}</p>}
              <p className="text-xs text-gray-500 italic">Note: Actual color may slightly vary due to photographic lighting conditions.</p>
            </div>

            {/* Size Selection */}
            {sizes.length > 0 && (
              <div className="mb-5">
                <label className="text-sm font-semibold mb-2 block">Size: <span className="text-gold">{selectedSize || 'Select'}</span></label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(s => {
                    const available = isSizeAvailable(s)
                    return (
                      <button key={s} disabled={!available} onClick={() => {
                        setSelectedSize(s)
                        const nextColors = product.variants?.filter(v => v.size === s && v.color).map(v => v.color) || []
                        if (selectedColor && !nextColors.includes(selectedColor)) {
                          const fallback = product.variants?.find(v => v.size === s && (v.stock || 0) > 0)
                          setSelectedColor(fallback?.color || '')
                        }
                      }} className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${!available ? 'opacity-40 cursor-not-allowed line-through' : selectedSize === s ? 'bg-deep text-gold border-deep' : 'border-gray-200 hover:border-gold text-gray-600'}`}>{s}</button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Color */}
            {colorsForSize.length > 0 && (
              <div className="mb-5">
                <label className="text-sm font-semibold mb-2 block">Color: <span className="text-gold">{selectedColor || 'Select'}</span></label>
                <div className="flex flex-wrap gap-2">
                  {colorsForSize.map(c => {
                    const available = isColorAvailable(c)
                    return (
                      <button key={c} disabled={!available} onClick={() => setSelectedColor(c)} className={`px-4 py-2 rounded-lg border text-sm transition-all ${!available ? 'opacity-40 cursor-not-allowed line-through' : selectedColor === c ? 'border-gold text-gold' : 'border-gray-200 text-gray-600 hover:border-gold'}`}>{c}</button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Stock status */}
            <div className="mb-5">
              {isOutOfStock ? (
                <p className="text-sm font-semibold text-red-500">Out of stock</p>
              ) : availableStock <= 3 ? (
                <p className="text-sm font-semibold text-amber-600">Only {availableStock} left in stock</p>
              ) : (
                <p className="text-sm text-green-600">{availableStock} in stock</p>
              )}
            </div>

            {/* Qty */}
            <div className="flex items-center gap-4 mb-6">
              <label className="text-sm font-semibold">Qty:</label>
              <div className="flex items-center border rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q-1))} disabled={isOutOfStock} className="px-4 py-2 hover:bg-cream transition-colors text-lg disabled:opacity-40">−</button>
                <span className="px-4 py-2 font-medium min-w-[48px] text-center">{qty}</span>
                <button onClick={() => setQty(q => Math.min(maxAddable || 1, q+1))} disabled={isOutOfStock || qty >= maxAddable} className="px-4 py-2 hover:bg-cream transition-colors text-lg disabled:opacity-40">+</button>
              </div>
              {inCartQty > 0 && <span className="text-xs text-gray-500">{inCartQty} already in cart</span>}
            </div>

            <div className="flex gap-3 mb-6">
              <button onClick={handleAddToCart} disabled={isOutOfStock || maxAddable === 0} className="btn-deep flex-1 flex items-center justify-center gap-2 py-4 disabled:opacity-50 disabled:cursor-not-allowed"><FiShoppingCart /> {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</button>
              <a href={`https://wa.me/94XXXXXXXXXX?text=Hi, I want to order: ${product.name} (${window.location.href})`} target="_blank" rel="noopener noreferrer" className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-4 rounded-full transition-colors text-sm flex items-center gap-2">💬 Order via WhatsApp</a>
            </div>

            <div className="flex gap-6 text-xs text-gray-500">
              {[['✈️','Ships from Sri Lanka'],['🔒','Secure payment'],['🔄','14-day returns']].map(([i,t]) => <span key={t} className="flex items-center gap-1">{i} {t}</span>)}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-16 grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display text-2xl font-bold mb-4">Product Description</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
            {product.additionalInfo && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Additional Information</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {typeof product.additionalInfo === 'string' ? product.additionalInfo : JSON.stringify(product.additionalInfo, null, 2)}
                </p>
              </div>
            )}
          </div>

          {/* Reviews */}
          <div>
            <h2 className="font-display text-2xl font-bold mb-6">Customer Reviews ({reviews.length})</h2>
            {user && (
              <form onSubmit={handleReview} className="card p-5 mb-6">
                <h3 className="font-semibold mb-4">Write a Review</h3>
                <div className="flex gap-2 mb-3">
                  {[1,2,3,4,5].map(r => <button key={r} type="button" onClick={() => setReviewForm(f => ({...f, rating: r}))} className={`text-2xl transition-transform ${reviewForm.rating >= r ? 'text-gold scale-110' : 'text-gray-300'}`}>★</button>)}
                </div>
                <input className="input mb-3" placeholder="Title (optional)" value={reviewForm.title} onChange={e => setReviewForm(f => ({...f, title: e.target.value}))} />
                <textarea className="input mb-3" rows={3} placeholder="Share your experience..." required minLength={10} value={reviewForm.comment} onChange={e => setReviewForm(f => ({...f, comment: e.target.value}))} />
                <button type="submit" disabled={submittingReview} className="btn-gold">{submittingReview ? 'Submitting...' : 'Submit Review'}</button>
              </form>
            )}
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r._id} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gold-light flex items-center justify-center text-gold font-bold text-xs">{r.user?.name?.[0]}</div>
                      <div><div className="font-semibold text-sm">{r.user?.name}</div>{r.isVerifiedPurchase && <span className="text-xs text-green-600">✓ Verified Purchase</span>}</div>
                    </div>
                    <div className="flex text-gold text-sm">{[...Array(r.rating)].map((_,i) => <span key={i}>★</span>)}</div>
                  </div>
                  {r.title && <p className="font-medium text-sm mb-1">{r.title}</p>}
                  <p className="text-sm text-gray-600">{r.comment}</p>
                  {r.adminReply && <div className="mt-3 pl-3 border-l-2 border-gold bg-cream rounded-r-lg p-2"><p className="text-xs font-semibold text-gold">Kesara Bathik replied:</p><p className="text-sm text-gray-600">{r.adminReply}</p></div>}
                </div>
              ))}
              {reviews.length === 0 && <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
