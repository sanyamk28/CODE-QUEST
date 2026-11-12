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
          void: '#06080F',
          dark: '#070A13',
          darker: '#04060C',
          card: '#0D1322',
          surface: '#11192E',
          border: '#1E293B',
          cyan: '#00E5FF',
          accent: '#38BDF8',
          glow: '#6366F1',
          violet: '#8B5CF6',
          neon: '#10B981',
          danger: '#EF4444',
          warning: '#F59E0B'
        }
      },
      boxShadow: {
        'cyber-cyan': '0 0 25px -3px rgba(0, 229, 255, 0.35)',
        'cyber-indigo': '0 0 30px -3px rgba(99, 102, 241, 0.4)',
        'cyber-card': '0 10px 30px -5px rgba(0, 0, 0, 0.7)'
      }
    },
  },
  plugins: [],
}
