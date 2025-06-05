<!-- Child01.vue -->
<script setup>
  const model = defineModel();

  function update() {
    model.value++;
  }
</script>

<template>
<div>父绑定v-model是：{{model}}</div>
<button @click="update">加1</button>
</template>