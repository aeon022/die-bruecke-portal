import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vue from '@astrojs/vue';
import PinyAstro from '@pinegrow/piny-astro';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // --- WICHTIG: Pfad zur .env Datei ---
  // Da die .env einen Ordner höher liegt (im Projekt-Root), müssen wir das hier angeben.
  envDir: '..',

  output: 'server',
  adapter: node({ mode: 'standalone' }),

  image: {
    domains: [
      'images.unsplash.com',
      'images.pexels.com',
      'api.diebruecke.social',     // Live API
      'cms.beta.diebruecke.social' // WICHTIG: Beta API (hier liegen aktuell die Bilder)
    ],
  },

  integrations: [
    react(), 
    vue(), 
    PinyAstro({
      hotReload: true, 
    }), 
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