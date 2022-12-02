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
</script>
