import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vue from '@astrojs/vue';
import PinyAstro from '@pinegrow/piny-astro'; // <-- Das ist neu

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),

  integrations: [
    react(),
    vue(),
    PinyAstro({
        // Hot Reloading für .astro Dateien aktivieren (Standard)
        hotReload: true, 
    }),
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