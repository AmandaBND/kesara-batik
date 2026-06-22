import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store'

// Layouts
import ShopLayout from './components/common/ShopLayout'
import ScrollToTop from './components/common/ScrollToTop'
import AdminLayout from './components/admin/AdminLayout'

// Shop Pages
import HomePage from './pages/shop/HomePage'
import ProductsPage from './pages/shop/ProductsPage'
import ProductDetailPage from './pages/shop/ProductDetailPage'
import CartPage from './pages/shop/CartPage'
import CheckoutPage from './pages/shop/CheckoutPage'
import OrderSuccessPage from './pages/shop/OrderSuccessPage'
import AccountPage from './pages/shop/AccountPage'
import OrdersPage from './pages/shop/OrdersPage'
import WishlistPage from './pages/shop/WishlistPage'
import LoginPage from './pages/shop/LoginPage'
import RegisterPage from './pages/shop/RegisterPage'
import PrivacyPolicy from './pages/shop/PrivacyPolicy'
import ReturnRefundPolicy from './pages/shop/ReturnRefundPolicy'
import TermsAndConditions from './pages/shop/TermsAndConditions'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminProductForm from './pages/admin/AdminProductForm'
import AdminOrders from './pages/admin/AdminOrders'
import AdminOrderDetail from './pages/admin/AdminOrderDetail'
import AdminUsers from './pages/admin/AdminUsers'
import AdminReviews from './pages/admin/AdminReviews'
import AdminReports from './pages/admin/AdminReports'

function AdminRoute({ children }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function ProtectedRoute({ children }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      {/* Shop Routes */}
      <Route path="/" element={<ShopLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:slug" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order-success/:id" element={<OrderSuccessPage />} />
        <Route path="account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
        <Route path="orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="return-refund-policy" element={<ReturnRefundPolicy />} />
        <Route path="terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="women" element={<ProductsPage />} />
        <Route path="men" element={<ProductsPage />} />
        <Route path="kids" element={<ProductsPage />} />
        <Route path="family-kits" element={<ProductsPage />} />
        <Route path="accessories" element={<ProductsPage />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductForm />} />
        <Route path="products/:id/edit" element={<AdminProductForm />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>
    </Routes>
    </>
  )
}
