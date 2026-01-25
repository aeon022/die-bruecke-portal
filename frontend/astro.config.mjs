import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vue from '@astrojs/vue';
import PinyAstro from '@pinegrow/piny-astro';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),

  // --- NEU: HIER BEGINNT DER IMAGE BLOCK ---
  image: {
    domains: [
      'images.unsplash.com',
      'images.pexels.com',     // Für das aktuelle Platzhalter-Bild
      'api.diebruecke.social'  // Für deine echten Bilder aus Directus
    ],
    // Optional: Falls Bilder lokal nicht geladen werden, hilft manchmal:
    // remotePatterns: [{ protocol: 'https' }],
  },
  // --- ENDE IMAGE BLOCK ---

  integrations: [react(), vue(), PinyAstro({
      hotReload: true, 
  }), sitemap()],

  vite: {
    plugins: [
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '~': fileURLToPath(new URL('./src', import.meta.url)),
        '~~': fileURLToPath(new URL('./', import.meta.url)),
      },
    },
    server: {
      watch: { usePolling: true }
    }
  },
});