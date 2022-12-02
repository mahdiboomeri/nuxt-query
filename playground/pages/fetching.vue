<template>
  <div>Fetch state: {{ data }} = {{ fetching }}</div>
</template>

<script setup lang="ts">
import { useQuery, useFetch } from '#imports'

const { data, fetching } = await useQuery(
  'lifecycle',
  () => $fetch('/api/bar'),
  {
    server: false,
  }
)

const { data: fooData } = await useFetch('/api/foo', {
  server: false,
  onResponse({ request, response, options }) {
    console.log('[fetch response]', {
      request,
      response,
      options,
    })
  },
  onResponseError({ request, response, options }) {
    console.log('[fetch response error]', {
      request,
      response,
      options,
    })
  },
  onRequest({ request, options }) {
    console.log('[fetch request]', {
      request,
      options,
    })
  },
  onRequestError({ request, options, error }) {
    console.log('[fetch request error]', {
      request,
      options,
      error,
    })
  },
})
</script>
