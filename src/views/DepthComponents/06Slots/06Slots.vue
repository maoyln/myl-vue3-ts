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
    <h2>传入多个元素</h2>
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

  <div>
    <h2>默认内容</h2>
    <div>
      <div>没有有slot默认值-则如下所示</div>
      <Child02>
        Click me
       </Child02>
      <Child02>
        <span style="color:cyan">Click me! </span>
        <AwesomeIcon />
      </Child02>
    </div>
    <br>
    <div>
      <div>有slot默认值-则如下所示</div>
      <Child03/>

    </div>
  </div>
  <hr>
  
  <div>
    <h2>具名插槽</h2>
    <Child04>
      <template v-slot:header>
        <!-- header 插槽的内容放这里 -->
         这是一个头部内容
      </template>

      <template v-slot:footer>
        <!-- header 插槽的内容放这里 -->
         这是一个尾部内容
      </template>
    </Child04>
  </div>
  <hr>

  <div>
    <h2>具名插槽-简写</h2>
    <Child04>
      <template #header>
        <h1>这可能是一个页面标题</h1>
      </template>
    
      <template #default>
        <span style="color: red">
          这是默人值
        </span>
        <p>主要内容的一段。</p>
        <p>还有另一个。</p>
      </template>
    
      <template #footer>
        <p>这里有一些尾部没人</p>
      </template>
    </Child04>
  </div>
  <hr>
</div>
</template>

<script setup>
import Child01 from './components/Child01.vue';

import Child02 from './components/Child02.vue'
import Child03 from './components/Child03.vue'
import Child04 from './components/Child04.vue'
import AwesomeIcon from './components/AwesomeIcon.vue'

</script>