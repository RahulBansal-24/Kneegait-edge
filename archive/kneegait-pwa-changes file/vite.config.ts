import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'prompt': a new version is only applied when the user taps "Reload".
      // This avoids silently reloading the page in the middle of a live Bluetooth session.
      registerType: 'prompt',
      // Registration is done in src/components/PwaStatus.tsx (useRegisterSW).
      injectRegister: false,
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'KneeGait-Edge | Clinical Companion',
        short_name: 'KneeGait',
        description: 'Clinical companion for real-time knee gait monitoring from a Bluetooth wearable.',
        lang: 'en',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        theme_color: '#14213D',
        background_color: '#F5F8F9',
        categories: ['health', 'medical'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Pre-cache the whole app shell (HTML, JS, CSS, icons) so the app opens offline.
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        // Any page navigation (e.g. a reload on /analytics) is answered with the cached SPA shell.
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          // Google Fonts stylesheet (small, may change): serve cached, refresh in background.
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-styles' },
          },
          // Font files are immutable: cache first.
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
