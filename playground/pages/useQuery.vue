<template>
  <div>
    Data: {{ data }}
    <br />
    State: {{ state }} - {{ pending }}
  </div>
</template>

<script setup lang="ts">
import { useQuery } from '~~/../dist/runtime/composables/useQuery'

const { data, state, pending } = useQuery('data', () => $fetch('/api/bar'))
</script>
