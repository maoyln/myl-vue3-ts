下面是一个 **基于 Vue 3 + TypeScript** 的项目初始化方案，整合了你需要的技术栈：

* ✅ TypeScript
* ✅ Vue Router
* ✅ Pinia
* ✅ Element Plus
* ✅ Axios
* ✅ @vueuse/core

---

## 📦 项目初始化步骤

### ✅ 1. 使用 Vite 初始化 Vue3 + TS 项目

```bash
npm init vite@latest vue3-ts-app -- --template vue-ts
cd vue3-ts-app
```

---

### ✅ 2. 安装依赖

```bash
npm install
npm install vue-router@4 pinia element-plus axios @vueuse/core
```

---

### ✅ 3. 项目结构建议

```
vue3-ts-app/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── router/
│   ├── store/
│   ├── views/
│   ├── App.vue
│   ├── main.ts
│   └── types/
├── index.html
├── tsconfig.json
└── vite.config.ts
```

---

## 🧩 主要文件配置

---

### `src/main.ts`

```ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

app.use(router)
app.use(createPinia())
app.use(ElementPlus)

app.mount('#app')
```

---

### `src/router/index.ts`

```ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
```

---

### `src/store/index.ts`

```ts
import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', {
  state: () => ({
    count: 0,
  }),
  actions: {
    increment() {
      this.count++
    },
  },
})
```

---

### `src/views/Home.vue`

```vue
<template>
  <div>
    <h1>Home</h1>
    <el-button type="primary" @click="increment">点击：{{ store.count }}</el-button>
  </div>
</template>

<script setup lang="ts">
import { useMainStore } from '@/store'
const store = useMainStore()
const increment = () => store.increment()
</script>
```

---

### `src/views/About.vue`

```vue
<template>
  <div>
    <h1>About Page</h1>
  </div>
</template>

<script setup lang="ts">
// about 页面逻辑
</script>
```

---

### ✍️ 添加 Axios 实例（`src/utils/request.ts`）

```ts
import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

request.interceptors.request.use(config => {
  // 可添加 token 等逻辑
  return config
})

request.interceptors.response.use(
  response => response.data,
  error => Promise.reject(error)
)

export default request
```

---

### ✅ 使用 @vueuse/core（示例）

```ts
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)
```

---

## 🚀 启动项目

```bash
npm run dev
```

---

## 🏁 总结

| 项目特性         | 是否集成 |
| ------------ | ---- |
| Vue 3        | ✅    |
| TypeScript   | ✅    |
| Vue Router   | ✅    |
| Pinia        | ✅    |
| Element Plus | ✅    |
| Axios        | ✅    |
| @vueuse/core | ✅    |

---

如需进一步扩展（如布局、权限控制、菜单配置、mock 支持等），我也可以帮你快速加上，是否需要我继续完善？
