import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuthStore } from '../../store'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import GoogleSignInButton from '../../components/auth/GoogleSignInButton'

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await api.post('/auth/login', form)
      setAuth(data.user, data.token)
      toast.success(`Welcome back, ${data.user.name}!`)
      navigate(data.user.role === 'admin' ? '/admin' : '/')
    } catch (err) { toast.error(err.message || 'Login failed') }
    finally { setLoading(false) }
  }

  const handleGoogleSuccess = (data) => {
    setAuth(data.user, data.token)
    toast.success(`Welcome, ${data.user.name}! 🎉`)
    navigate(data.user.role === 'admin' ? '/admin' : '/')
  }

  return (
    <>
      <Helmet><title>Login | Kesara Batik</title></Helmet>
      <div className="min-h-screen flex items-center justify-center bg-cream px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Kesara Batik" className="w-20 h-20 mx-auto mb-4 object-contain" />
            <h1 className="font-display text-3xl font-bold text-deep">Welcome Back</h1>
            <p className="text-gray-500 mt-2">Sign in to your Kesara Batik account</p>
          </div>
          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="text-sm font-semibold block mb-1">Email</label><input type="email" required value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="input" placeholder="you@example.com" /></div>
              <div><label className="text-sm font-semibold block mb-1">Password</label><input type="password" required value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} className="input" placeholder="••••••••" /></div>
              <button type="submit" disabled={loading} className="btn-gold w-full py-4 text-base">{loading ? 'Signing in...' : 'Sign In'}</button>
            </form>
            <div className="relative my-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div><div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-500">OR</span></div></div>
            <GoogleSignInButton context="signin" text="continue_with" onSuccess={handleGoogleSuccess} />
            <p className="text-center text-sm text-gray-500 mt-4">Don't have an account? <Link to="/register" className="text-gold font-semibold hover:underline">Register</Link></p>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginPage
