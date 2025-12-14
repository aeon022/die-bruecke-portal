// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite'; // Das hier ist wichtig!
// import tailwind from '@astrojs/tailwind'; // <-- DAS HIER LÖSCHEN, FALLS ES DRIN STEHT!

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  // integrations: [tailwind()], // <-- AUCH DAS HIER LÖSCHEN!
});