import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'freelancerad.io',
        short_name: 'FR',
        description: 'The sound of serious freelance work.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0a0a0f',
        theme_color: '#0a0a0f',
        orientation: 'any',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
        categories: ['music', 'productivity'],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png}'],
        // No runtime caching for audio: media fetches use Range requests,
        // which Workbox can't cache or replay correctly, and live-sync
        // radio has no meaningful offline mode. Caching tracks only
        // churned Cache Storage (up to 50 multi-MB files) for no benefit.
      },
    }),
  ],
  server: {
    port: 5173,
  },
  build: {
    target: 'es2020',
  },
})
