<template>
  <div>
    <h1>
      <a
        href="https://cn.vuejs.org/guide/built-ins/teleport.html"
        target="_blank"
        >Teleport</a
      >
    </h1>
    <div>
      <div>
        <h2>基本用法</h2>
        <div>下面是没有使用Teleport的用法-在当前的dom下</div>
        <div><Child01 /></div>
      </div>
      <hr />

      <div>
        <h2>基本用法</h2>
        <div>下面是使用Teleport的用法-挂在了body下</div>
        <div><Child02 /></div>
      </div>
      <hr />
    </div>
  </div>
</template>

<script setup>
import Child01 from "./components/Child01.vue";
import Child02 from "./components/Child02.vue";
</script>
