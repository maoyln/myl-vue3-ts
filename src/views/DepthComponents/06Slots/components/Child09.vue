<script setup>
import { ref } from "vue";

const props = defineProps(["api-url", "per-page"]);

const items = ref([]);

// mock remote data fetching
setTimeout(() => {
  items.value = [
    { body: "Scoped Slots Guide", username: "Evan You", likes: 20 },
    { body: "Vue Tutorial", username: "Natalia Tepluhina", likes: 10 },
    { body: "Vue Test", username: "Natalia Tepluhina", likes: 5 },
  ];
}, 1000);
</script>

<template>
  <ul>
    <li v-if="!items.length">Loading...</li>
    <li v-for="item in items" :key="item.id">
      <slot name="item" v-bind="item" />
    </li>
  </ul>
</template>

<style scoped>
ul {
  list-style-type: none;
  padding: 5px;
  background: linear-gradient(315deg, #42d392 25%, #647eff);
}
li {
  padding: 5px 20px;
  margin: 10px;
  background: #fff;
}
</style>
