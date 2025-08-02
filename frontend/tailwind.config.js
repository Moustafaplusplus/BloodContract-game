/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Blood Contract game theme colors - Enhanced black/red
        blood: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        hitman: {
          50: '#f8f9fa',
          100: '#1a1a1a',
          200: '#151515',
          300: '#121212',
          400: '#0f0f0f',
          500: '#0c0c0c',
          600: '#0a0a0a',
          700: '#080808',
          800: '#050505',
          900: '#030303',
          950: '#000000',
        },
        // Enhanced dark theme colors
        dark: {
          50: '#f8fafc',
          100: '#1e1e1e',
          200: '#191919',
          300: '#141414',
          400: '#101010',
          500: '#0d0d0d',
          600: '#0a0a0a',
          700: '#080808',
          800: '#050505',
          900: '#030303',
          950: '#000000',
        },
        // Accent colors for the game - Blood red focused
        accent: {
          red: '#dc2626',
          'red-dark': '#991b1b',
          'red-light': '#ef4444',
          orange: '#ea580c',
          yellow: '#fbbf24',
          green: '#10b981',
          blue: '#3b82f6',
          purple: '#8b5cf6',
        },
        // Game specific colors
        game: {
          'blood': '#dc2626',
          'blood-dark': '#991b1b',
          'blood-light': '#ef4444',
          'shadow': '#000000',
          'shadow-light': '#0a0a0a',
          'metal': '#4b5563',
          'gold': '#fbbf24',
        }
      },
      fontFamily: {
        'bouya': ['BouyaMessy', 'sans-serif'],
        'arabic': ['Noto Sans Arabic', 'sans-serif'],
      },
      screens: {
        'xs': '475px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'glow-blood': 'glowBlood 2s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        glowBlood: {
          '0%': { boxShadow: '0 0 5px #dc2626, 0 0 10px #dc2626, 0 0 15px #dc2626' },
          '100%': { boxShadow: '0 0 10px #dc2626, 0 0 20px #dc2626, 0 0 30px #dc2626' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      }
    },
  },
  plugins: [],
}
