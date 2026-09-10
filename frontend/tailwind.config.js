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
        display: ['Helvetica', 'Arial', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'Inter', 'sans-serif'],
      },
      colors: {
        'page-bg': '#FAF9F5',
        'panel-bg': '#F0EFEB',
        'soft-card': '#E9E8E4',
        'soft-card-2': '#F4F3EF',
        'white-card': '#FFFDF8',
        'white-soft': '#FAF9F5',
        'lumio-text': '#1B1B1B',
        'lumio-muted': '#8C8880',
        'lumio-muted-light': '#BDBAB2',
        'lumio-line': '#D9D7D0',
        'lumio-black': '#181818',
        'lumio-deep-black': '#151515',
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
        '3xl': '2rem',
        '4xl': '2.5rem',
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'capsule': '0 20px 40px -15px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
