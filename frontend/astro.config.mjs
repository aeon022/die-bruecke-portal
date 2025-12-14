// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import PinyAstro from "@pinegrow/piny-astro";
import node from '@astrojs/node'; // Wir brauchen einen Adapter für SSR

// https://astro.build/config
export default defineConfig({
  output: 'server', // <--- WICHTIG: Server Side Rendering aktivieren
  adapter: node({
    mode: 'standalone',
  }),
  
  integrations: [
    PinyAstro()
  ],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
});