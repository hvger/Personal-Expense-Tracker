/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/App.js",
    "./src/index.js",
    "./public/index.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    'bg-red-500',
    'text-white',
    'p-8',
    'text-center',
    'text-4xl',
    'font-bold',
    'mt-4'
  ]
}
