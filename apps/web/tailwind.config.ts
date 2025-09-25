import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0f172a',
        foreground: '#e2e8f0',
        accent: '#38bdf8',
        warning: '#f97316',
      },
    },
  },
  plugins: [],
};

export default config;
