# 使用 Vue Draggable Plus 重构拖拽功能指南

## 概述

`berthing02.vue` 文件实现了复杂的拖拽功能，包括：
- 同一容器内的标签页排序
- 跨容器的标签页拖拽
- 自定义拖拽预览效果
- 插入位置指示器

原始代码约 **778 行**，使用原生 HTML5 Drag & Drop API 实现，代码复杂且难以维护。

## 推荐方案：Vue Draggable Plus

**Vue Draggable Plus** 是基于 Sortable.js 的 Vue 3 拖拽库，可以大幅简化代码。

### 优势

1. ✅ **代码量减少 70%+**：从 778 行减少到约 200 行
2. ✅ **更好的性能**：基于成熟的 Sortable.js
3. ✅ **TypeScript 支持**：完整的类型定义
4. ✅ **跨容器拖拽**：内置支持
5. ✅ **动画效果**：内置平滑动画
6. ✅ **易于维护**：API 简洁清晰

### 安装

```bash
pnpm add vue-draggable-plus
```

### 使用示例

参考 `berthing02-refactored.vue` 文件，主要变化：

#### 1. 模板部分简化

**之前**（手动处理所有拖拽事件）：
```vue
<div
  draggable="true"
  @dragstart="handleDragStart($event, tab, 'main')"
  @dragend="handleDragEnd"
  @dragover.prevent="handleTabDragOver($event, 'main', index)"
  @drop="handleDrop($event, 'main')"
>
```

**之后**（使用 VueDraggable 组件）：
```vue
<VueDraggable
  v-model="mainTabs"
  :group="{ name: 'tabs', pull: true, put: true }"
  item-key="key"
  @add="onAdd('main', $event)"
>
```

#### 2. 脚本部分简化

**之前**：需要手动处理：
- `handleDragStart` - 设置拖拽预览
- `handleDragEnd` - 清理状态
- `handleDragOver` - 计算插入位置
- `handleDrop` - 处理数据移动
- `setupDragPreview` - 创建预览元素
- `getClosestTabIndex` - 计算位置
- 等等...

**之后**：只需要：
- `onAdd` - 处理跨容器添加
- `onUpdate` - 处理同容器排序
- `onDragStart/End` - 可选的事件钩子

#### 3. 代码对比

| 功能 | 原始代码行数 | 使用插件后行数 | 减少 |
|------|------------|--------------|------|
| 拖拽逻辑 | ~420 行 | ~50 行 | 88% |
| 样式代码 | ~250 行 | ~150 行 | 40% |
| 总计 | ~778 行 | ~200 行 | 74% |

## 其他可选方案

### 1. Sortable.js（原生）

如果不想引入 Vue 组件，可以直接使用 Sortable.js：

```bash
pnpm add sortablejs
```

### 2. VueUse useDraggable

项目已安装 `@vueuse/core`，可以使用 `useDraggable`，但功能相对简单，可能无法完全满足跨容器拖拽需求。

## 迁移步骤

1. **安装依赖**
   ```bash
   pnpm add vue-draggable-plus
   ```

2. **替换组件**
   - 参考 `berthing02-refactored.vue`
   - 将原生拖拽事件替换为 VueDraggable 组件

3. **调整样式**
   - 移除自定义拖拽预览相关样式
   - 使用 VueDraggable 提供的 CSS 类

4. **测试功能**
   - 同容器内排序
   - 跨容器拖拽
   - 激活状态保持

## 注意事项

1. **拖拽预览**：Vue Draggable Plus 使用默认预览，如果需要自定义预览，可能需要额外配置
2. **插入指示器**：插件内置了插入指示器，样式可能需要调整
3. **兼容性**：确保 Vue 3 版本兼容

## 总结

使用 Vue Draggable Plus 可以：
- ✅ 大幅减少代码量
- ✅ 提高代码可维护性
- ✅ 获得更好的性能和用户体验
- ✅ 减少潜在的 bug

建议进行重构！

