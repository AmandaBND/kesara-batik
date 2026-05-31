import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { FiTrendingUp, FiShoppingBag, FiUsers, FiPackage, FiArrowUp, FiArrowDown } from 'react-icons/fi'
import api from '../../utils/api'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const STATUS_COLORS = { pending:'#F59E0B', confirmed:'#3B82F6', processing:'#8B5CF6', shipped:'#6366F1', delivered:'#10B981', cancelled:'#EF4444', refunded:'#6B7280' }
const CHART_COLORS = ['#C8923A','#1A1208','#F59E0B','#10B981','#3B82F6','#8B5CF6','#EF4444']

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard').then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 skeleton rounded-2xl" />)}
      </div>
      <div className="h-72 skeleton rounded-2xl" />
    </div>
  )

  const stats = data?.stats || {}
  const chartData = (data?.revenueByMonth || []).map(d => ({
    month: MONTHS[d._id.month - 1],
    revenue: Math.round(d.revenue * 100) / 100,
    orders: d.orders,
  }))
  const pieData = (data?.ordersByStatus || []).map(d => ({ name: d._id, value: d.count }))

  const STAT_CARDS = [
    { label: 'Total Revenue', value: `CA$${(stats.totalRevenue || 0).toFixed(2)}`, sub: `CA$${(stats.monthRevenue || 0).toFixed(2)} this month`, icon: FiTrendingUp, color: 'bg-gold/10 text-gold', growth: stats.revenueGrowth },
    { label: 'Total Orders', value: stats.totalOrders || 0, sub: `${stats.pendingOrders || 0} pending`, icon: FiShoppingBag, color: 'bg-blue-50 text-blue-600' },
    { label: 'Customers', value: stats.totalUsers || 0, sub: 'Registered users', icon: FiUsers, color: 'bg-green-50 text-green-600' },
    { label: 'Products', value: stats.totalProducts || 0, sub: 'Active listings', icon: FiPackage, color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-deep">Dashboard</h1>
        <Link to="/admin/reports" className="btn-gold text-sm py-2 px-4">📊 Reports</Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, sub, icon: Icon, color, growth }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}><Icon size={18} /></div>
              {growth !== undefined && (
                <div className={`flex items-center gap-1 text-xs font-medium ${Number(growth) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {Number(growth) >= 0 ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />}
                  {Math.abs(growth)}%
                </div>
              )}
            </div>
            <div className="font-display text-2xl font-bold text-deep">{value}</div>
            <div className="text-xs text-gray-500 mt-1">{sub}</div>
            <div className="text-xs font-semibold text-gray-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-deep mb-4">Revenue This Year (CAD)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C8923A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C8923A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e8dc" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`CA$${v}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#C8923A" strokeWidth={2} fill="url(#goldGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-deep mb-4">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={STATUS_COLORS[entry.name] || CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {pieData.slice(0, 5).map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[d.name] || CHART_COLORS[i] }} />{d.name}</span>
                <span className="font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-deep">Recent Orders</h3>
          <Link to="/admin/orders" className="text-sm text-gold hover:underline">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">{['Order #','Customer','Date','Total','Status','Payment'].map(h => <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody>
              {(data?.recentOrders || []).map(order => (
                <tr key={order._id} className="border-t border-gray-50 hover:bg-cream/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-gold">
                    <Link to={`/admin/orders/${order._id}`} className="hover:underline">#{order.orderNumber}</Link>
                  </td>
                  <td className="px-4 py-3">{order.user?.name || order.guestEmail || 'Guest'}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-semibold">CA${order.pricing.total.toFixed(2)}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${order.status==='delivered'?'bg-green-100 text-green-700':order.status==='pending'?'bg-yellow-100 text-yellow-700':'bg-blue-100 text-blue-700'}`}>{order.status}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${order.payment.status==='paid'?'bg-green-100 text-green-700':order.payment.status==='pending'?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700'}`}>{order.payment.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-deep">Top Selling Products</h3>
          <Link to="/admin/products" className="text-sm text-gold hover:underline">Manage →</Link>
        </div>
        <div className="space-y-3">
          {(data?.topProducts || []).map((p, i) => (
            <div key={p._id} className="flex items-center gap-4">
              <span className="w-6 h-6 rounded-full bg-gold-light text-gold-dark text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <img src={p.images?.[0]?.url || '/placeholder.jpg'} alt={p.name} className="w-12 h-12 object-cover rounded-lg" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{p.name}</p>
                <p className="text-xs text-gray-500">{p.soldCount} sold · ⭐ {p.rating}</p>
              </div>
              <span className="font-bold text-deep text-sm shrink-0">CA${p.price}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
