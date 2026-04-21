/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx}', './index.html'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        primary:   '#8b5cf6',   // violet-500  — richer, more premium
        secondary: '#14b8a6',   // teal-500
        accent:    '#ec4899',   // pink-500
        surface:   'rgba(255,255,255,0.05)',
        // Named semantic shades
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
      },
      backdropBlur: { glass: '24px' },
      boxShadow: {
        glass:       '0 8px 40px rgba(0,0,0,0.45)',
        glow:        '0 0 24px rgba(139,92,246,0.45)',
        'glow-teal': '0 0 24px rgba(20,184,166,0.4)',
        premium:     '0 4px 28px rgba(109,40,217,0.18)',
      },
    },
  },
  plugins: [],
}
