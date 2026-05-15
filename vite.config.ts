import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Claude Pacer',
        short_name: 'Claude Pacer',
        description: 'Acompanhe o ritmo de uso semanal do Claude',
        theme_color: '#1A1915',
        background_color: '#1A1915',
        display: 'standalone',
        start_url: '/Claude-Tracker/',
        scope: '/Claude-Tracker/',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      workbox: {
        navigateFallback: '/Claude-Tracker/index.html',
        globPatterns: ['**/*.{js,css,html,svg}'],
        runtimeCaching: [
          {
            // Não cachear chamadas ao Gist — sempre buscar o valor mais recente
            urlPattern: /^https:\/\/api\.github\.com\/gists/,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  base: '/Claude-Tracker/',
})
