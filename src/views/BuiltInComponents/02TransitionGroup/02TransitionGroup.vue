<template>
  <div>
    <h1>
      <a
        href="https://cn.vuejs.org/guide/built-ins/transition-group"
        target="_blank"
        >TransitionGroup</a
      >
    </h1>
    <div>
      <div>
        <h2>进入 / 离开动画</h2>
        <div><Child01 /></div>
      </div>
      <hr />

      <div>
        <h2>渐进延迟列表动画</h2>
        <div><Child02 /></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Child01 from "./components/Child01.vue";
import Child02 from "./components/Child02.vue";
</script>
