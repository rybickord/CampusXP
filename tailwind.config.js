/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: '#0a0a0a',
          50: '#1a1a1a',
          100: '#141414',
          200: '#222222',
          300: '#2a2a2a',
        },
        neon: {
          DEFAULT: '#00ff41',
          dim: '#00cc34',
          glow: 'rgba(0, 255, 65, 0.35)',
        },
        danger: {
          DEFAULT: '#dc2626',
          glow: 'rgba(220, 38, 38, 0.45)',
          dark: '#991b1b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 20px rgba(0, 255, 65, 0.35), 0 0 40px rgba(0, 255, 65, 0.15)',
        'neon-sm': '0 0 12px rgba(0, 255, 65, 0.3)',
        danger: '0 0 20px rgba(220, 38, 38, 0.5), 0 0 40px rgba(220, 38, 38, 0.2)',
      },
      animation: {
        'pulse-danger': 'pulse-danger 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-danger': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(220, 38, 38, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(220, 38, 38, 0.7), 0 0 60px rgba(220, 38, 38, 0.3)' },
        },
      },
    },
  },
  plugins: [],
}
