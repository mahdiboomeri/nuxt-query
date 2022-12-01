import { useNuxtApp } from '#imports'

export const useQueryCache = (): Record<string, any> => {
  return useNuxtApp().payload.data
}
