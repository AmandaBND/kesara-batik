import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi'
import { useCartStore, useWishlistStore, useCurrencyStore } from '../../store'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const { addItem } = useCartStore()
  const { toggle, has } = useWishlistStore()
  const { format } = useCurrencyStore()
  const wishlisted = has(product._id)
  const discount = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0

  return (
    <motion.div whileHover={{ y: -6 }} className="card group bg-white overflow-hidden">
      <div className="relative overflow-hidden aspect-[3/4] bg-gold-50">
        <Link to={`/products/${product.slug}`}>
          <img
            src={product.images?.[0]?.url || '/placeholder.jpg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.isNewArrival && <span className="badge-new">New</span>}
          {product.isTrending && <span className="badge-hot">🔥 Hot</span>}
          {discount > 0 && <span className="badge-sale">-{discount}%</span>}
        </div>
        {/* Wishlist */}
        <button
          onClick={() => { toggle(product); toast(wishlisted ? 'Removed from wishlist' : '❤️ Added to wishlist') }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center transition-all duration-200 ${wishlisted ? 'text-red-500 scale-110' : 'text-gray-400 hover:text-red-400'}`}
        >
          <FiHeart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
        {/* Quick Add */}
        <div className="absolute bottom-0 left-0 right-0 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={() => { addItem(product); toast.success(`${product.name.slice(0,25)}... added!`) }}
            className="w-full bg-deep text-gold py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gold hover:text-deep transition-colors"
          >
            <FiShoppingCart size={16} /> Quick Add to Cart
          </button>
        </div>
      </div>

      <div className="p-4">
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-medium text-sm text-deep leading-tight mb-2 hover:text-gold transition-colors line-clamp-2">{product.name}</h3>
        </Link>
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <FiStar key={i} size={11} className={i < Math.round(product.rating) ? 'text-gold fill-gold' : 'text-gray-300'} fill={i < Math.round(product.rating) ? 'currentColor' : 'none'} />
            ))}
            <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-deep font-display">{format(product.price)}</span>
            {product.comparePrice && <span className="text-sm text-gray-400 line-through">{format(product.comparePrice)}</span>}
          </div>
          <span className="text-xs text-gray-500 capitalize">{product.fabric || ''}</span>
        </div>
      </div>
    </motion.div>
  )
}
