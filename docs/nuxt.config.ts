export default defineNuxtConfig({
  app: {
    pageTransition: false,
    layoutTransition: false
  },
  modules: ['@nuxtlabs/github-module'],
  extends: process.env.DOCUS_THEME_PATH || '@nuxt-themes/docus',
  github: {
    owner: 'mahdiboomeri',
    repo: 'nuxt-query',
    branch: 'main'
  },
  colorMode: {
    preference: 'dark'
  },
  build: {
    transpile: [/content-edge/, /github-module/]
  },
  nitro: {
    preset: 'vercel'
  }
})
