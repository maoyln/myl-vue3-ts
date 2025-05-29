<template>
  <div>
    <h1>
      <a
        href="https://cn.vuejs.org/guide/essentials/class-and-style.html"
        target="_blank"
        >Class 与 Style 绑定</a
      >
    </h1>
    <div>
      <h2>绑定HTML class</h2>
      <button @click="isActive = !isActive">切换active</button>
      <div v-bind:class="{ active: isActive }">动态绑定HTML class</div>
      <div :class="{ active: isActive }">绑定HTML class【简写】</div>
    </div>
    <hr />

    <div>
      <h2>多个 class配合</h2>
      <button @click="isActive = !isActive">切换active</button>
      <button @click="hasError = !hasError">切换hasError</button>

      <div
        class="static"
        :class="{ active: isActive, 'text-danger': hasError }"
      >active和hasError</div>
      <!-- <div class="static active text-danger">active和hasError</div> -->
    </div>
    <hr />

    <div>
      <h2>绑定一个对象</h2>
      <button @click="changeObjectClass">切换对象</button>

      <div :class="classObject">绑定一个对象渲染</div>
    </div>
    <hr />

    <div>
      <h2>绑定一个数组</h2>
      <div :class="[activeClass, errorClass]">绑定一个数组</div>
      <button @click="isActive = !isActive">切换isActive</button>
      <button @click="isError = !isError">切换isError</button>

      <div :class="[isActive ? activeClass : '', isError ? errorClass : '']">动态数组</div>

      <div>下面是数组和对象配合使用</div>
      <div :class="[{ [activeClass]: isActive }, errorClass]">数组和对象配合使用</div> 
    </div>
    <hr />
    <div>
      <h2>组件样式(组件内部和传入样式共同生效)</h2>
      <MyComponentStyle class="bg-yellow border-red" />
      <button @click="isActive = !isActive">切换isActive</button>
      <MyComponentStyle :class="{ active: isActive }" />
    </div>

    <hr />

    <div>
      <h2>多个根元素</h2>
      <MyComponentStyle class="bg-yellow border-red" />
    </div>

    <div>
      <h2>内联样式-样式属性</h2>
      <div :style="{ color: activeColor, fontSize: fontSize + 'px' }">这是一个内联样式</div>
      
      <h2>内联样式-对象</h2>
      <div :style="styleObject">内联样式-对象</div>

      <h2>内联样式-数组</h2>
      <div :style="[{ color: activeColor }, { fontSize: fontSize + 'px' }]">内联样式-数组</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import MyComponentStyle from '@/components/MyComponentStyle.vue';

const isActive = ref(true);
const hasError = ref(false);

const classObject = reactive({
  active: true,
  'text-danger': false
})

const changeObjectClass = () => {
  classObject.active = !classObject.active
}

const activeClass = ref('active')
const errorClass = ref('text-danger')
const isError = ref(false)

const activeColor = ref('red')
const fontSize = ref(18)

const styleObject = reactive({
  color: 'blue',
  fontSize: '16px'
})
</script>

<style>
.active {
  color: coral;
}

.text-danger {
  background: red;
}

.bg-yellow {
  background: yellow;
}

.border-red {
  border: 1px solid red;
}
</style>
