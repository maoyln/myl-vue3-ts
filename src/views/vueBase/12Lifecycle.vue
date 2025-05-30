<template>
<div>
  <h1>
    <a href="https://cn.vuejs.org/guide/essentials/lifecycle.html" target="_blank"
      >生命周期
    </a>
  </h1>
  <div>
    <button @click="count++">
      You clicked me {{ count }} times.
    </button>
  </div>
  <div>
    <img src="https://cn.vuejs.org/assets/lifecycle_zh-CN.W0MNXI0C.png" alt="">
  </div>


</div>

</template>

<script setup lang="ts">
import {ref, onBeforeMount, onMounted, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted } from 'vue'

// setup(() => {
//   console.log('setup');
// })


// onBeforeCreate(() => {
//   console.log('onBeforeCreate');
// })

// onCreated(() => {
//   console.log('onCreated');
// })

// export default {
//   setup() {
//     const count = ref(0)
//     return { count }
//   },
//   template: `
//     <button @click="count++">
//       You clicked me {{ count }} times.
//     </button>`
//   // 也可以针对一个 DOM 内联模板：
//   // template: '#my-template-element'
// }

const count = ref(0)

onBeforeMount(() => {
  console.log('onBeforeMount');
})

onMounted(() => {
  console.log('onMounted');
})

onBeforeUpdate(() => {
  console.log('onBeforeUpdate');
})

onUpdated(() => {
  console.log('onUpdated');
})

onBeforeUnmount(() => {
  console.log('onBeforeUnmount');
})

onUnmounted(() => {
  console.log('onUnmounted');
})
</script>