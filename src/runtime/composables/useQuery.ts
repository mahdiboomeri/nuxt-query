import type {
  AsyncDataOptions,
  _AsyncData,
  KeyOfRes,
  PickFrom,
  _Transform,
} from 'nuxt/dist/app/composables/asyncData'
import type { NuxtApp } from '@nuxt/schema'
import { watchOnce } from '@vueuse/core'
import { Ref, WatchSource, ref, unref, watch } from 'vue'
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

interface QueryOptions<
  DataT,
  Transform extends _Transform<DataT> = _Transform<DataT, DataT>,
  PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>
> extends AsyncDataOptions<DataT, Transform, PickKeys> {
  enable?: WatchSource<unknown>
}

export function useQuery<
  DataT,
  DataE = Error,
  Transform extends _Transform<DataT> = _Transform<DataT, DataT>,
  PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>
>(
  key: string,
  handler: (nuxtApp?: NuxtApp) => Promise<DataT>,
  options?: QueryOptions<DataT, Transform, PickKeys>
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
  const _options: QueryOptions<DataT, Transform, PickKeys> = {
    ...unref(useQueryClient<DataT, Transform, PickKeys>()),
    ...options,
  }

  if (_options.enable) {
    _options.immediate = false
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

    watch(
      hydrationQuery.pending,
      () => {
        calculateState(hydrationQuery)
      },
      { immediate: true }
    )
  }

  // Client side
  if (process.client) {
    query.finally(() => {
      const clientQuery = query as QueryData<Data, DataE | null>

      watch(
        clientQuery.pending,
        () => {
          calculateState(clientQuery)
        },
        { immediate: true }
      )

      // Dependent query
      if (_options.enable) {
        watchOnce(_options.enable, () => {
          clientQuery.execute()
        })
      }
    })
  }

  return {
    ...query,
    state,
  } as QueryData<Data, DataE | null>
}
