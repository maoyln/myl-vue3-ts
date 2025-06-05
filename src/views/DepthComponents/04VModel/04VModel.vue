<template>
  <div>
    <h1>
      <a
        href="https://cn.vuejs.org/guide/components/v-model.html"
        target="_blank"
        >组件 v-models
      </a>
    </h1>

    <div>
      <h2>基本用法</h2>
      <div>v-model 可以在组件上使用以实现双向绑定</div>
      <div>从 Vue 3.4 开始，推荐的实现方式是使用 defineModel() 宏：</div>
      <br />
      <div>
        <div>
          defineModel() 返回的值是一个 ref。它可以像其他 ref
          一样被访问以及修改，不过它能起到在父组件和当前变量之间的双向绑定的作用：
        </div>

        <ul>
          <li>它的 .value 和父组件的 v-model 的值同步；</li>
          <li>当它被子组件变更了，会触发父组件绑定的值一起更新。</li>
        </ul>
        <br />
        <div>
          这意味着你也可以用 v-model 把这个 ref 绑定到一个原生 input
          元素上，在提供相同的 v-model 用法的同时轻松包装原生 input 元素：
        </div>
      </div>
      <br />
      <div>
        <div>孩子组件如下：</div>
        <Child01 v-model="model"></Child01>
      </div>
    </div>

    <hr />
    <div>
      <h2>底层机制</h2>
      <div>defineModel 是一个便利宏。编译器将其展开为以下内容：</div>
      <ul>
        <li>一个名为 modelValue 的 prop，本地 ref 的值与其同步；</li>
        <li>
          一个名为 update:modelValue 的事件，当本地 ref 的值发生变更时触发。
        </li>
      </ul>
      <br />
      <div>
        <div>孩子组件如下：</div>
        <div>输入值：{{ foo }}</div>
        <Child02
          :modelValue="foo"
          @update:modelValue="($event) => (foo = $event)"
        />
      </div>
    </div>

    <hr />

    <div>
      <h2>v-model 的参数</h2>
      <div>组件上的 v-model 也可以接受一个参数：</div>

      <br />
      <div>
        <div>孩子组件如下：</div>
        <div>输入值：{{ bookTitle }}</div>
        <Child03 v-model:title="bookTitle" />
      </div>
    </div>

    <hr />

    <div>
      <h2>多个 v-model 绑定</h2>
      <div>组件上的每一个 v-model 都会同步不同的 prop，而无需额外的选项：</div>

      <br />
      <div>
        <div>孩子组件如下：</div>
        <div>输入值first：{{ first }}; 输入值last：{{ last }}</div>

        <Child04 v-model:first-name="first" v-model:last-name="last" />
      </div>
    </div>

    <hr />
  </div>
</template>

<script setup>
import { ref } from "vue";
import Child01 from "./components/Child01.vue";
import Child02 from "./components/Child02.vue";
import Child03 from "./components/Child03.vue";
import Child04 from "./components/Child04.vue";

const model = ref(0);
const foo = ref("");
const bookTitle = ref("这是一个标题参数");

const first = ref("");
const last = ref("");
</script>
