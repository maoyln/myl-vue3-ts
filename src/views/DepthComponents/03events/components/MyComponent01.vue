<template>
  <div>
    <button @click="$emit('someEvent')">Click Me{{props.msg}}</button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  msg: {
    type: String,
    required: true,
  }
})
</script>