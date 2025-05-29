<!-- 模版语法 -->
<template>
  <div>
    <h1><a href="https://cn.vuejs.org/guide/essentials/template-syntax.html" target="_blank">模版语法</a></h1>
    <hr>
    <div>显示值: {{ msg }}</div>
    <h2>指令 Directives</h2>
    <h2>Attribute 绑定</h2>
    <div v-bind:cId="dynamicId">Message: {{ mesgLog }}</div>
    <h2>原始 HTML</h2>
    <p>Using text interpolation: {{ rawHtml }}</p>
    <p>Using v-html directive: <span v-html="rawHtml"></span></p>
    <h2>简写</h2>
    <div :cId="dynamicId">Message: {{ msgLogSimple }}</div>
    <h2>布尔型 Attribute</h2>
    <button :disabled="true">Button</button>
    <button :disabled="disabled">Button</button>
    <div>
      <h2>动态绑定多个值</h2>
      <div>
        `const objectOfAttrs = { id: 'container', class: 'wrapper', style:
        'background-color:green' }

        <div v-bind="objectOfAttrs">这是一个实例：{{ divContent }}</div>
        `
      </div>
    </div>

    <div>
      <h2>使用 JavaScript 表达式</h2>
      <div>
        {{ number + 1 }}
        <hr />

        {{ ok ? "YES" : "NO" }}
        <hr />

        {{ message.split("").reverse().join("") }}
        <hr />

        <div :id="`list-${id}`"></div>
      </div>
    </div>

    <div>
      <h2>仅支持表达式</h2>
      <!-- 这是一个语句，而非表达式 -->
      `{{ `var a = 1` }}不支持`
      <hr />
      <!-- 条件控制也不支持，请使用三元表达式 -->
      `{{ "if (ok) { return message }" }}不支持`
    </div>

    <div>
      <h2>调用函数</h2>
      <time :title="toTitleDate(date)" :datetime="date.toString()">
        {{ formatDate(date) }}
      </time>
    </div>

    <h2>条件渲染</h2>
    <p v-if="seen">Now you see me</p>

    <div>
      <h2>参数 Arguments</h2>
      <a v-bind:href="url" target="_blank"> 点击展示图片 </a>
      <br />
      <!-- 简写 -->
      <a :href="url" target="_blank"> 点击展示图片 </a>
    </div>

    <div>
      <h2>点击事件</h2>
      <p v-if="seen">Now you see me</p>
      <a v-on:click="doSomething"> 这是一个点击事件 </a>
      <br />

      <!-- 简写 -->
      <a @click="doSomething"> 这是一个点击事件【简写】 </a>
    </div>

    <div>
      <h2>动态参数</h2>
      <a v-bind:[attributeName]="url"> 动态属性-点击图片 </a>
      <br>
      <!-- 简写 -->
      <a :[attributeName]="url"> 动态属性-点击图片（简写） </a>
      <br>

      <a v-on:[eventName]="doSomething"> 动态方法 </a>
      <br>

      <!-- 简写 -->
      <a @[eventName]="doSomething"> 动态方法（简写） </a>
    </div>

    <div>
      <h2>修饰符 Modifiers</h2>
      <form @submit.prevent="onSubmit">点击【修饰符 Modifiers-无效】(阻止preven)</form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
// about 页面逻辑
const msg = "hello";

const rawHtml = '<span style="color: red">This should be red</span>';
const mesgLog =
  '标签属性的添加方式：【div v-bind:cId="dynamicId">Message: {{ mesgLog }}</div>】';
const msgLogSimple =
  '标签属性的添加方式[简写]：【<div :cId="dynamicId">Message: {{ msgLogSimple }}</div>】';
const dynamicId = "idCode";
const disabled = false;
const objectOfAttrs = {
  id: "container",
  class: "wrapper",
  style: "background-color: yellow",
};
const divContent = `<div v-bind="objectOfAttrs"><div id="container" class="wrapper" style="background-color: green;">Hello</div></div>`;

const number = 1;
const ok = true;
const message = "hello";
const id = 1;

const date = new Date();
const toTitleDate = (date: Date) => {
  return date.toLocaleString();
};
const formatDate = (date: Date) => {
  return date.toLocaleString();
};

let seen = ref(false);

const url =
  "https://cdn.jsdelivr.net/gh/maoyln/maoyl-img/blog/7511748175316_.pic.jpg";

const doSomething = () => {
  console.log("doSomething");
};

const attributeName = "href";
const eventName = "click";

const onSubmit = () => {
  console.log("onSubmit");
}
</script>
