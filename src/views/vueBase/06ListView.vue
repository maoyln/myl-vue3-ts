<template>
  <div>
    <h1>
      <a
        href="https://cn.vuejs.org/guide/essentials/list.html#v-for-with-v-if"
        target="_blank"
        >条件渲染
      </a>
    </h1>

    <div>
      <h2>列表渲染</h2>
      <ul>
        <li v-for="item in items" :key="item.message">
          {{ item.message }}
        </li>
      </ul>
      <hr />
      <h3>第二参数-索引</h3>
      <ul>
        <li v-for="(item, index) in items" :key="item.message">
          {{ parentMessage }} - {{ index }} - {{ item.message }}
        </li>
      </ul>

      <hr />

      <!-- 有 index 索引时 -->
      <h3>使用解构</h3>
      <ul>
        <li v-for="({ message }, index) in items" :key="message">
          {{ message }} {{ index }}
        </li>
      </ul>

      <hr />
      <h3>多层嵌套的 v-for</h3>
      <ul>
        <li v-for="item in itemsHasChildren" :key="item.message">
          <ul>
            <li v-for="childItem in item.children" :key="childItem">
              {{ item.message }} - {{ childItem }}
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <div>
      <h2>v-for 与对象</h2>
      <ul>
        <li v-for="value in myObject" :key="value">
          {{ value }}
        </li>
      </ul>
    </div>

    <div>
      <h2>v-for 与 v-if</h2>
      当它们同时存在于一个节点上时，v-if 比 v-for 的优先级更高。这意味着 v-if
      的条件将无法访问到 v-for 作用域内定义的变量别名：
      这会抛出一个错误，因为属性 todo 此时 没有在该实例上定义
      <!-- 
        <li v-for="todo in todos" v-if="!todo.isComplete">
          {{ todo.name }}
        </li>
      -->

      <h4>
        解决方案--在外出包装一个template组件进行遍历，在template中使用v-for,然后在内层做v-if的判断
      </h4>
    </div>

    <hr />
    <div>
      <h2>通过 key 管理状态</h2>
      <!-- key -->
      注意：key 在这里是一个通过 v-bind 绑定的特殊 attribute。请不要和在 v-for
      中使用对象里所提到的对象属性名相混淆。
    </div>

    <hr />
    <div>
      <h2>组件上使用 v-for</h2>
      <MyComponentList
        v-for="item in comList"
        :key="item.id"
        :value="item.name"
        :name="`这是名字:${item.name}-${item.id}`"
      />
    </div>

    <hr />
    <div>
      <h2>数组变化侦测</h2>
      <ul>
        <li v-for="item in myList" :key="item.id">{{ item.name }}</li>
      </ul>
      <!-- push -->
      <button @click="myList.push({ id: 4, name: 'Baz' })">添加</button>
      <!-- pop -->
      <button @click="myList.pop()">删除</button>
      <!-- shift -->
      <button @click="myList.shift()">shift</button>
      <!-- unshift -->
      <button @click="myList.unshift()">unshift</button>
      <!-- splice -->
      <button @click="myList.splice(1, 1)">splice</button>
      <!-- sort -->
      <button @click="myList.sort((a, b) => a.id - b.id)">sort</button>
      <!-- reverse -->
      <button @click="myList.reverse()">reverse</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import MyComponentList from "@/components/MyComponentList.vue";
import { ref, reactive } from "vue";

interface ListItem {
  id: number;
  name: string;
}

const parentMessage = ref("Parent");
const items = ref([{ message: "Foo" }, { message: "Bar" }]);

const itemsHasChildren = ref([
  { message: "Foo", children: ["Foo1", "Foo2"] },
  { message: "Bar", children: ["Bar1", "Bar2"] },
]);

const myObject = reactive({
  title: "How to do lists in Vue",
  author: "Jane Doe",
  publishedAt: "2016-04-10",
});

const comList: ListItem[] = reactive([
  {
    id: 1,
    name: "Foo",
  },
  {
    id: 2,
    name: "Bar",
  },
  {
    id: 3,
    name: "Baz",
  },
]);

const myList = reactive([
  {
    id: 6,
    name: "最后",
  },
  {
    id: 1,
    name: "Foo",
  },
  {
    id: 2,
    name: "Bar",
  },
  {
    id: 3,
    name: "Baz",
  },
  {
    id: 4,
    name: "sss",
  },
]);
</script>

<style></style>
