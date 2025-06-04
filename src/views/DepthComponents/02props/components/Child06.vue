<template>
  <span>{{ foo }}</span>
</template>

<script setup lang="ts">
import { watchEffect } from 'vue'
// const { foo } = defineProps(['foo'])
const props = defineProps(['foo'])

watchEffect(() => {
  // 在 3.5 之前只运行一次
  // 在 3.5+ 中在 "foo" prop 变化时重新执行
  // console.log(foo)
  console.log(props.foo);
})
</script>

