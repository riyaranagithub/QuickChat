/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [ "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",],
  theme: {
    extend: {
      fontFamily: {
        Rubik: ["Rubik Vinyl"," serif"],
        Noto:["Noto Sans KR", "serif"] // Add your Google Font
      },
    },
  },
  plugins: [],
}

