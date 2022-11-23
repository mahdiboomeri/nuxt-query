import { fileURLToPath } from 'url'
import { defineNuxtModule, addPlugin, createResolver, useLogger } from '@nuxt/kit'

export interface ModuleOptions {
  addDevtools: boolean
}

const PACKAGE_NAME = 'nuxt-query'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: PACKAGE_NAME,
    configKey: 'nuxtQuery'
  },
  defaults: {
    addDevtools: true
  },
  setup (options, nuxt) {
    const logger = useLogger(PACKAGE_NAME)

    if (options.addDevtools) {
      const { resolve } = createResolver(import.meta.url)
      const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
      nuxt.options.build.transpile.push(runtimeDir)

      addPlugin(resolve(runtimeDir, 'plugins', 'devtools'))
      logger.info('Installed nuxt-query devtools.')
    }
  }
})
