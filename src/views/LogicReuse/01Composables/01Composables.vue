<template>
<div>
  <h1>
    <a
      href="https://cn.vuejs.org/guide/reusability/composables.html"
      target="_blank"
      >组合式函数</a
    >
  </h1>
  <div>
    <div>Mouse position is at: {{ x }}, {{ y }}</div>
  </div>
</div>
</template>

<script setup>
import { useMouse } from './mouse.js'

const { x, y } = useMouse()


</script>