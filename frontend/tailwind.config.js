/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#006D77', // Stormy Teal
        },
        secondary: {
          DEFAULT: '#83C5bE', // Pearl Aqua
        },
        tertiary: {
          DEFAULT: '#F3BFC1', // Cotton Rose
        },
        accent: {
          DEFAULT: '#FFDDD2', // Almond Silk
          strong: '#E29578',  // Tangerine Dream
        },
        // Explizit benannte Farben für direkten Zugriff
        tangerine: '#E29578',
        
        surface: {
          DEFAULT: '#ffffff',
          muted: '#EDf6f9',   // Alice Blue
        }
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
      },
      container: {
        center: true,
        padding: '1rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};