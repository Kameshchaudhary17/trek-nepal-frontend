/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        forest: {
          50:  '#EAF2EE',
          100: '#D4E6DB',
          200: '#A9CDB7',
          300: '#7DB393',
          400: '#52996E',
          500: '#2D6A4F',
          600: '#1E4D38',
          700: '#163A2C',
          800: '#0E261E',
          900: '#071410',
        },
        terra: {
          50:  '#FEF3EE',
          100: '#FDE4D5',
          200: '#FBC9AA',
          300: '#F8A87E',
          400: '#F07850',
          500: '#C05621',
          600: '#A84A1B',
          700: '#8B3D15',
          800: '#6E300F',
          900: '#512309',
        },
        stone: {
          50:  '#F6F4EF',
          100: '#EDEBE3',
          200: '#DCD8CE',
          300: '#C4BFB4',
          400: '#A89E92',
          500: '#8B8077',
          600: '#6E6358',
          700: '#52483D',
          800: '#372E24',
          900: '#1D150D',
        },
      },
    },
  },
  plugins: [],
}
