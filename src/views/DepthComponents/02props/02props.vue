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

    <div>
      <h2>除了使用字符串数组来声明 props 外，还可以使用对象的形式：-在setup中</h2>
      <Child03 title="我的名称" :likes="num"  />
    </div>

    <div>
      <h2>除了使用字符串数组来声明 props 外，还可以使用对象的形式：---在没有使用setup 的组件中</h2>
      <Child04 title="我的名称" likes="txt"  />
    </div>

    <div>
      <h2>setup中-也可以使用类型标注来声明 props</h2>
      <Child05 title="我的名称" :likes="num"  />
    </div>

    <div>
      <h2>响应式 Props 解构</h2>
      <Child06 :foo="num" />
      <button @click="num++">num++</button>
    </div>

    <div>
      <h2>响应式 Props 解构--默认值</h2>
      <Child07 />
    </div>

    <div>
      <h2>将解构的 props 传递到函数中</h2>
      <Child08 :foo="num" />
      <button @click="num++">num++</button>
    </div>

    <div>
      <h2>Prop 名字格式</h2>
      <Child09 greeting-message="hello-传值为【greeting-message】，接受为【greetingMessage】--一个参数" />
    </div>

    <div>
      <h2>静态 vs. 动态 Props</h2>
      <Child09 :num="num" greeting-message="hello-传值为【greeting-message】，接受为【greetingMessage】--两个参数" />
      
      <button @click="num++">num++</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Child01 from "./components/Child01.vue";
import Child02 from "./components/Child02.vue";
import Child03 from "./components/Child03.vue";
import Child04 from "./components/Child04.vue";
import Child05 from "./components/Child05.vue";
import Child06 from "./components/Child06.vue";
import Child07 from "./components/Child07.vue";
import Child08 from "./components/Child08.vue";
import Child09 from "./components/Child09.vue";

const num = ref(10) // 10
</script>
