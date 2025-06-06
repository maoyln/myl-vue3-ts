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

      <hr>

      <div>
        <h2>自定义过渡 class</h2>
        <div><Child04 /></div>

      </div>

      <div>
        <h2>深层级过渡与显式过渡时长</h2>
        <div><Child05 /></div>
      </div>
      <hr>
      <div>
        <h2>JavaScript 钩子</h2>
        <div><Child06 /></div>
      </div>
      <hr>

      <div>
        <h2>可复用过渡效果--元素间过渡</h2>
        <div><Child07 /></div>
      </div>
      <hr>

      <div>
        <h2>组件间过渡</h2>
        <div><Child08 /></div>
      </div>
      <hr>

      <div>
        <h2>使用 Key Attribute 过渡</h2>
        <div><Child09 /></div>
      </div>

      
    </div>
  </div>
  </template>
  
  <script setup>
  import Child01 from './components/Child01.vue';
  import Child02 from './components/Child02.vue';
  import Child03 from './components/Child03.vue';
  import Child04 from './components/Child04.vue';
  import Child05 from './components/Child05.vue';
  import Child06 from './components/Child06.vue';
  import Child07 from './components/Child07.vue';
  import Child08 from './components/Child08.vue';
  import Child09 from './components/Child09.vue';  

  </script>