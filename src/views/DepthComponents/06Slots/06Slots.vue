<template>
<div>
  <h1>
    <a
      href="https://cn.vuejs.org/guide/components/slots.html"
      target="_blank"
      >插槽 Slots
    </a>
  </h1>

  <hr>

  <div>
    <h2>插槽内容与出口</h2>
    <div>
      <Child01 />
    </div>
  </div>
</div>
</template>

<script setup>
import Child01 from './components/Child01.vue';

</script>