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
      <h2>常见使用说明 - defineComponent() - 类型推导</h2>
      <div>
        <Child01 name="maoyl" msg="hello" />
      </div>

      <hr />

      <h2>常见使用说明 - defineComponent() - 范型使用</h2>
      <div>
        <Child02 foo="maoyl-foo" bar="hello-bar" />
        <hr />
        <Child03 foo="maoyl-foo-interface" bar="hello-interface" />
      </div>
      <hr />
      <Child04 foo="maoyl-foo-type" bar="hello-bar-type" />
    </div>

    <hr />

    <h2>Props 解构默认值</h2>
    <div>
      <Child05 />
    </div>
  </div>
</template>

<script setup>
import Child01 from "./components/Child01.vue";
import Child02 from "./components/Child02.vue";
import Child03 from "./components/Child03.vue";
import Child04 from "./components/Child04.vue";
import Child05 from "./components/Child05.vue";
</script>
