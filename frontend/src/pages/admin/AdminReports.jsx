import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { FiDownload, FiCalendar } from 'react-icons/fi'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function AdminReports() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [report, setReport] = useState(null)
  const [yearlyData, setYearlyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  const fetchReport = async () => {
    setLoading(true)
    try {
      const [monthly, yearly] = await Promise.all([
        api.get(`/reports/monthly?year=${year}&month=${month}`),
        api.get(`/reports/yearly?year=${year}`),
      ])
      setReport(monthly)
      setYearlyData(yearly)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchReport() }, [year, month])

  const handleDownloadPDF = async () => {
    setDownloading(true)
    try {
      const token = JSON.parse(localStorage.getItem('kb-auth') || '{}')?.state?.token
      const res = await fetch(`/api/reports/monthly/pdf?year=${year}&month=${month}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to generate PDF')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `kesara-batik-statement-${year}-${month}.pdf`; a.click()
      URL.revokeObjectURL(url)
      toast.success('Statement downloaded!')
    } catch (err) { toast.error(err.message) }
    finally { setDownloading(false) }
  }

  const summary = report?.summary || {}
  const chartData = yearlyData.map(d => ({
    month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d._id - 1],
    revenue: Math.round(d.revenue * 100) / 100,
    orders: d.orders
  }))

  const STAT_CARDS = [
    { label: 'Total Orders', value: summary.totalOrders || 0, color: 'bg-blue-50 text-blue-600' },
    { label: 'Paid Orders', value: summary.paidOrders || 0, color: 'bg-green-50 text-green-700' },
    { label: 'Gross Revenue', value: `CA$${(summary.totalRevenue || 0).toFixed(2)}`, color: 'bg-gold/10 text-gold-dark' },
    { label: 'Total Refunds', value: `CA$${(summary.refundedAmount || 0).toFixed(2)}`, color: 'bg-red-50 text-red-600' },
    { label: 'Net Revenue', value: `CA$${((summary.totalRevenue || 0) - (summary.refundedAmount || 0)).toFixed(2)}`, color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Avg Order Value', value: summary.paidOrders > 0 ? `CA$${(summary.totalRevenue / summary.paidOrders).toFixed(2)}` : 'CA$0', color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold text-deep">Reports & Finance</h1>
        <button onClick={handleDownloadPDF} disabled={downloading} className="btn-gold flex items-center gap-2 text-sm py-2 px-5">
          <FiDownload size={15} />{downloading ? 'Generating PDF…' : 'Download Statement PDF'}
        </button>
      </div>

      {/* Period Selector */}
      <div className="flex gap-3 mb-6 items-center bg-white border border-gray-100 rounded-2xl p-4 w-fit shadow-sm">
        <FiCalendar className="text-gold" size={18} />
        <select value={year} onChange={e => setYear(Number(e.target.value))} className="input w-auto text-sm py-1.5 bg-cream">
          {[2023,2024,2025,2026].map(y => <option key={y}>{y}</option>)}
        </select>
        <select value={month} onChange={e => setMonth(Number(e.target.value))} className="input w-auto text-sm py-1.5 bg-cream">
          {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
        </select>
        <span className="text-sm text-gray-500 font-medium">Statement</span>
        <span className="text-xs text-gray-400 bg-gold/10 text-gold px-2 py-0.5 rounded-full font-medium">Auto-generated on 20th each month</span>
      </div>

      {/* Summary Cards */}
      {loading ? <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">{[...Array(6)].map((_,i) => <div key={i} className="h-24 skeleton rounded-2xl" />)}</div> : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {STAT_CARDS.map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="font-display text-2xl font-bold text-deep mb-1">{value}</div>
              <div className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${color}`}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Annual Revenue Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
        <h3 className="font-bold text-deep mb-4">Annual Revenue {year} (CAD)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e8dc" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v, n) => [n === 'revenue' ? `CA$${v}` : v, n === 'revenue' ? 'Revenue' : 'Orders']} />
            <Bar dataKey="revenue" fill="#C8923A" radius={[4,4,0,0]} />
            <Bar dataKey="orders" fill="#1A1208" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-deep">Orders in {MONTHS[month-1]} {year}</h3>
          <span className="text-sm text-gray-500">{report?.orders?.length || 0} orders</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">{['Order #','Date','Customer','Country','Total','Status','Payment'].map(h => <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase">{h}</th>)}</tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>
              : (report?.orders || []).length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No orders this period</td></tr>
              : (report?.orders || []).map(o => (
                <tr key={o._id} className="border-t hover:bg-cream/30">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-gold">#{o.orderNumber}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{o.user?.name || 'Guest'}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{o.shippingAddress?.country}</td>
                  <td className="px-4 py-3 font-bold">CA${o.pricing?.total?.toFixed(2)}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${o.status==='delivered'?'bg-green-100 text-green-700':o.status==='cancelled'?'bg-red-100 text-red-600':'bg-blue-100 text-blue-700'}`}>{o.status}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.payment?.status==='paid'?'bg-green-100 text-green-700':o.payment?.status==='refunded'?'bg-gray-100 text-gray-600':'bg-yellow-100 text-yellow-700'}`}>{o.payment?.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
