/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFF4EE',
          100: '#FFE3CC',
          200: '#FFC99A',
          400: '#F97316',
          500: '#EA6000',
          600: '#C04E00',
          700: '#963C00',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};