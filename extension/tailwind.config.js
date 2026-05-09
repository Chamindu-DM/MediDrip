/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'instrument': ['"Instrument Sans"', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: '#2600FF',
          green: '#00B649',
          gray: '#CCCCCC',
        },
      },
    },
  },
  plugins: [],
};
