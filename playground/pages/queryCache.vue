<template>
  <div>
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
import { useAsyncData, useFetch } from '#app'
import { useQueryCache } from '../../src/runtime/composables/useQueryCache'

const { data: fooData, refresh: fooRefresh } = await useFetch('/api/foo', {
  key: 'foo'
})

const { data } = await useAsyncData(() => $fetch('/api/bar'))

const { data: barData, refresh: barRefresh } = await useFetch('/api/bar', {
  key: 'bar',
  immediate: false
})
</script>
