/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundColor: {
        'gray-100': '#f7f7f7',
        'gray-50': '#fafafa',
      }
    },
  },
  plugins: [],
}
