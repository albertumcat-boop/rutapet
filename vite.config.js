/**
 * vite.config.js — Configuración de Vite + PWA
 * Auditado: manifest completo, workbox caching, iconos
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name:             'RutaVentas',
        short_name:       'RutaVentas',
        description:      'Gestión de ventas en ruta para cualquier negocio',
        theme_color:      '#0B1929',
        background_color: '#0B1929',
        display:          'standalone',
        orientation:      'portrait',
        scope:            '/',
        start_url:        '/',
        lang:             'es',
        icons: [
          {
            src:     'icons/icon-192.png',
            sizes:   '192x192',
            type:    'image/png',
            purpose: 'any maskable',
          },
          {
            src:     'icons/icon-512.png',
            sizes:   '512x512',
            type:    'image/png',
            purpose: 'any maskable',
          },
        ],
        categories: ['business', 'productivity'],
      },
      workbox: {
        // Solo cachear archivos que existen
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Tiles de OpenStreetMap — cache primero
            urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/i,
            handler:    'CacheFirst',
            options: {
              cacheName:  'osm-tiles',
              expiration: {
                maxEntries:     300,
                maxAgeSeconds:  60 * 60 * 24 * 7, // 7 días
              },
            },
          },
          {
            // Fuentes de Google
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler:    'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries:20, maxAgeSeconds:60*60*24*365 },
            },
          },
          {
            // Firebase Auth y Firestore — siempre red primero
            urlPattern: /^https:\/\/.*\.googleapis\.com\/.*/i,
            handler:    'NetworkFirst',
            options: {
              cacheName:        'firebase-api',
              networkTimeoutSeconds: 10,
            },
          },
          {
            // Nominatim (reverse geocoding)
            urlPattern: /^https:\/\/nominatim\.openstreetmap\.org\/.*/i,
            handler:    'NetworkFirst',
            options: {
              cacheName: 'nominatim',
              expiration: { maxEntries:50, maxAgeSeconds:60*60*24 },
            },
          },
        ],
      },
    }),
  ],
  build: {
    // Separar chunks grandes
    rollupOptions: {
      output: {
        manualChunks: {
          firebase:  ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          leaflet:   ['leaflet'],
          recharts:  ['recharts'],
        },
      },
    },
  },
})
