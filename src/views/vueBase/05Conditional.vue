<template>
  <div>
    <h1>
      <a
        href="https://cn.vuejs.org/guide/essentials/conditional.html"
        target="_blank"
        >条件渲染
      </a>
    </h1>

    <div>
      <h2>v-if 与 v-else</h2>
      <button @click="awesome = !awesome">切换awesome</button>
      <h1 v-if="awesome">Vue is awesome!</h1>
      <!-- v-else 可以省略 -->
      <h1 v-else>Oh no 😢</h1> 
    </div>
    <hr>

    <div>
      <h2>v-else-if</h2>
      <button @click="type = 'A'">A</button>
      <button @click="type = 'B'">B</button>
      <button @click="type = 'C'">C</button>
      <button @click="type = 'D'">D</button>

      <div v-if="type === 'A'">
        A
      </div>
      <div v-else-if="type === 'B'">
        B
      </div>
      <div v-else-if="type === 'C'">
        C
      </div>
      <div v-else>
        Not A/B/C
      </div>
    </div>

    <hr>
    <div>
      <h2>template组件上的 v-if</h2>
      <button @click="ok = !ok">切换ok-{{ ok }}</button>
      <template v-if="ok">
        <h1>Title</h1>
        <p>Paragraph 1</p>
        <p>Paragraph 2</p>
      </template>
    </div>

    <div>
      <h2>v-show</h2>
      <button @click="okShow = !okShow">切换okShow-{{ okShow }}</button>
      <h1 v-show="okShow">Hello!</h1>
      <!-- 隐藏的时候 <h1 style="display: none;">Hello!</h1> -->
    </div>

    <div>
      <h2>v-if vs. v-show</h2>
      <div>
        v-if 是“真实的”按条件渲染，因为它确保了在切换时，条件区块内的事件监听器和子组件都会被销毁与重建。
        <br>
        v-if 也是惰性的：如果在初次渲染时条件值为 false，则不会做任何事。条件区块只有当条件首次变为 true 时才被渲染。
        <br>
        相比之下，v-show 简单许多，元素无论初始条件如何，始终会被渲染，只有 CSS display 属性会被切换。
        <br>
        总的来说，v-if 有更高的切换开销，而 v-show 有更高的初始渲染开销。因此，如果需要频繁切换，则使用 v-show 较好；如果在运行时绑定条件很少改变，则 v-if 会更合适。
      </div>
    </div>

    <div>
      <h2>v-if 和 v-for</h2>
      当 v-if 和 v-for 同时存在于一个元素上的时候，v-if 会首先被执行

      警告：同时使用 v-if 和 v-for 是不推荐的，因为这样二者的优先级不明显
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const awesome = ref(true)
const type = ref('A')
const ok = ref(true)
const okShow = ref(true)
</script>
