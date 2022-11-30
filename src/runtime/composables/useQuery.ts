import type {
  AsyncDataOptions,
  _AsyncData,
  KeyOfRes,
  PickFrom,
  _Transform,
} from 'nuxt/dist/app/composables/asyncData'
import type { NuxtApp } from '@nuxt/schema'
import { Ref, ref, unref, watch } from 'vue'
import {
  useAsyncData,
  useNuxtApp,
  useQueryCache,
  useQueryClient,
} from '#imports'

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

  const nuxt = useNuxtApp()

  const state = ref<QueryState>('pending')
  const calculateState = (resolvedQuery: QueryData<Data, DataE | null>) => {
    if (resolvedQuery.pending.value) {
      state.value = 'pending'
    } else if (resolvedQuery.error.value) {
      state.value = 'error'
    } else {
      state.value = 'success'
    }
  }

  // Resolve options
  const _options: AsyncDataOptions<DataT, Transform, PickKeys> = {
    ...unref(useQueryClient<DataT, Transform, PickKeys>()),
    ...options,
  }

  const query = useAsyncData<DataT, DataE, Transform, PickKeys>(
    key,
    () => handler(),
    _options
  ) as Promise<_AsyncData<Data, DataE | null>>

  const fetchOnServer = _options.server !== false && nuxt.payload.serverRendered
  const hasCachedData = () => useQueryCache() !== undefined

  // Server side
  if (process.server && fetchOnServer) {
    state.value = 'pending'

    if (_options.immediate) {
      query.finally(() => {
        const serverQuery = query as QueryData<Data, DataE | null>

        if (serverQuery.error.value) {
          state.value = 'error'
        } else {
          state.value = 'success'
        }
      })
    }
  }

  // Sync while hydration
  if (fetchOnServer && nuxt.isHydrating && hasCachedData()) {
    const hydrationQuery = query as QueryData<Data, DataE | null>

    watch(hydrationQuery.pending, () => {
      calculateState(hydrationQuery)
    })
  }

  // Client side
  if (process.client) {
    query.finally(() => {
      const clientQuery = query as QueryData<Data, DataE | null>

      watch(clientQuery.pending, () => {
        calculateState(clientQuery)
      })
    })
  }

  return {
    ...query,
    state,
  } as QueryData<Data, DataE | null>
}
