import type {
  AsyncDataOptions,
  KeyOfRes,
  _Transform
} from 'nuxt/dist/app/composables/asyncData'
import type { Ref } from 'vue'
import { useState } from '#imports'

type MaybeRef<T> = Ref<T> | T

export const key = 'nuxt-query-defaults'
export const useQueryClient = <
  Data = any,
  Transform extends _Transform<Data, any> = _Transform<Data, Data>,
  Keys extends KeyOfRes<Transform> = KeyOfRes<Transform>
> (
    options: MaybeRef<AsyncDataOptions<Data, Transform, Keys>> = {}
  ): Ref<AsyncDataOptions<Data, Transform, Keys>> => {
  return useState(key, () => options)
}
