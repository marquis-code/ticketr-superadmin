// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  devServer: {
    port: 3001,
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://api.ticketr.org/api/v1',
    },
  },
  app: {
    head: {
      title: 'Ticketr - Super Admin Command Center',
      meta: [{ name: 'description', content: 'Super Admin control panel for tenant organization management.' }],
      link: [
        { rel: 'stylesheet', href: 'https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&f[]=satoshi@300,400,500,700,900&display=swap' },
      ],
    },
  },
});
