/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#070a13',
          darker: '#03050a',
          card: '#0d1322',
          border: '#1e293b',
          accent: '#38bdf8',
          glow: '#6366f1',
          neon: '#10b981',
          danger: '#ef4444',
          warning: '#f59e0b'
        }
      }
    },
  },
  plugins: [],
}
