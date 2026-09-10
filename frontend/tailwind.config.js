/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          indigo: '#4F46E5',
          teal: '#0D9488',
          amber: '#D97706',
          red: '#DC2626',
          dark: '#111827',
          sidebar: '#F9FAFB',
          border: '#E5E7EB',
        }
      },
      borderRadius: {
        'card': '12px',
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
