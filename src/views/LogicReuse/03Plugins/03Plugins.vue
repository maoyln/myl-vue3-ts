<template>
  <div>
    <h1>
      <a
        href="https://cn.vuejs.org/guide/reusability/plugins.html"
        target="_blank"
        >插件</a
      >
    </h1>
    <div>
      <div>
        <h2>介绍</h2>
        <div>
          插件 (Plugins) 是一种能为 Vue 添加全局功能的工具代码。下面是如何安装一个插件的示例：
        </div>

        <div>
          import { createApp } from 'vue'

          const app = createApp({})

          app.use(myPlugin, {
            /* 可选的选项 */
          })

        </div>

        <div>
          插件没有严格定义的使用范围，但是插件发挥作用的常见场景主要包括以下几种：
        </div>
        <br>
        <ul>
          <li>通过 app.component() 和 app.directive() 注册一到多个全局组件或自定义指令。</li>
          <li>通过 app.provide() 使一个资源可被注入进整个应用。</li>
          <li>向 app.config.globalProperties 中添加一些全局实例属性或方法</li>
          <li>一个可能上述三种都包含了的功能库 (例如 vue-router)。</li>
        </ul>

        <br>
        <div>下面是一个插件返回的内容</div>
        <div>
          方式一：{{ $translate('greetings.hello') }}
          <br>
          方式二：{{i18n.greetings.hello}}
        </div>
      </div>
    </div>
  </div>
  </template>
  
  <script setup>
  
  
  import i18nPlugin from '../../../plugins/i18n'
  import { getCurrentInstance, inject } from 'vue';
  const instance = getCurrentInstance();
  const app = instance.appContext.app;
  // 方式一：
  app.use(i18nPlugin, {
    greetings: {
      hello: ['Bonjaour!', '1212', 1212] // '可以是任意值'
    }
  })


    
  // 方式二：
    const i18n = inject('i18n')
    console.log(i18n.greetings.hello) //  ['Bonjaour!', '1212', 1212]
  </script>