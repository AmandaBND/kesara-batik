// LoginPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuthStore } from '../../store'
import api from '../../utils/api'
import toast from 'react-hot-toast'

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

  const handleGoogle = () => {
    // Load Google Identity Services script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async ({ credential }) => {
          try {
            const data = await api.post('/auth/google', { credential })
            setAuth(data.user, data.token)
            toast.success(`Welcome, ${data.user.name}!`)
            navigate('/')
          } catch { toast.error('Google login failed') }
        }
      })
      window.google?.accounts.id.prompt()
    }
    document.body.appendChild(script)
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
            <button onClick={handleGoogle} className="w-full border border-gray-200 rounded-full py-3 text-sm font-medium hover:bg-cream transition-colors flex items-center justify-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>
            <p className="text-center text-sm text-gray-500 mt-4">Don't have an account? <Link to="/register" className="text-gold font-semibold hover:underline">Register</Link></p>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginPage
