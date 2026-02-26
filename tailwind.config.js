/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          blue: '#1d4ed8', // Bright blue
          dark: '#000080', // Navy blue
          light: '#f3f4f6',
        }
      }
    }
  },
  plugins: [],
}