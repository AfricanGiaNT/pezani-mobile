/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E4B012',
          dark: '#C29910',
          light: '#F0C64D',
        },
        secondary: {
          DEFAULT: '#1E3A5F',
          dark: '#152B47',
          light: '#2E5282',
        },
        accent: {
          DEFAULT: '#2E7D6B',
          dark: '#236356',
          light: '#3E9D87',
        },
        background: '#F8F9FA',
        surface: '#FFFFFF',
        text: {
          DEFAULT: '#333333',
          light: '#6B7280',
        },
        error: '#DC3545',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

