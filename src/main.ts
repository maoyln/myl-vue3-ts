import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// UI 框架
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import ArcoVue from '@arco-design/web-vue'
import '@arco-design/web-vue/dist/arco.css'

// 全局样式
import './style.css'

// 创建 Vue 应用实例
const app = createApp(App)

// 注册插件
app.use(createPinia()) // 状态管理
app.use(router) // 路由
app.use(ElementPlus) // ElementPlus UI 框架
app.use(ArcoVue) // ArcoDesign UI 框架

// 挂载应用
app.mount('#app')
