/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  // Forzar el orden para que Tailwind tenga precedencia sobre el CSS de Ionic
  important: '#app',
  theme: {
    extend: {
      colors: {
        // Paleta CMMS ProMaintenance
        primary: {
          50: '#eef4ff',
          100: '#dce8ff',
          200: '#bcd0ff',
          300: '#8eaeff',
          400: '#5d83ff',
          500: '#3a5cff',
          600: '#2239f5',
          700: '#1a2bd1',
          800: '#1b27a7',
          900: '#1d2883',
        },
        hse: {
          safe: '#16a34a',
          warn: '#f59e0b',
          danger: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
