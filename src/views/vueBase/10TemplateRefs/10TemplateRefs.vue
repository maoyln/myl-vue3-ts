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
        <input ref="my-input" v-model="text" />
        <input ref="myInput" v-model="text" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, onMounted /** watchEffect **/ } from "vue";

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

onMounted(() => {
  console.log(inputRef, "inputRef");
  console.log(inputRef.value, "inputRef.value");

  console.log(myInput, "myInput");
  console.log(myInput.value, "myInput.value");

  (inputRef.value as HTMLInputElement).focus();
});
</script>
