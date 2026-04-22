/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx}', './index.html'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#a855f7',
        secondary: '#14b8a6',
        accent: '#ec4899',
        surface: 'rgba(255,255,255,0.05)',
        // Theme-aware semantic colors (work in both light & dark)
        th: {
          text:    'rgb(var(--th-text) / <alpha-value>)',
          sec:     'rgb(var(--th-text-sec) / <alpha-value>)',
          muted:   'rgb(var(--th-muted) / <alpha-value>)',
          surface: 'rgb(var(--th-surface) / <alpha-value>)',
          border:  'rgb(var(--th-border) / <alpha-value>)',
        },
      },
      backdropBlur: { glass: '20px' },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.37)',
        glow: '0 0 20px rgba(168,85,247,0.4)',
        'glow-teal': '0 0 20px rgba(20,184,166,0.4)',
      },
    },
  },
  plugins: [],
}
