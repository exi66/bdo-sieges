/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/main.js', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        accent: '#c34528',
        shark: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#222222',
          950: '#1a1a1a'
        }
      }
    }
  },
  plugins: []
}
