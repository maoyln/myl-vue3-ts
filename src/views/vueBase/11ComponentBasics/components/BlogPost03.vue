<!-- BlogPost.vue -->
<script setup>
const props = defineProps(["title"]);

console.log(props.title);
</script>

<template>
  <div class="blog-post">
    <h4>{{ title }}</h4>
    <button @click="$emit('enlarge-text')">Enlarge text</button>
    <button @click="$emit('small-text')">small text</button>
  </div>
</template>