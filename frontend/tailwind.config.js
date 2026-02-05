/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          "ncsu-red": "#CC0000",
          "ncsu-gray": "#333333",
        },
        fontFamily: {
          roboto: ["Roboto", "sans-serif"],
          slab: ["Roboto Slab", "serif"],
        },
      },
    },
    plugins: [],
  }