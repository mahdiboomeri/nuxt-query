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
import { hashQueryKey } from '../utils'
import {
  useAsyncData,
  useNuxtApp,
  useQueryCache,
  useQueryClient,
} from '#imports'

export type QueryKey = unknown
export type QueryState = 'pending' | 'error' | 'success'

interface _QueryData<DataT, DataE> extends _AsyncData<DataT, DataE> {
  state: Ref<QueryState>
  fetching: Ref<boolean>
}

type QueryData<DataT, DataE> = _QueryData<DataT, DataE> &
  Promise<_QueryData<DataT, DataE>>

interface QueryOptions<
  DataT,
  DataE,
  Transform extends _Transform<DataT> = _Transform<DataT, DataT>,
  PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>
> extends AsyncDataOptions<DataT, Transform, PickKeys> {
  enable?: WatchSource<unknown>
  queryKeyHash?: (queryKey: QueryKey) => string

  onRequest?(): Promise<void> | void
  onSuccess?(value: DataT): Promise<void> | void
  onError?(error: DataE): Promise<void> | void
  onResponse?(): Promise<void> | void
}

export function useQuery<
  DataT,
  DataE = Error,
  Transform extends _Transform<DataT> = _Transform<DataT, DataT>,
  PickKeys extends KeyOfRes<Transform> = KeyOfRes<Transform>
>(
  key: QueryKey,
  handler: (nuxtApp?: NuxtApp) => Promise<DataT>,
  options?: QueryOptions<DataT, DataE, Transform, PickKeys>
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

  const fetching = ref<boolean>(false)

  // Resolve options
  const _options: QueryOptions<DataT, DataE, Transform, PickKeys> = {
    ...unref(useQueryClient<DataT, Transform, PickKeys>()),
    ...options,
  }

  // Disable immidiate when using dependent query
  if (_options.enable) {
    _options.immediate = false
  }

  if (
    process.server &&
    _options.server === false &&
    _options.immediate !== false
  ) {
    // Avoid hydration errors
    fetching.value = true
  }

  // Lifecycle functions
  const onRequest = async () => {
    fetching.value = true

    if (_options.onRequest) {
      await _options.onRequest()
    }
  }
  const onSuccess = async (value: DataT) => {
    if (_options.onSuccess) {
      await _options.onSuccess(value)
    }
  }
  const onError = async (error: DataE) => {
    if (_options.onError) {
      await _options.onError(error)
    }
  }
  const onResponse = async () => {
    fetching.value = false

    if (_options.onResponse) {
      await _options.onResponse()
    }
  }

  // Query key hash
  const queryKey = _options.queryKeyHash
    ? _options.queryKeyHash(key)
    : hashQueryKey(key)

  const query = useAsyncData<DataT, DataE, Transform, PickKeys>(
    queryKey,
    async () => {
      await onRequest()

      return handler()
        .then(async (value) => {
          await onSuccess(value)

          return value
        })
        .catch(async (error: DataE) => {
          await onError(error)

          throw error
        })
        .finally(async () => {
          await onResponse()
        })
    },
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
    fetching,
  } as QueryData<Data, DataE | null>
}
