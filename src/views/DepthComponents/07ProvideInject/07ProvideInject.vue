<template>
  <div>
    <h1>
      <a
        href="https://cn.vuejs.org/guide/components/provide-inject.html"
        target="_blank"
        >依赖注入
      </a>
    </h1>

    <hr>

    <div>
      <h2>Prop 逐级透传问题</h2>
      <div>
        <button @click="num++">加1操作{{ num }}</button>
        <Child01 />
      </div>
    </div>

    <hr>

    <div>
      <h2>应用层 Provide</h2>
      <div>
        <div>
          import { createApp } from 'vue'
        </div>
        <div>
          const app = createApp({})
        </div>
        <div>
          app.provide(/* 注入名 */ 'message', /* 值 */ 'hello!')
        </div>
      </div>
    </div>
    <hr>

    <div>
      <h2>Inject (注入)</h2>
      <div>
        <div>
          import { provide, inject } from 'vue'
        </div>
        <div>
          provide(/* 注入名 */ 'message', /* 值 */ 'hello!')
        </div>
        <div>
          const message = inject(/* 注入名 */ 'message')
        </div>
      </div>
    </div>
    <hr>

    <div>
      <h2>注入默认值</h2>
      // 如果没有祖先组件提供 "message"
      // `value` 会是 "这是默认值"
      const value = inject('message', '这是默认值')
    </div>

    <hr>
    <div>
      <h2>使用 Symbol 作注入名</h2>
      <Child02 />
    </div>

  </div>
</template>

<script setup>
import { ref, provide, inject } from "vue";
import { myInjectionKey } from './components/keys.ts'
import Child01 from "./components/Child01.vue";
import Child02 from "./components/Child02.vue";

provide("message", "'provide-传值为【message】，接受为【message】--两个参数'");

const num = ref(0);

provide('num', num);

provide(myInjectionKey, {
  name: 'maoyln',
  age: 18
});

</script>