<template>
  <div>
    这是一个字组件
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const a = 1
const b = ref(2)

// 像 defineExpose 这样的编译器宏不需要导入
// 请注意，defineExpose 必须在任何 await 操作之前调用。否则，在 await 操作后暴露的属性和方法将无法访问。
defineExpose({
  a,
  b
})
</script>