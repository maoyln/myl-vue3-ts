<template>
  <span>{{props.title}} - {{props.likes}}</span>
</template>

<script setup lang="ts">
const props = defineProps({
  title: String,
  likes: Number
})


</script>