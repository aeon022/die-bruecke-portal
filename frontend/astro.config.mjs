// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import PinyAstro from "@pinegrow/piny-astro";
import node from '@astrojs/node';
import react from '@astrojs/react'; 

// https://astro.build/config
export default defineConfig({
  
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),

  image: {
    domains: ['images.unsplash.com', 'source.unsplash.com', 'unsplash.com'],
  },
  
  integrations: [
    PinyAstro(),
    react(), // <--- WICHTIG: Hier muss der Aufruf hin (ohne Babel-Plugins)
  ],

  vite: {
    plugins: [
      tailwindcss(),
    ],
    server: {
      watch: {
        usePolling: true,
      },
    },
  },
});