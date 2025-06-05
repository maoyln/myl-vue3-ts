<!-- MyComponent.vue -->
<script setup>
const title = defineModel('title', { required: true })
// const title = defineModel('title')
</script>

<template>
  <input type="text" v-model="title" />
</template>