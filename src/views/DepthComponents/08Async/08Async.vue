<template>
  <div>
    <h1>
      <a href="https://cn.vuejs.org/guide/components/async.html" target="_blank"
        >异步组件
      </a>
    </h1>

    <div>
      <h2>基本用法</h2>
      <div>import { defineAsyncComponent } from 'vue'</div>
      <div>
        {{
          `
          const AsyncComp = defineAsyncComponent(() => {
            return new Promise((resolve, reject) => {
              // ...从服务器获取组件
              resolve(/* 获取到的组件 */)
            })
          })
          // ... 像使用其他一般组件一样使用 'AsyncComp'
          `
        }}
      </div>

      <div>
        <span>下面是一个组件：</span>
        <Child011 />
      </div>
    </div>

    <hr />
    <div>
      <h2>全局注册</h2>
      <div>
        {{
          `
          app.component('MyComponent', defineAsyncComponent(() =>
            import('./components/MyComponent.vue')
          ))
          `
        }}
      </div>
    </div>

    <hr />
    <div>
      <h2>加载与错误状态</h2>
      <div>
        <AsyncComp />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineAsyncComponent } from "vue";
const Child011 = defineAsyncComponent(() => import("./components/Child01.vue"));

const LoadingComponent = defineAsyncComponent(() =>
  import("./components/Loading.vue")
);
const ErrorComponent = defineAsyncComponent(() =>
  import("./components/Error.vue")
);
const AsyncComp = defineAsyncComponent({
  // 加载函数
  loader: () => import("./components/Child02.vue"),

  // 加载异步组件时使用的组件
  loadingComponent: LoadingComponent,
  // 展示加载组件前的延迟时间，默认为 200ms
  delay: 200,

  // 加载失败后展示的组件
  errorComponent: ErrorComponent,
  // 如果提供了一个 timeout 时间限制，并超时了
  // 也会显示这里配置的报错组件，默认值是：Infinity
  timeout: 3000,
});
</script>
