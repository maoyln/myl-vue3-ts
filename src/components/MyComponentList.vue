<template>
  <div>🚩这是一个组件列表: {{ props.value }} {{props.name}}</div>
</template>

<script setup lang="ts">
const props = defineProps(['value', 'name']);
</script>