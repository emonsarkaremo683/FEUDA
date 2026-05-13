/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      colors: {
        paper: '#f5f5f5',
        ink: '#0a0a0a',
      },
      animation: {
        'bounce-in': 'bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'shake': 'shake 0.2s ease-in-out 0s 2',
      },
    },
  },
  plugins: [],
}
