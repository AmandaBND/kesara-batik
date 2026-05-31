/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: { DEFAULT: '#C8923A', light: '#F5E6CB', dark: '#8B6320', 50: '#FDF8EF' },
        deep: { DEFAULT: '#1A1208', brown: '#2C1F0A' },
        cream: '#FAF7F2',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
