export default defineNuxtConfig({
  compatibilityVersion: 5,
  devtools: { enabled: true },

  // SPA penuh: tanpa SSR. Semua render di client — cocok untuk aplikasi
  // offline-first (localStorage) + PWA yang diserve sebagai file statis.
  ssr: false,

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Deresan — Reminder Murajaah Harian',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Reminder murajaah harian dan manajemen kualitas hafalan Al-Quran. Full offline, mobile-first.' },
        { name: 'theme-color', content: '#059669' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'Deresan' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/icon-192.png' },
        { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/icon-512.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },

  pwa: {
    strategies: 'generateSW',
    registerType: 'autoUpdate',
    includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'],
    manifest: {
      name: 'Deresan — Murajaah Harian',
      short_name: 'Deresan',
      description: 'Reminder murajaah harian dan manajemen kualitas hafalan Al-Quran. Full offline.',
      theme_color: '#059669',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      ],
    },
    workbox: {
      // SPA fallback: semua navigasi offline diserve index
      navigateFallback: '/',
      // hanya precache aset hasil build + ikon
      globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600,
    },
    devOptions: {
      enabled: false,
    },
  },
})
