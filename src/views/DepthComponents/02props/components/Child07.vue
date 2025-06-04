<template>
  <span>{{ foo }}</span>
</template>

<script setup lang="ts">
import { watchEffect } from 'vue'
const { foo = 'hello-这个是默认值' } = defineProps<{ foo?: string }>()

watchEffect(() => {
  // 在 3.5 之前只运行一次
  // 在 3.5+ 中在 "foo" prop 变化时重新执行
  // console.log(foo)
  console.log(foo);
})
</script>

