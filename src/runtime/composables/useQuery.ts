import type {
  AsyncDataOptions,
  _AsyncData,
  KeyOfRes,
  PickFrom,
  _Transform,
} from 'nuxt/dist/app/composables/asyncData'
import type { NuxtApp } from '@nuxt/schema'
import { Ref, ref, unref, watch } from 'vue'
import { useAsyncData, useQueryClient } from '#imports'

type QueryState = 'pending' | 'error' | 'success'

interface _QueryData<DataT, DataE> extends _AsyncData<DataT, DataE> {
  state: Ref<QueryState>
}

type QueryData<DataT, DataE> = _QueryData<DataT, DataE> &
  Promise<_QueryData<DataT, DataE>>

export function useQuery<
  DataT,
  DataE = Error,
  Transform extends _Transform<DataT> = _Transform<DataT, DataT>,
  PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>
>(
  key: string,
  handler: (nuxtApp?: NuxtApp) => Promise<DataT>,
  options?: AsyncDataOptions<DataT, Transform, PickKeys>
) {
  type Data = PickFrom<ReturnType<Transform>, PickKeys>

  const state = ref<QueryState>('pending')
  const query = useAsyncData<DataT, DataE, Transform, PickKeys>(
    key,
    () => handler(),
    {
      ...unref(useQueryClient<DataT, Transform, PickKeys>()),
      ...options,
    }
  ) as Promise<_AsyncData<Data, DataE | null>>

  query.finally(() => {
    const resolvedQuery = query as QueryData<Data, DataE | null>

    watch(resolvedQuery.pending, () => {
      if (resolvedQuery.pending.value) {
        state.value = 'pending'
      } else if (resolvedQuery.error.value) {
        state.value = 'error'
      } else {
        state.value = 'success'
      }
    })
  })

  return {
    ...query,
    state,
  } as QueryData<Data, DataE | null>
}
