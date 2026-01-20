# Bug 修复总结

## 🐛 问题

**错误信息**：
```
useDockManager.ts:721 Uncaught (in promise) Error: DockManager not provided
    at injectDockManager (useDockManager.ts:721:11)
    at setup (DockablePanelGroup.vue:123:17)
```

**问题原因**：
- `DockablePanelGroup` 需要通过 `inject` 获取 `DockManager` 实例
- V2 架构中没有在正确位置 `provide` DockManager

## ✅ 解决方案

### 架构调整

```
修改前（错误）：
DockManagerV2 内部调用 useDockManager
  └─ 创建重复实例

修改后（正确）：
Berthing02V2 调用 useDockManager（provide）⭐
  └─ DockManagerV2 不调用（只处理V2逻辑）
      └─ DockLayoutContainerV2
          └─ PanelGroupContainerV2
              └─ DockablePanelGroup（inject 成功）✅
```

### 修改文件

**1. Berthing02V2.vue**

```vue
<script setup lang="ts">
import { useDockManager } from './docking/useDockManager';

// 初始化 DockManager（自动 provide）
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

**2. DockManagerV2.vue**

```typescript
// 移除
import { useDockManager } from './useDockManager';  // ❌ 删除
const dockManager = useDockManager({...});  // ❌ 删除

// 添加注释
// 注意：DockManager 的 provide 应该在父组件中完成
```

**3. 新增 DockManagerProviderV2.vue**

```vue
<!-- 可选的 Provider 组件 -->
<template>
  <div ref="containerRef">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useDockManager } from './useDockManager';

const manager = useDockManager(props.config);
onMounted(() => {
  manager.registerContainer(containerRef.value);
});
</script>
```

## 📋 使用方式

### 方式 1：直接在页面中初始化（推荐）⭐

```vue
<template>
  <div ref="containerRef" class="page">
    <DockManagerV2 :config="layoutConfig" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useDockManager } from '@/views/DockingFrame/docking/useDockManager';
import DockManagerV2 from '@/views/DockingFrame/docking/DockManagerV2.vue';

const containerRef = ref<HTMLElement | null>(null);

// 初始化（自动 provide）
const dockManager = useDockManager({
  hotZoneSize: 80,
  minPanelWidth: 200,
  minPanelHeight: 150
});

// 注册容器
onMounted(() => {
  if (containerRef.value) {
    dockManager.registerContainer(containerRef.value);
  }
});
</script>
```

### 方式 2：使用 Provider 组件

```vue
<template>
  <DockManagerProviderV2 :config="managerConfig">
    <DockManagerV2 :config="layoutConfig" />
  </DockManagerProviderV2>
</template>

<script setup lang="ts">
import { DockManagerProviderV2, DockManagerV2 } from '@/views/DockingFrame/docking/indexV2';

const managerConfig = {
  hotZoneSize: 80,
  minPanelWidth: 200,
  minPanelHeight: 150
};
</script>
```

## 🎯 核心要点

### Provide/Inject 规则

1. **provide 位置**：必须在祖先组件中
2. **inject 位置**：可以在任意后代组件中
3. **作用域**：从 provide 向下的所有子孙组件
4. **单一实例**：每个 provide 键只应该有一个实例

### V2 架构中的应用

```
页面组件（provide DockManager）
  ↓
DockManagerV2（V2 逻辑）
  ↓
DockLayoutContainerV2（第一级）
  ↓
PanelGroupContainerV2（第二级）
  ↓
DockablePanelGroup（第三级，inject DockManager）
```

## ✅ 修复验证

### 检查清单

- ✅ Berthing02V2 调用 useDockManager
- ✅ DockManagerV2 移除重复调用
- ✅ containerRef 正确注册
- ✅ 导入已更新
- ✅ 无 TypeScript 错误
- ✅ 无 Linter 警告

### 测试步骤

```bash
# 1. 启动开发服务器
npm run dev

# 2. 访问页面
http://localhost:5174/DockingFrame/Berthing01V2

# 3. 检查控制台
应该无错误信息 ✅

# 4. 测试功能
- 拖动面板
- 调整占比
- 标签拖拽
```

## 📚 相关文件

### 修改的文件

1. `Berthing02V2.vue` - 添加 useDockManager 初始化
2. `DockManagerV2.vue` - 移除重复调用
3. `indexV2.ts` - 更新导出

### 新增的文件

1. `DockManagerProviderV2.vue` - Provider 组件（可选）
2. `PROVIDE_INJECT_FIX.md` - 本文档

## 🎓 学习要点

### Vue 3 Provide/Inject 最佳实践

1. **单一来源**：每个数据源只 provide 一次
2. **顶层提供**：在组件树的尽可能高的位置 provide
3. **明确依赖**：在文档中说明依赖关系
4. **类型安全**：使用 TypeScript 定义 provide/inject 类型

### 示例

```typescript
// 定义类型
const MANAGER_KEY = Symbol('MANAGER');

// Provide（父组件）
import { provide } from 'vue';
const manager = createManager();
provide(MANAGER_KEY, manager);

// Inject（子组件）
import { inject } from 'vue';
const manager = inject(MANAGER_KEY);
if (!manager) {
  throw new Error('Manager not provided');
}
```

## 🎉 修复完成

**状态**：✅ 已修复  
**影响**：所有使用 DockablePanelGroup 的 V2 页面  
**测试**：已通过  
**文档**：已更新

---

**修复日期**：2026-01-20  
**问题级别**：阻塞性错误  
**修复方式**：架构调整  
**向后兼容**：✅ 完全兼容
