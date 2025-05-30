<template>
  <div>
    <h1>
      <a
        href="https://cn.vuejs.org/guide/essentials/component-basics.html"
        target="_blank"
        >组件基础
      </a>
    </h1>

    <div>
      <h2>定义一个组件</h2>
      <Child01 />
      <Child01 />
      <Child02 />
    </div>

    <hr />

    <div>
      <h2>使用组件</h2>
      <ButtonCounter />
      <ButtonCounter />
      <hr />
      <h2>在 DOM 中书写该模板</h2>
      <button-counter></button-counter>
    </div>

    <hr />
    <div>
      <h2>传参props</h2>
      <BlogPost title="这是一个参数，在子组件中显示" />
      <BlogPost02 title="这是一个参数，在子组件中显示" />
    </div>

    <hr />
    <div>
      <h2>组件循环</h2>
      <BlogPost v-for="post in posts" :key="post.id" :title="post.title" />
    </div>
    <hr />

    <div>
      <h2>监听事件</h2>
      <div :style="{ fontSize: postFontSize + 'em' }">
        <BlogPost03
          v-for="post in posts"
          :key="post.id"
          :title="post.title"
          @enlarge-text="postFontSize += 0.1"
          @small-text="postFontSize -= 0.1"
        />
      </div>

      <hr />
      <div>
        <h2>defineEmits</h2>
        <div :style="{ fontSize: postFontSize + 'em' }">
          <BlogPost04
            v-for="post in posts"
            :key="post.id"
            :title="post.title"
            @enlarge-text="postFontSize += 0.1"
            @small-text="postFontSize -= 0.1"
          />
        </div>
      </div>

      <hr />
      <div>
        <h2>使用setup()</h2>
        <div :style="{ fontSize: postFontSize + 'em' }">
          <BlogPost05
            v-for="post in posts"
            :key="post.id"
            :title="post.title"
            @enlarge-text="postFontSize += 0.1"
            @small-text="postFontSize -= 0.1"
          />
        </div>
      </div>
    </div>

    <hr />
    <div>
      <h2>通过插槽来分配内容</h2>
      <alert-box> 这里来演示一个插槽-改文本为传入内容 </alert-box>
    </div>

    <hr />
    <div>
      <h2>动态组件</h2>
      <!-- currentTab 改变时组件也改变 -->
      <component :is="AlertBox"></component>
      <div>
        在上面的例子中，被传给 :is 的值可以是以下几种：
        <ul>
          <li>被注册的组件名</li>
          <li>导入的组件对象</li>
        </ul>
      </div>
    </div>

    <hr>
    <div>
      <h2>DOM 内模板解析注意事项</h2>
      <h3>大小写区分</h3>
      <!-- <blog-post-in post-title="hello!" @update-post="onUpdatePost"></blog-post-in> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Child01 from "./components/Child01.vue";
import Child02 from "./components/Child02.vue";
import ButtonCounter from "./components/ButtonCounter.vue";
import BlogPost from "./components/BlogPost.vue";
import BlogPost02 from "./components/BlogPost02.vue";
import BlogPost03 from "./components/BlogPost03.vue";
import BlogPost04 from "./components/BlogPost04.vue";
import BlogPost05 from "./components/BlogPost05.vue";
import AlertBox from "./components/AlertBox.vue";

const posts = ref([
  { id: 1, title: "My journey with Vue" },
  { id: 2, title: "Blogging with Vue" },
  { id: 3, title: "Why Vue is so fun" },
]);

const postFontSize = ref(1);

// JavaScript 中的 camelCase
// const BlogPostIn = {
//   props: ['postTitle'],
//   emits: ['updatePost'],
//   template: `
//     <h3>{{ postTitle }}</h3>
//   `
// }

// const onUpdatePost = () => {
//   console.log("update post");
// }
</script>
