/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0055A5',
          dark: '#003366',
        },
        secondary: {
          DEFAULT: '#D4AF37',
        }
      }
    },
  },
  plugins: [],
}