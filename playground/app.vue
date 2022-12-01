<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { useQueryClient } from '#imports';

useQueryClient({
  lazy: true
})
</script>