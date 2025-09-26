import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0F172A',
        surface: '#111827',
        accent: '#22C55E',
        emphasis: '#60A5FA',
        textPrimary: '#E5E7EB'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};

export default config;
