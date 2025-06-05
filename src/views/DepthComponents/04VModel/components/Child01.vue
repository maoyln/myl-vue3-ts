<!-- Child01.vue -->
<script setup>

// 注：使 v-model 必填
// const model = defineModel({ required: true })

// 注：提供一个默认值
// const model = defineModel({ default: 0 })

const model = defineModel();

function update() {
  model.value++;
}
</script>

<template>
  <div>父绑定v-model是：{{ model }}</div>
  <button @click="update">加1</button>
</template>
