<template>
  <span>{{ greetingMessage }}</span>
</template>

<script setup lang="ts">
defineProps({
  greetingMessage: String
})

</script>

