<template>
  <div>
    <h1>
      <a
        href="https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html"
        target="_blank"
        >响应式基础</a
      >
    </h1>
    <hr />
    <h2>声明响应式状态</h2>
    <div>
      在组合式 API 中，推荐使用 ref() 函数来声明响应式状态：
      <button @click="increment">👌点击{{ count }}</button>
      ：{{ count }}
    </div>
    <hr />

    <h2>深层响应性</h2>
    <div>
      <button @click="mutateDeeply">👌点击{{ obj.nested.count }}</button>
      ：count:{{ obj.nested.count }} | arr:{{ obj.arr }}
    </div>

    <div>
      <h2>nextTick</h2>
      <span
        >当你修改了响应式状态时，DOM 会被自动更新。但是需要注意的是，DOM
        更新不是同步的。Vue 会在“next
        tick”更新周期中缓冲所有状态的修改，以确保不管你进行了多少次状态修改，每个组件都只会被更新一次</span
      >
      <div>
        <button @click="increment2">👌点击+2【{{ count }}】</button>
        ：{{ count }}
      </div>
    </div>

    <div>
      <h2>reactive()</h2>
      <span>还有另一种声明响应式状态的方式，即使用 reactive() API。与将内部值包装在特殊对象中的 ref 不同，reactive() 将使对象本身具有响应性：</span>
      <button @click="reactiveIncrement">
        👌点击+3【{{ state.myCount }}】
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// about 页面逻辑
import { ref, nextTick, reactive } from "vue";

const count = ref(0);

const increment = () => {
  console.log(count, "count");
  console.log(count.value, "count.value");
  count.value++;
};

const increment2 = async () => {
  count.value = count.value + 2;
  await nextTick();
};

const obj = ref({
  nested: { count: 0 },
  arr: ["foo", "bar"],
});

function mutateDeeply() {
  // 以下都会按照期望工作
  obj.value.nested.count++;
  obj.value.arr.push("baz");
}


const state = reactive({ myCount: 0 })

const reactiveIncrement = () => {
  console.log(state, 'state');
  console.log(state.myCount, 'state.myCount');
  state.myCount = state.myCount + 3
}


const raw = {}
const proxy = reactive(raw)

// 代理对象和原始对象不是全等的
console.log(raw, 'raw') // {}
console.log(proxy, 'proxy') // Proxy(Object) {}
console.log(proxy === raw, 'proxy === raw') // false

// 在同一个对象上调用 reactive() 会返回相同的代理
console.log(reactive(raw) === proxy) // true

// 在一个代理上调用 reactive() 会返回它自己
console.log(reactive(proxy) === proxy) // true

</script>

<!-- 重要：下面的写法根上面的写法一致 -->

<!-- <script lang="ts">
// about 页面逻辑
import { ref } from 'vue'

export default {
  // `setup` 是一个特殊的钩子，专门用于组合式 API。
  setup() {
    const count = ref(0)

    const increment = () => {
      console.log(count, 'count');
      console.log(count.value, 'count.value');
      count.value++
    }

    // 将 ref 暴露给模板
    return {
      count,
      increment
    }
  }
}
</script> -->
