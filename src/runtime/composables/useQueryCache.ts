import { useNuxtApp } from '#imports'

export const useQueryCache = () => {
  return useNuxtApp().payload.data
}
