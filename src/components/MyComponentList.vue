<template>
  <div>🚩这是一个组件列表: {{ props.value }} {{ props.name }}</div>
</template>

<script setup lang="ts">
// 推荐方式1：对象形式定义props（带类型）
// const props = defineProps({
//   value: {
//     type: String,
//     required: true
//   },
//   name: {
//     type: String,
//     required: true
//   }
// });

// 或者方式2：TypeScript 泛型形式（更简洁）
const props = defineProps<{
  value?: string;
  name?: string;
}>();
</script>