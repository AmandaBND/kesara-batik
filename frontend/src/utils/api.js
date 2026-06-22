import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem('kb-auth') || '{}')
  const token = auth?.state?.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const status = err.response?.status
    const url = err.config?.url || ''
    const onAuthPage = ['/login', '/register'].includes(window.location.pathname)
    const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/google')

    if (status === 401 && !isAuthRequest && !onAuthPage) {
      localStorage.removeItem('kb-auth')
      window.location.href = '/login'
    }
    return Promise.reject(err.response?.data || err)
  }
)

export default api
