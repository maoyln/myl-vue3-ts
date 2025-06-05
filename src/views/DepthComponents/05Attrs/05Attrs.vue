<template>
  <div>
    <h1>
      <a
        href="https://cn.vuejs.org/guide/components/attrs.html"
        target="_blank"
        >透传 Attributes
      </a>
    </h1>

    <div>
      <h2>Attributes 继承</h2>
      <div>“透传 attribute”指的是传递给一个组件，却没有被该组件声明为 props 或 emits 的 attribute 或者 v-on 事件监听器。最常见的例子就是 class、style 和 id。</div>
      <br>

      <div>
        <Child01 class="red" style="font-size: 20px" id="child01" />
      </div>
    </div>
    <hr>

    <div>
      <h2>对 class 和 style 的合并</h2>
      <div>“透传 attribute”指的是传递给一个组件，却没有被该组件声明为 props 或 emits 的 attribute 或者 v-on 事件监听器。最常见的例子就是 class、style 和 id。</div>
      <br>
      
      <div>
        <Child02 class="red" style="font-size: 20px" id="child01" />
      </div>
    </div>
    <hr>

  </div>
</template>

<script setup>
import Child01 from './components/Child01.vue';
import Child02 from './components/Child02.vue';
</script>

<style>
.red {
  color: red;
}
</style>