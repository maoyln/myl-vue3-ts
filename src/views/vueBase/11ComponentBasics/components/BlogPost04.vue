<!-- BlogPost.vue -->
<script setup>
defineProps(['title'])
const emit =defineEmits(['enlarge-text', 'small-text'])
</script>

<template>
  <div class="blog-post">
    <h4>{{ title }}</h4>
    <div>这是一个参数</div>
    <button @click="emit('enlarge-text')">Enlarge text</button>
    <button  @click="emit('small-text')">small text</button>
  </div>
</template>