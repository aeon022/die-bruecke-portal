import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vue from '@astrojs/vue';
import PinyAstro from '@pinegrow/piny-astro';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // WICHTIG: Die Live-Domain hier definieren
  site: 'https://diebruecke.social',

  output: 'server',
  adapter: node({ mode: 'standalone' }),

  image: {
    domains: [
      'images.unsplash.com',
      'images.pexels.com',
      'api.diebruecke.social',     // Live API
      'cms.beta.diebruecke.social' // Beta API
    ],
  },

  integrations: [
    react(), 
    vue(), 
    PinyAstro({
      hotReload: true, 
    }), 
    // Das Sitemap-Plugin generiert eine Basis-Sitemap für statische Seiten.
    // Unsere dynamische 'src/pages/sitemap.xml.ts' überschreibt/ergänzt das für Events.
    sitemap()
  ],

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