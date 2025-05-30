<template>
  <div>
    <h1>
      <a
        href="https://cn.vuejs.org/guide/essentials/template-refs.html"
        target="_blank"
        >模板引用
      </a>
    </h1>

    <div>
      <h2>模板引用</h2>

      <div>
        <p>Message is: {{ text }}</p>
        <div>
          3.5之前：【const myInput = ref(null);】必须和模板里的 ref 同名
        </div>
        <input ref="myInput" v-model="text" />
        <div>
          3.5之后：【const inputRef = useTemplateRef('my-input');】
        </div>
        <input ref="my-input" v-model="text" />
      </div>
    </div>

    <hr>

    <div>
      <h2>组件上的 ref</h2>
      <div>
        <Child ref="myChild" />

      </div>
      <div>
        有一个例外的情况，使用了 （script setup） 的组件是默认私有的：一个父组件无法访问到一个使用了 （script setup） 的子组件中的任何东西，除非子组件在其中通过 defineExpose 宏显式暴露：
      </div>

    </div>

    <div>
      <h2>v-for 中的模板引用</h2>
      <div>
        <ul>
          <li v-for="item in list" ref="items" :key="item">
            {{ item }}
          </li>
        </ul>
      </div>
    </div>

    <hr>
    <div>
      <h2>函数模板引用</h2>
      <input :ref="(el) => { console.log(el); /* 将 el 赋值给一个数据属性或 ref 变量 */ }">
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, onMounted, reactive /** watchEffect **/ } from "vue";
import Child from "./components/Child.vue";

const text = ref("");

// 第一个参数必须与模板中的 ref 值匹配
const inputRef = useTemplateRef("my-input"); // 3.5 前的用法

// 必须和模板里的 ref 同名
const myInput = ref(null);
// 如果不使用 <script setup>，需确保从 setup() 返回 ref：
// export default {
//   setup() {
//     const input = ref(null)
//     // ...
//     return {
//       input
//     }
//   }
// }

// watchEffect(() => {
//   if (myInput.value) {
//     (myInput.value as HTMLInputElement)?.focus?.()
//   } else {
//     // 此时还未挂载，或此元素已经被卸载（例如通过 v-if 控制）
//     console.log('还没有挂在');
//   }
// })

// 3.5 之前的用法
const myChild = ref(null);

const myChildRef = useTemplateRef("myChild");

onMounted(() => {
  console.log(inputRef, "inputRef");
  console.log(inputRef.value, "inputRef.value");

  console.log(myInput, "myInput");
  console.log(myInput.value, "myInput.value");

  (inputRef.value as HTMLInputElement).focus();

  console.log('----------------------黄金分割线--------------------------');
  console.log(myChild, "myChild");
  console.log(myChild.value, "myChild.value");

  console.log(myChildRef, "myChildRef");
  console.log(myChildRef.value, "myChildRef.value");

  // 获取字组件的数据
  const myChildRefData = reactive(myChildRef.value as any);
  console.log(myChildRefData, "myChildRefData");
  console.log(myChildRefData.a, "myChildRefData.a");
  console.log(myChildRefData.b, "myChildRefData.b");
  console.log((myChildRef.value as any).a, "(myChildRef.value as any).a");
  console.log((myChildRef.value as any).b, "(myChildRef.value as any).b");


  console.log('----------------------黄金分割线--------------------------');


  console.log(itemRefs, 'itemRefs');
  console.log((itemRefs as any).value.map((i: any) => i.textContent), 'itemRefs.value.map(i => i.textContent)');
  console.log(itemRefs.value, 'itemRefs.value');
});

const list = ref([1, 2, 3])

// const items = ref([]) // 3.5 前
const itemRefs = useTemplateRef('items') // 3.5 之后
</script>
