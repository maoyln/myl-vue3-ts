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
        <Child02 class="red" style="font-size: 20px" id="child02" />
      </div>
    </div>
    <hr>

    <div>
      <h2>v-on 监听器继承</h2>
      <div>这个监听器和从父组件继承的监听器都会被触发</div>
      <br>
      
      <div>
        <Child03 class="red" style="font-size: 20px" id="child03" @click="handleFakeClick" />
      </div>
    </div>
    <hr>

    <div>
      <h2>禁用 Attributes 继承</h2>
      <div>如果你不想要一个组件自动地继承 attribute，你可以在组件选项中设置 inheritAttrs: false。</div>
      <br>
      
      <div>
        <Child04 class="red" style="font-size: 20px" id="child04" @click="handleFakeClick" />
      </div>
    </div>
    <hr>

    <div>
      <h2>多根节点的 Attributes 继承</h2>
      <div>如果你不想要一个组件自动地继承 attribute，你可以在组件选项中设置 inheritAttrs: false。</div>
      <br>
      
      <div>
        <Child05 class="red" style="font-size: 20px" id="child05" @click="handleFakeClick" />
      </div>
    </div>
    <hr>

    <div>
      <h2>在 JavaScript 中访问透传 Attributes</h2>
      <div>import { useAttrs } from 'vue'</div>
      <div>const attrs = useAttrs()</div>
      <br>
      
      <div>
        <Child06 class="red" style="font-size: 20px" id="child06" @click="handleFakeClick" />
      </div>
    </div>
    <hr>

  </div>
</template>

<script setup>
import Child01 from './components/Child01.vue';
import Child02 from './components/Child02.vue';
import Child03 from './components/Child03.vue';
import Child04 from './components/Child04.vue';
import Child05 from './components/Child05.vue';
import Child06 from './components/Child06.vue';

function handleFakeClick() {
  console.log('父亲组件的点击事件，不会触发子组件');
}

</script>

<style>
.red {
  color: red;
}
</style>