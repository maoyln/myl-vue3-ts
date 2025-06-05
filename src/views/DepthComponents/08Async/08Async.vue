<template>
  <div>
    <h1>
      <a
        href="https://cn.vuejs.org/guide/components/async.html"
        target="_blank"
        >异步组件
      </a>
    </h1>

    <div>
      <h2>基本用法</h2>
      <div>
        import { defineAsyncComponent } from 'vue'
      </div>
      {{`
        const AsyncComp = defineAsyncComponent(() => {
          return new Promise((resolve, reject) => {
            // ...从服务器获取组件
            resolve(/* 获取到的组件 */)
          })
        })
        // ... 像使用其他一般组件一样使用 'AsyncComp'
        `}}
    </div>
  </div>
</template>

<script setup>

</script>