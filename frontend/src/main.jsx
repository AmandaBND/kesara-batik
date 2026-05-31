import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
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
