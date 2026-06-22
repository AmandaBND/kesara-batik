import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation()

  useEffect(() => {
    // Smoothly scroll to top on route changes
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    } catch (e) {
      window.scrollTo(0, 0)
    }
  }, [pathname, search, hash])

  return null
}
