/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ErrandKart's core brand colors
        kart: {
          orange: "#FF6600", // Primary Action Color
          orangeHover: "#E65C00",
          light: "#FFF0E5", // Backgrounds for orange elements
        },
        market: {
          green: "#2E8B57", // Success states and accents
          light: "#EAF4ED",
        },
        asphalt: {
          grey: "#333333", // Text and dark elements
        }
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}