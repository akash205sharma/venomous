/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'avatar-glow': '0px 5px 10px 5px blue',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.transition-position': {
          transition: 'top 2s ease, left 3s ease',
        },
      });
    },
  ],
}

