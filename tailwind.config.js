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
        brand: {
          bg: '#070b16',
          surface: '#0d1527',
          card: '#111b33',
          cardHover: '#162344',
          border: 'rgba(255, 255, 255, 0.08)',
          borderActive: '#00f2fe',
          cyan: '#00f2fe',
          teal: '#00e5ff',
          emerald: '#10b981',
          gold: '#fbbf24',
          amber: '#f59e0b',
          rose: '#f43f5e',
          muted: '#64748b',
          textMuted: '#94a3b8',
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(0, 242, 254, 0.25)',
        'glow-gold': '0 0 20px -3px rgba(251, 191, 36, 0.3)',
        'glow-rose': '0 0 20px -3px rgba(244, 63, 94, 0.25)',
      },
    },
  },
  plugins: [],
}
