<template>
  <div>
    <h1>
      <a
        href="https://cn.vuejs.org/guide/built-ins/keep-alive.html"
        target="_blank"
        >KeepAlive</a
      >
    </h1>
    <div>
      <div>
        <h2>进入 / 离开动画</h2>
        <div><Child01 /></div>
      </div>
      <hr />

      <div>
        <h2>包含/排除</h2>
        <div>include="a,b"</div>
        <div>:include="/a|b/"</div>
        <div>:include="['a', 'b']"</div>
      </div>

      <hr />
      <div>
        <h2>最大缓存实例数</h2>
        <div>KeepAlive :max="10"</div>
      </div>

      <hr />
      <div>
        <h2>缓存实例的生命周期​</h2>
        <div>import { onActivated, onDeactivated } from 'vue'</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Child01 from "./components/Child01.vue";
</script>
