/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,jsx,js}'],
  theme: {
    extend: {
      colors: {
        background: '#0B1020',
        accent: '#3DB2FF',
        success: '#2ECC71',
        milestone: '#F1C40F',
        surface: '#121833',
        slate: '#5A5F73'
      },
      boxShadow: {
        neon: '0 0 20px rgba(61, 178, 255, 0.45)',
        inset: 'inset 0 0 20px rgba(11, 16, 32, 0.95)'
      }
    }
  },
  plugins: []
};
