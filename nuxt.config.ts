export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  devServer: { port: 3001 },
  ssr: false,
  runtimeConfig: {
    public: {
      apiBase: normalizeApiBase(process.env.NUXT_PUBLIC_API_BASE),
      publicUrl: process.env.NUXT_PUBLIC_PUBLIC_URL || 'https://www.ticketr.org',
      adminUrl: process.env.NUXT_PUBLIC_ADMIN_URL || 'https://admin.ticketr.org',
    },
  },
  app: {
    head: {
      title: 'Ticketr Platform Admin',
      meta: [
        { name: 'description', content: 'Platform-wide organizer, event, transaction and deliverability controls.' },
        { name: 'robots', content: 'noindex, nofollow' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'stylesheet', href: 'https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&f[]=satoshi@300,400,500,700,900&display=swap' },
      ],
    },
  },
});
