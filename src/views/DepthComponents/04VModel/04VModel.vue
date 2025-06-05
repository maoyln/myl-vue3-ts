<template>
<div>
  <h1>
    <a
      href="https://cn.vuejs.org/guide/components/v-model.html"
      target="_blank"
      >组件 v-models
    </a>
  </h1>

  <div>
    <h2>基本用法</h2>
    <div>v-model 可以在组件上使用以实现双向绑定</div>
    <div>
      从 Vue 3.4 开始，推荐的实现方式是使用 defineModel() 宏：
    </div>
    <div>
      <Child01 v-model="model"></Child01>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Child01 from './components/Child01.vue';

const model = ref(0);
</script>