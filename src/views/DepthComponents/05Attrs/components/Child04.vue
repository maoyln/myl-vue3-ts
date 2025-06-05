<!-- Child01.vue -->
<script setup>
defineOptions({
  inheritAttrs: false
})
function handleByClick() {
  console.log('自己的点击事件');
}

</script>

<template>
  <button class="my-border" style="font-weight:700" @click="handleByClick">合并父、子的点击事件</button>
</template>

<style>
.my-border {
  border: 3px solid blue;
}
</style>
