# Provide/Inject 问题修复说明

## ❌ 问题描述

```
useDockManager.ts:721 Uncaught (in promise) Error: DockManager not provided
    at injectDockManager (useDockManager.ts:721:11)
    at setup (DockablePanelGroup.vue:123:17)
```

**原因**：`DockablePanelGroup` 组件需要通过 `inject` 获取 `DockManager` 实例，但在 V2 架构中没有正确提供。

## ✅ 解决方案

### 架构调整

**修改前**（错误）：

```
DockManagerV2（调用 useDockManager - provide）
  └─ DockLayoutContainerV2
      └─ PanelGroupContainerV2
          └─ DockablePanelGroup（inject）
```

**问题**：DockManagerV2 内部调用 useDockManager 会创建重复实例。

**修改后**（正确）：

```
Berthing02V2（调用 useDockManager - provide）⭐
  └─ DockManagerV2（仅处理 V2 逻辑）
      └─ DockLayoutContainerV2
          └─ PanelGroupContainerV2
              └─ DockablePanelGroup（inject）✅
```

**优势**：
- provide 在最外层，作用域覆盖所有子组件
- DockManagerV2 职责更单一
- 没有重复的管理器实例

## 🔧 修改内容

### 1. 修改 Berthing02V2.vue

**添加 DockManager 初始化**：

```vue
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useDockManager } from './docking/useDockManager';

const mainContainerRef = ref<HTMLElement | null>(null);

// 初始化 DockManager（提供 provide/inject 上下文）
const dockManager = useDockManager({
  hotZoneSize: 80,
  minPanelWidth: 200,
  minPanelHeight: 150
});

// 注册容器
onMounted(() => {
  if (mainContainerRef.value) {
    dockManager.registerContainer(mainContainerRef.value);
  }
});
</script>

<template>
  <div ref="mainContainerRef" class="main-content">
    <DockManagerV2 :config="layoutConfig" />
  </div>
</template>
```

### 2. 修改 DockManagerV2.vue

**移除重复的 useDockManager 调用**：

```typescript
// 修改前
import { useDockManager } from './useDockManager';

const dockManager = useDockManager({...});  // ❌ 重复

// 修改后
// 不再导入和调用 useDockManager
// DockManager 的 provide 由父组件完成 ✅
```

### 3. 创建 DockManagerProviderV2.vue（可选）

如果需要独立的 Provider 组件：

```vue
<template>
  <div ref="containerRef" class="dock-manager-provider">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useDockManager } from './useDockManager';

const containerRef = ref<HTMLElement | null>(null);
const manager = useDockManager(props.config);

onMounted(() => {
  if (containerRef.value) {
    manager.registerContainer(containerRef.value);
  }
});
</script>
```

**使用方式**：

```vue
<DockManagerProviderV2 :config="config">
  <DockManagerV2 :config="layoutConfig" />
</DockManagerProviderV2>
```

## 📋 使用模式

### 模式 1：直接在页面中初始化（推荐）⭐

```vue
<!-- Berthing02V2.vue -->
<script setup lang="ts">
import { useDockManager } from './docking/useDockManager';

// 初始化（自动 provide）
const dockManager = useDockManager({...});

onMounted(() => {
  dockManager.registerContainer(containerRef.value);
});
</script>

<template>
  <div ref="containerRef">
    <DockManagerV2 :config="layoutConfig" />
  </div>
</template>
```

### 模式 2：使用 Provider 组件

```vue
<template>
  <DockManagerProviderV2 :config="managerConfig">
    <DockManagerV2 :config="layoutConfig" />
  </DockManagerProviderV2>
</template>
```

## ✅ 验证修复

### 检查清单

- ✅ Berthing02V2 调用 useDockManager
- ✅ DockManagerV2 移除重复调用
- ✅ containerRef 正确注册
- ✅ DockablePanelGroup 能正确 inject

### 测试步骤

1. 启动开发服务器：`npm run dev`
2. 访问 `/DockingFrame/Berthing01V2` 路由
3. 确认页面正常显示
4. 确认无控制台错误

## 🎯 Provide/Inject 原理

### Vue 3 Provide/Inject 机制

```
父组件（provide）
  ↓
  子组件
  ↓
  孙组件（inject）✅

说明：
- provide 必须在祖先组件中调用
- inject 可以在任意后代组件中调用
- 作用域：从 provide 位置向下所有子孙组件
```

### 错误的模式

```
组件 A（provide）
  └─ 组件 B（又一次 provide）❌
      └─ 组件 C（inject）

问题：创建了多个实例，可能导致状态不一致
```

### 正确的模式

```
组件 A（provide）✅
  └─ 组件 B
      └─ 组件 C（inject）✅

优势：单一实例，状态统一
```

## 📚 相关文档

- [useDockManager 源码](./docking/useDockManager.ts)
- [DockablePanelGroup 源码](./docking/DockablePanelGroup.vue)
- [Vue 3 Provide/Inject 文档](https://vuejs.org/guide/components/provide-inject.html)

## 🐛 常见错误

### 错误 1：忘记调用 useDockManager

```vue
<!-- ❌ 错误 -->
<template>
  <DockManagerV2 :config="config" />
</template>

<script setup>
// 忘记调用 useDockManager
</script>
```

**解决**：在父组件中调用

```vue
<!-- ✅ 正确 -->
<script setup>
import { useDockManager } from './docking/useDockManager';

const manager = useDockManager({...});
</script>
```

### 错误 2：在错误的位置 provide

```vue
<!-- ❌ 错误 -->
<DockManagerV2>
  <!-- provide 在这里 -->
  <DockLayoutContainer>
    <DockablePanelGroup />  <!-- inject 失败 -->
  </DockLayoutContainer>
</DockManagerV2>
```

**解决**：provide 必须在更外层

```vue
<!-- ✅ 正确 -->
<script setup>
const manager = useDockManager({...});  // provide 在这里
</script>

<template>
  <DockManagerV2>
    <DockLayoutContainer>
      <DockablePanelGroup />  <!-- inject 成功 ✅ -->
    </DockLayoutContainer>
  </DockManagerV2>
</template>
```

### 错误 3：重复 provide

```typescript
// ❌ 错误：在多个地方调用 useDockManager
// 父组件
const manager1 = useDockManager({...});

// 子组件
const manager2 = useDockManager({...});  // 创建了第二个实例
```

**解决**：只在最外层调用一次

```typescript
// ✅ 正确：只在父组件调用
const manager = useDockManager({...});
```

## ✅ 修复确认

- ✅ Berthing02V2 提供 DockManager
- ✅ DockManagerV2 不再重复创建
- ✅ DockablePanelGroup 能正确注入
- ✅ 无控制台错误

---

**修复时间**：2026-01-20  
**修复状态**：✅ 已完成  
**影响范围**：仅 V2 架构
