/** @type {import('tailwindcss').Config} */
export default {
  // WICHTIG: Scanne alle Astro-Dateien
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  
  // SAFELIST: Hier zwingen wir Tailwind, die DB-Klassen zu bauen
  safelist: [
    {
      // Pattern für alle Farben (rose, blue, etc.) und Stärken (50-950)
      pattern: /^(from|via|to)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(\d{2,3})$/,
    },
    // Pattern für Spezialfarben ohne Nummern (black, white, transparent)
    {
      pattern: /^(from|via|to)-(black|white|transparent)$/,
    }
  ],
  
  theme: {
    extend: {},
  },
  plugins: [],
}