<template>
  <div>
    <h1>
      <a
        href="https://cn.vuejs.org/guide/essentials/computed.html"
        target="_blank"
        >计算属性</a
      >
    </h1>

    <div>
      <h2>基础示例</h2>
      <div>姓名：{{ author.name }}</div>
      <div>书籍：{{ author.books.join(", ") }}</div>
      <p>Has published books:</p>
      <span>{{ author.books.length > 0 ? "Yes" : "No" }}</span>
      <p>Has published books[computed]: {{ publishedBooksMessage }}</p>
      <p>
        动态:
        {{ now }} ==》【相比之下，方法调用总是会在重渲染发生时再次执行函数。】
      </p>
    </div>

    <div>
      <h2>可写计算属性</h2>
      <div>{{ fullName }}</div>
      <button @click="firstName += '1'">firstName += '1'</button>
      <div>
        <button @click="count++">点击+1--</button>
        {{ alwaysSmall }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from "vue";
const author = reactive({
  name: "John Doe",
  books: [
    "Vue 2 - Advanced Guide",
    "Vue 3 - Basic Guide",
    "Vue 4 - The Mystery",
  ],
});

const publishedBooksMessage = computed(() => {
  return author.books.length > 0 ? "Yes" : "No";
});

console.log(publishedBooksMessage, "publishedBooksMessage"); // ComputedRefImpl
console.log(publishedBooksMessage.value, "publishedBooksMessage.value"); // Yes
console.log(reactive(publishedBooksMessage), "reactive(publishedBooksMessage)"); // ComputedRefImpl

const now = computed(() => Date.now());

const firstName = ref("John");
const lastName = ref("Doe");

const fullName = computed({
  // getter
  get() {
    return firstName.value + " " + lastName.value;
  },
  // setter
  set(newValue) {
    // 注意：我们这里使用的是解构赋值语法
    [firstName.value, lastName.value] = newValue.split(" ");
  },
});


const count = ref(2)

const alwaysSmall = computed({
  get(previous) {
    if (count.value <= 5) {
      console.log(count.value, '是否走了-get'); // 走了
      return count.value
    }

    return previous
  },
  set(newValue: number) {
    console.log(count.value, '是否走了-set'); // 没走
    count.value = newValue * 2
  }
})
</script>
