import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useWishlistStore } from '../../store'
import ProductCard from '../../components/shop/ProductCard'

export default function WishlistPage() {
  const { items } = useWishlistStore()
  return (
    <>
      <Helmet><title>My Wishlist | Kesara Batik</title></Helmet>
      <div className="section">
        <h1 className="font-display text-3xl font-bold mb-8">My Wishlist ❤️</h1>
        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-7xl mb-4">❤️</div>
            <p className="text-gray-500 text-lg mb-4">Your wishlist is empty</p>
            <Link to="/products" className="btn-gold">Discover Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {items.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </>
  )
}
