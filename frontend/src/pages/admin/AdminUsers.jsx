// AdminUsers.jsx
import { useEffect, useState } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetch = async () => {
    setLoading(true)
    try {
      const data = await api.get(`/admin/users?search=${search}`)
      setUsers(data.users || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [search])

  const toggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    if (!confirm(`Make ${user.name} a${newRole === 'admin' ? 'n admin' : ' regular user'}?`)) return
    try {
      const updated = await api.patch(`/admin/users/${user._id}`, { role: newRole })
      setUsers(us => us.map(u => u._id === user._id ? updated : u))
      toast.success('Role updated')
    } catch (err) { toast.error(err.message) }
  }

  const toggleActive = async (user) => {
    try {
      const updated = await api.patch(`/admin/users/${user._id}`, { isActive: !user.isActive })
      setUsers(us => us.map(u => u._id === user._id ? updated : u))
      toast.success(updated.isActive ? 'User activated' : 'User deactivated')
    } catch (err) { toast.error(err.message) }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-deep mb-6">Users</h1>
      <div className="relative mb-5 max-w-sm">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…" className="input pl-4 text-sm" />
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b">{['User','Email','Role','Joined','Status','Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase">{h}</th>)}</tr></thead>
          <tbody>
            {loading ? [...Array(5)].map((_,i) => <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="skeleton h-6 rounded" /></td></tr>)
            : users.map(u => (
              <tr key={u._id} className="border-t hover:bg-cream/30">
                <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-gold-light flex items-center justify-center text-gold font-bold text-xs shrink-0">{u.name?.[0]?.toUpperCase()}</div><span className="font-medium">{u.name}</span></div></td>
                <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${u.role==='admin'?'bg-gold/20 text-gold-dark':'bg-gray-100 text-gray-600'}`}>{u.role}</span></td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${u.isActive?'bg-green-100 text-green-700':'bg-red-100 text-red-600'}`}>{u.isActive?'Active':'Inactive'}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => toggleRole(u)} className="text-xs text-blue-500 hover:text-blue-700 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors">{u.role==='admin'?'Remove Admin':'Make Admin'}</button>
                    <button onClick={() => toggleActive(u)} className={`text-xs border px-2 py-1 rounded-lg transition-colors ${u.isActive?'text-red-500 border-red-200 hover:bg-red-50':'text-green-600 border-green-200 hover:bg-green-50'}`}>{u.isActive?'Deactivate':'Activate'}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
export default AdminUsers
function AdminUsers() { return <AdminUsers /> }
