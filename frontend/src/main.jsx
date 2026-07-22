import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

const rootElement = document.getElementById('root')

// SEO builds include a static route snapshot. Clear it immediately before
// React mounts so users receive the normal interactive application.
if (rootElement?.dataset?.prerendered === 'true') {
  rootElement.replaceChildren()
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1A1208', color: '#F5E6CB', borderRadius: '12px' },
          success: { iconTheme: { primary: '#C8923A', secondary: '#1A1208' } }
        }} />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
)
