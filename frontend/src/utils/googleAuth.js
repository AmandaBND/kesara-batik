const GOOGLE_SCRIPT_ID = 'google-gsi-client'
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

let scriptLoadPromise = null
let initializedClientId = null
let activeCallback = null

export function getGoogleClientId() {
  const id = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()
  if (!id || id.includes('your_google')) return null
  return id
}

export function setGoogleAuthCallback(callback) {
  activeCallback = callback
}

export function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (scriptLoadPromise) return scriptLoadPromise

  const existing = document.getElementById(GOOGLE_SCRIPT_ID)
  if (existing) {
    scriptLoadPromise = new Promise((resolve, reject) => {
      if (window.google?.accounts?.id) return resolve()
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Sign-In script')))
    })
    return scriptLoadPromise
  }

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = GOOGLE_SCRIPT_ID
    script.src = GOOGLE_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Sign-In script'))
    document.head.appendChild(script)
  })

  return scriptLoadPromise
}

export function initializeGoogleAuth(clientId) {
  if (!window.google?.accounts?.id) {
    throw new Error('Google Sign-In is not available')
  }

  if (initializedClientId !== clientId) {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => activeCallback?.(response),
      auto_select: false,
      cancel_on_tap_outside: true,
      use_fedcm_for_prompt: false,
    })
    initializedClientId = clientId
  }
}
