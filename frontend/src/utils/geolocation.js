/**
 * Geolocation utility for detecting user country
 * Uses IP-based geolocation API
 */

const GEOLOCATION_API = 'https://ipapi.co/json/'

export async function detectCountry() {
  try {
    const response = await fetch(GEOLOCATION_API)
    if (!response.ok) throw new Error('Geolocation API error')
    const data = await response.json()
    return {
      country: data.country_name || null,
      countryCode: data.country_code || null,
      isFromSriLanka: (data.country_code || '').toUpperCase() === 'LK'
    }
  } catch (error) {
    console.warn('Failed to detect country:', error.message)
    return {
      country: null,
      countryCode: null,
      isFromSriLanka: false
    }
  }
}
