<template>
  <div>
    <button @click="shouldRun = !shouldRun">Run</button>

    <pre>
      {{ data }}
    </pre>
  </div>
</template>

<script setup lang="ts">
import { ref, useQuery } from '#imports'

const shouldRun = ref(false)

const { data } = await useQuery('notes', () => $fetch('/api/bar'), {
  enable: shouldRun,
})
</script>
