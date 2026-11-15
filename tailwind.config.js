/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        white: '#FFFFFF',
        grey: {
          DEFAULT: '#E5E5E5',
          header: '#F2F2F2',
          hover: '#F7F7F7',
        },
        orange: {
          DEFAULT: '#FCA311',
          hover: '#E8950F',
          active: '#D6850A',
          light: 'rgba(252, 163, 17, 0.15)',
        },
        navy: {
          DEFAULT: '#14213D',
          hover: '#0E172B',
          light: 'rgba(20, 33, 61, 0.08)',
        },
        dim: '#5B6478',
        black: '#000000',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'overlay': '0 8px 24px rgba(20, 33, 61, 0.12)',
        'none': 'none',
      },
      borderRadius: {
        DEFAULT: '8px',
        'sm': '8px',
        'md': '8px',
        'lg': '8px',
        'xl': '8px',
        'card': '8px',
        'control': '8px',
        'pill': '9999px',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
      }
    },
  },
  plugins: [],
}
