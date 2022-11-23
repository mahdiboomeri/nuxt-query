<template>
  <div>
    Nuxt module playground!

    <button @click="fooRefresh()">
      refresh foo
    </button>
    <button @click="barRefresh()">
      refresh bar
    </button>

    {{ useQueryCache() }}
  </div>
</template>

<script setup lang="ts">
import { useFetch } from '#app'
import { useQueryCache } from '../src/runtime/composables/useQueryCache'

const { data: fooData, refresh: fooRefresh } = await useFetch('/api/foo', {
  key: 'foo'
})

const { data: barData, refresh: barRefresh } = await useFetch('/api/bar', {
  key: 'bar',
  immediate: false
})
</script>
