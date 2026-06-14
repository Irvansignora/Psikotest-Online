import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f5f7f5',
          100: '#e8ede8',
          200: '#d0dbd0',
          300: '#a9bfa9',
          400: '#7a9d7a',
          500: '#537d53',
          600: '#3e6340',
          700: '#324f34',
          800: '#29402b',
          900: '#223524',
          950: '#111c12',
        },
        neutral: {
          50: '#f8f8f7',
          100: '#f0efee',
          200: '#e4e2e0',
          300: '#cbc8c4',
          400: '#a8a49e',
          500: '#88837c',
          600: '#6e6962',
          700: '#5a554f',
          800: '#4b4741',
          900: '#3f3c37',
          950: '#232019',
        }
      },
    },
  },
  plugins: [],
};
export default config;
