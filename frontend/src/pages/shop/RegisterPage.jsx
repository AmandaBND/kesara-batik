// RegisterPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuthStore } from '../../store'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      const data = await api.post('/auth/register', { name: form.name, email: form.email, password: form.password })
      setAuth(data.user, data.token)
      toast.success('Account created! Welcome to Kesara Batik 🎉')
      navigate('/')
    } catch (err) { toast.error(err.message || 'Registration failed') }
    finally { setLoading(false) }
  }

  return (
    <>
      <Helmet><title>Create Account | Kesara Batik</title></Helmet>
      <div className="min-h-screen flex items-center justify-center bg-cream px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Kesara Batik" className="w-20 h-20 mx-auto mb-4 object-contain" />
            <h1 className="font-display text-3xl font-bold text-deep">Create Account</h1>
            <p className="text-gray-500 mt-2">Join the Kesara Batik family</p>
          </div>
          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="text-sm font-semibold block mb-1">Full Name</label><input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="input" placeholder="Your full name" /></div>
              <div><label className="text-sm font-semibold block mb-1">Email</label><input type="email" required value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="input" placeholder="you@example.com" /></div>
              <div><label className="text-sm font-semibold block mb-1">Password</label><input type="password" required minLength={6} value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} className="input" placeholder="Min 6 characters" /></div>
              <div><label className="text-sm font-semibold block mb-1">Confirm Password</label><input type="password" required value={form.confirm} onChange={e => setForm(f => ({...f, confirm: e.target.value}))} className="input" placeholder="Repeat password" /></div>
              <button type="submit" disabled={loading} className="btn-gold w-full py-4">{loading ? 'Creating account...' : 'Create Account'}</button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-4">Already have an account? <Link to="/login" className="text-gold font-semibold">Login</Link></p>
          </div>
        </div>
      </div>
    </>
  )
}
