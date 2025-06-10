<template>
  <div>
    <h1>
      <a
        href="https://cn.vuejs.org/guide/typescript/overview.html"
        target="_blank"
        >总览</a
      >
    </h1>

    <div>
      <h2>常见使用说明 - defineComponent()</h2>
      <div>
        <Child01 name="maoyl" msg="hello" />
      </div>
    </div>
    
  </div>
  </template>
  
  <script setup>
  import Child01 from './components/Child01.vue';

  </script>