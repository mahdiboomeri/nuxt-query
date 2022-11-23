import { defineNuxtPlugin } from '#app'
import { pluginInstaller } from '../devtools/installer'

export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    nuxtApp.vueApp.use(pluginInstaller)
  }
})
