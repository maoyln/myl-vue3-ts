<template>
  <div>
    <h1>
      <a
        href="https://cn.vuejs.org/guide/built-ins/transition.html"
        target="_blank"
        >Transition</a
      >
    </h1>
    <div>
      <div>
        <h2>Transition</h2>
        <div><Child01 /></div>
      </div>

      <hr>

      <div>
        <h2>基于 CSS 的过渡效果</h2>
        <div><Child02 /></div>

      </div>

      <hr>

      <div>
        <h2>CSS 的 animation</h2>
        <div><Child03 /></div>
      </div>

    </div>
  </div>
  </template>
  
  <script setup>
  import Child01 from './components/Child01.vue';
  import Child02 from './components/Child02.vue';
  import Child03 from './components/Child03.vue';
  
  
  
  </script>