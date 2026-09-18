/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 950: '#050d1a', 900: '#0A1628', 800: '#0f2040', 700: '#162a52', 600: '#1e3a6e' },
        cyan: { 400: '#00D4FF', 300: '#33dcff', 500: '#00b8e0' },
        emerald: { 400: '#00FF94', 500: '#00e085' },
        amber: { 400: '#FFB700' },
      },
      opacity: {
        3: '0.03',
        4: '0.04',
        5: '0.05',
        6: '0.06',
        8: '0.08',
        12: '0.12',
        15: '0.15',
        25: '0.25',
        35: '0.35',
      },
      fontFamily: {
        display: ['Clash Display', 'system-ui', 'sans-serif'],
        sans: ['Instrument Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-1': 'radial-gradient(at 40% 20%, hsla(198,100%,50%,0.1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(160,100%,50%,0.08) 0px, transparent 50%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scan': 'scan 2s ease-in-out infinite',
      },
      keyframes: {
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        scan: { '0%, 100%': { opacity: 0.4, transform: 'scaleX(0.95)' }, '50%': { opacity: 1, transform: 'scaleX(1)' } },
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 212, 255, 0.3)',
        'glow-green': '0 0 20px rgba(0, 255, 148, 0.25)',
        'glow-amber': '0 0 20px rgba(255, 183, 0, 0.3)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
