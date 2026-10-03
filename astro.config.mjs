// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.zentriboy.de',
  integrations: [sitemap()],
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  image: {
    // Die Werkstattfotos sind 640 × 480 groß. Größere Varianten würden nur hochskalieren.
    responsiveStyles: false,
  },
  vite: {
    build: {
      // Three.js ist ein eigener Chunk und wird nur auf Seiten mit Laufrad geladen.
      chunkSizeWarningLimit: 800,
    },
  },
});
