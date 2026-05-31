import { Outlet, NavLink, Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '../../store'
import {
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiStar,
  FiBarChart2, FiMenu, FiX, FiLogOut, FiHome, FiChevronRight
} from 'react-icons/fi'

const NAV = [
  { to: '/admin', icon: FiGrid, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: FiPackage, label: 'Products' },
  { to: '/admin/orders', icon: FiShoppingBag, label: 'Orders' },
  { to: '/admin/users', icon: FiUsers, label: 'Users' },
  { to: '/admin/reviews', icon: FiStar, label: 'Reviews' },
  { to: '/admin/reports', icon: FiBarChart2, label: 'Reports & Finance' },
]

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const [open, setOpen] = useState(true)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${open ? 'w-60' : 'w-16'} bg-deep text-white flex flex-col transition-all duration-300 shrink-0`}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {open && (
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="KB" className="w-8 h-8 object-contain" />
              <div>
                <div className="text-xs font-bold text-gold leading-tight">කේසර බතික්</div>
                <div className="text-xs text-gray-400">Admin Panel</div>
              </div>
            </div>
          )}
          <button onClick={() => setOpen(o => !o)} className="p-1 rounded-lg hover:bg-white/10 transition-colors ml-auto">
            {open ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 mx-2 rounded-xl ${isActive ? 'bg-gold text-deep font-semibold' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`
              }
            >
              <Icon size={18} className="shrink-0" />
              {open && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          {open && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-deep font-bold text-sm shrink-0">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{user?.name}</div>
                <div className="text-xs text-gray-400 truncate">{user?.email}</div>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Link to="/" className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10">
              <FiHome size={14} />
              {open && 'View Store'}
            </Link>
            <button onClick={logout} className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-white/10 ml-auto">
              <FiLogOut size={14} />
              {open && 'Logout'}
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-2 text-sm text-gray-500 shrink-0">
          <FiChevronRight size={14} />
          <span>Admin</span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
