import { useQueryCache } from '../composables/useQueryCache'
import { setupDevtools } from './devtools'

export const pluginInstaller = {
  install (app: any) {
    const data = useQueryCache()

    let devtools: ReturnType<typeof setupDevtools>

    if (process.env.NODE_ENV !== 'production') {
      devtools = setupDevtools(app, data)
    }
  }
}
