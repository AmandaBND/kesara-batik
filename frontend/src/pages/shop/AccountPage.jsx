// AccountPage.jsx
import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAuthStore } from '../../store'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export function AccountPage() {
  const { user, setAuth } = useAuthStore()
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const handleProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const updated = await api.put('auth/profile', form)
      setAuth(updated, JSON.parse(localStorage.getItem('kb-auth'))?.state?.token)
      toast.success('Profile updated!')
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const handlePassword = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match')
    try {
      await api.put('auth/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      toast.success('Password changed!')
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) { toast.error(err.message) }
  }

  return (
    <>
      <Helmet><title>My Account | Kesara Batik</title></Helmet>
      <div className="section max-w-2xl">
        <h1 className="font-display text-3xl font-bold mb-8">My Account</h1>
        <div className="card p-6 mb-6">
          <h2 className="font-bold text-lg mb-4">Profile Information</h2>
          <form onSubmit={handleProfile} className="space-y-4">
            <div><label className="text-sm font-semibold block mb-1">Full Name</label><input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="input" /></div>
            <div><label className="text-sm font-semibold block mb-1">Email</label><input value={user?.email} disabled className="input opacity-60 cursor-not-allowed" /></div>
            <div><label className="text-sm font-semibold block mb-1">Phone</label><input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} className="input" placeholder="+1 XXX XXX XXXX" /></div>
            <button type="submit" disabled={loading} className="btn-gold">{loading ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
        {!user?.googleId && (
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-4">Change Password</h2>
            <form onSubmit={handlePassword} className="space-y-4">
              <div><label className="text-sm font-semibold block mb-1">Current Password</label><input type="password" required value={pwForm.currentPassword} onChange={e => setPwForm(f => ({...f, currentPassword: e.target.value}))} className="input" /></div>
              <div><label className="text-sm font-semibold block mb-1">New Password</label><input type="password" required minLength={6} value={pwForm.newPassword} onChange={e => setPwForm(f => ({...f, newPassword: e.target.value}))} className="input" /></div>
              <div><label className="text-sm font-semibold block mb-1">Confirm New Password</label><input type="password" required value={pwForm.confirm} onChange={e => setPwForm(f => ({...f, confirm: e.target.value}))} className="input" /></div>
              <button type="submit" className="btn-gold">Change Password</button>
            </form>
          </div>
        )}
      </div>
    </>
  )
}

export default AccountPage
