import { useEffect, useRef, useState, useCallback } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { getGoogleClientId, loadGoogleScript, initializeGoogleAuth, setGoogleAuthCallback } from '../../utils/googleAuth'

export default function GoogleSignInButton({ context = 'signin', text = 'continue_with', onSuccess }) {
  const containerRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)
  const clientId = getGoogleClientId()

  const handleCredential = useCallback(async (response) => {
    if (!response?.credential) {
      toast.error('Google sign-in was cancelled')
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const data = await api.post('/auth/google', { credential: response.credential })
      onSuccess?.(data)
    } catch (err) {
      toast.error(err?.message || 'Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }, [onSuccess])

  useEffect(() => {
    setGoogleAuthCallback(handleCredential)
    return () => setGoogleAuthCallback(null)
  }, [handleCredential])

  useEffect(() => {
    if (!clientId) {
      setError('Google Sign-In is not configured. Add VITE_GOOGLE_CLIENT_ID to frontend/.env and restart the dev server.')
      return
    }

    let cancelled = false

    const setup = async () => {
      try {
        await loadGoogleScript()
        if (cancelled || !containerRef.current) return

        initializeGoogleAuth(clientId)

        const width = Math.min(Math.max(containerRef.current.offsetWidth || 360, 200), 400)
        containerRef.current.innerHTML = ''

        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text,
          shape: 'pill',
          width,
          context,
        })

        if (!cancelled) setReady(true)
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Could not load Google Sign-In')
          toast.error('Could not load Google Sign-In')
        }
      }
    }

    setup()
    return () => { cancelled = true }
  }, [clientId, context, text])

  if (error) {
    return <p className="text-xs text-red-500 text-center leading-relaxed">{error}</p>
  }

  return (
    <div className="w-full">
      {loading && (
        <p className="text-center text-sm text-gray-500 py-2 mb-1">Signing in...</p>
      )}
      {!ready && !loading && (
        <p className="text-center text-sm text-gray-400 py-3">Loading Google Sign-In...</p>
      )}
      <div
        ref={containerRef}
        className={`w-full flex justify-center min-h-[44px] ${loading ? 'opacity-50 pointer-events-none' : ''}`}
      />
    </div>
  )
}
