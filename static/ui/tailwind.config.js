/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './public/index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#137fec',
        'background-light': '#f8fafc',
        'background-dark': '#0f172a',
        'pastel-blue': '#e0f2fe',
        'pastel-green': '#f0fdf4',
        'pastel-yellow': '#fefce8',
        'pastel-purple': '#f5f3ff',
        'pastel-red': '#fef2f2',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
