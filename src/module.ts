import { fileURLToPath } from 'url'
import { defineNuxtModule, addPlugin, createResolver, useLogger, addImportsDir } from '@nuxt/kit'
import { defu } from 'defu'

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
    const { resolve } = createResolver(import.meta.url)
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir)

    // Final resolved config
    const config = nuxt.options.runtimeConfig.public.nuxtQuery = defu(nuxt.options.runtimeConfig.public.nuxtQuery, {
      addDevtools: options.addDevtools
    })

    logger.success('Starting nuxt-query...')

    // Register the devtools
    if (config.addDevtools) {
      addPlugin(resolve(runtimeDir, 'plugins', 'devtools'))
      logger.success('Installed nuxt-query devtools.')
    }

    // Add composables
    const composables = resolve(runtimeDir, 'composables')
    addImportsDir(composables)
  }
})
