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
      <div>下面是插槽默认值</div>
      <Child01 />
    </div>
    <br>
    <div>
      <div>下面是插传入值</div>
      <Child01><span style="color: red; font-size: 20px; border: 1px solid red">这是传入插槽内容</span></Child01>
    </div>
  </div>

  <hr>

  <div>
    <h2>传入一个函数</h2>
    <div>
      <div>下面是插槽默认值</div>
      <Child02>
        Click me
       </Child02>
      <Child02>
        <span style="color:cyan">Click me! </span>
        <AwesomeIcon />
      </Child02>
    </div>
    <br>

  </div>

  <hr>
</div>
</template>

<script setup>
import Child01 from './components/Child01.vue';

import Child02 from './components/Child02.vue'
import AwesomeIcon from './components/AwesomeIcon.vue'

</script>