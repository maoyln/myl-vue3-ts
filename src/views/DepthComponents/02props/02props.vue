<template>
  <div>
    <h1>
      <a href="https://cn.vuejs.org/guide/components/props.html" target="_blank"
        >Props
      </a>
    </h1>

    <div>
      <h2>在setup中</h2>
      <Child01 msg="hello" />
    </div>

    <div>
      <h2>在没有使用setup 的组件中</h2>
      <Child02 msg="hello" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Child01 from "./components/Child01.vue";
import Child02 from "./components/Child02.vue";
</script>
