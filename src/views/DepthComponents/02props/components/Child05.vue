<template>
  <span>{{ title }} - {{ likes }}</span>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  likes?: number
}>()
</script>

