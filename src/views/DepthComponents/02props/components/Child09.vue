<template>
  <span>{{ greetingMessage }}</span>
  <span>{{ num }}</span>
</template>

<script setup lang="ts">
defineProps({
  greetingMessage: String,
  num: Number
})

</script>

