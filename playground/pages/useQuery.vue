<template>
  <div>
    Data: {{ data }}
    <br />
    State: {{ state }} - {{ pending }}
  </div>
</template>

<script setup lang="ts">
import { useQuery } from '#imports'

const { data, state, pending } = useQuery('data', () => $fetch('/api/bar'))
</script>
