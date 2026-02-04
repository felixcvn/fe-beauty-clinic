/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B4D3E', // Dark Green
          light: '#2C6E5A',
          dark: '#113329',
        },
        secondary: {
          DEFAULT: '#F5F5DC', // Beige
          light: '#F9F9EA',
          dark: '#EBEBC2',
        },
        accent: {
          gold: '#D4AF37', // Luxurious accent
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Professional look
      },
    },
  },
  plugins: [],
}
