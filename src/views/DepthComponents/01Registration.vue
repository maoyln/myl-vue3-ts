<template>
  <div>
    <h1>
      <a
        href="https://cn.vuejs.org/guide/components/registration.html"
        target="_blank"
        >注册组件
      </a>
    </h1>

    <div>
      一个 Vue 组件在使用前需要先被“注册”，这样 Vue 才能在渲染模板时找到其对应的实现。组件注册有两种方式：全局注册和局部注册。
    </div>

    <hr>
    <div>
      <h2>全局注册</h2>
      <h3>我们可以使用 Vue 应用实例的 .component() 方法，让组件在当前 Vue 应用中全局可用。</h3>

          import { createApp } from 'vue'

          const app = createApp({})

          app.component(
            // 注册的名字
            'MyComponent',
            // 组件的实现
            {
              /* ... */
            }
          ) 

          <h3>如果使用单文件组件，你可以注册被导入的 .vue 文件：</h3>

          import MyComponent from './App.vue'

          app.component('MyComponent', MyComponent)

          <h3>.component() 方法可以被链式调用</h3>

          app
          .component('ComponentA', ComponentA)
          .component('ComponentB', ComponentB)
          .component('ComponentC', ComponentC)

          <h3>全局注册的组件可以在此应用的任意组件的模板中使用：</h3>

          <!-- 这在当前应用的任意组件中都可用 -->
          <!-- <ComponentA/> -->
          <!-- <ComponentB/> -->
          <!-- <ComponentC/> -->
    </div>

    <hr>
    <div>
      <h2>局部注册</h2>
      <div>
        全局注册虽然很方便，但有以下几个问题：
      </div>
      <ul>
        <li>全局注册，但并没有被使用的组件无法在生产打包时被自动移除 (也叫“tree-shaking”)。如果你全局注册了一个组件，即使它并没有被实际使用，它仍然会出现在打包后的 JS 文件中。</li>
        <li>全局注册在大型项目中使项目的依赖关系变得不那么明确。在父组件中使用子组件时，不太容易定位子组件的实现。和使用过多的全局变量一样，这可能会影响应用长期的可维护性。</li>
      </ul>
      <div>
        相比之下，局部注册的组件需要在使用它的父组件中显式导入，并且只能在该父组件中使用。它的优点是使组件之间的依赖关系更加明确，并且对 tree-shaking 更加友好。
      </div>

      <!-- <script setup>
      import ComponentA from './ComponentA.vue'
      </script>

      <template>
        <ComponentA />
      </template> -->

    </div>

    <hr>

    <div>
      <h2>组件名格式</h2>
      <ul>
        <li>PascalCase 是合法的 JavaScript 标识符。这使得在 JavaScript 中导入和注册组件都很容易，同时 IDE 也能提供较好的自动补全。</li>
        <li>'PascalCase '/>' 在模板中更明显地表明了这是一个 Vue 组件，而不是原生 HTML 元素。同时也能够将 Vue 组件和自定义元素 (web components) 区分开来。</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>