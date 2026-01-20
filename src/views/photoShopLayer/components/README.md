# Photoshop 风格面板组合布局系统

## 概述

这是一套完整的 PS 风格面板组合布局组件，包含 6 种常用面板类型，支持折叠、关闭等交互功能。

## 组件结构

```
components/
├── PanelContainer.vue    # 面板容器（主组件）
├── Panel.vue             # 单个面板包装器
├── panels/               # 具体面板内容
│   ├── ColorPanel.vue    # 颜色面板
│   ├── LayerPanel.vue    # 图层面板
│   ├── ChannelPanel.vue  # 通道面板
│   ├── PropertyPanel.vue # 属性面板
│   ├── PatternPanel.vue  # 图案面板
│   └── ThreeDPanel.vue   # 3D 面板
└── README.md
```

## 使用方法

### 1. 基础用法

```vue
<template>
  <PanelContainer :panels="panels" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PanelContainer from './components/PanelContainer.vue';

const panels = ref([
  {
    id: 'color',
    title: '颜色',
    collapsed: false,
    closable: true,
    visible: true,
    type: 'color'
  },
  // ... 更多面板
]);
</script>
```

### 2. 面板配置说明

每个面板对象包含以下属性：

- `id`: string - 面板唯一标识
- `title`: string - 面板标题
- `collapsed`: boolean - 是否折叠
- `closable`: boolean - 是否可关闭
- `visible`: boolean - 是否可见
- `type`: string - 面板类型（color/layer/channel/property/pattern/3d）

### 3. 支持的面板类型

#### 颜色面板 (ColorPanel)
- 颜色选择器（渐变区域 + 色相条）
- 当前颜色显示（新/旧颜色对比）
- RGB/HSB 数值输入
- 快速色板

#### 图层面板 (LayerPanel)
- 图层列表（支持选择、显示/隐藏、锁定）
- 图层缩略图
- 不透明度显示
- 图层操作按钮（新建、删除、分组等）

#### 通道面板 (ChannelPanel)
- RGB 通道列表
- 单色通道（红/绿/蓝）
- Alpha 通道
- 通道预览缩略图
- 通道操作（载入选区、新建、删除）

#### 属性面板 (PropertyPanel)
- 不透明度/填充滑块
- 混合模式选择
- 变换属性（位置、旋转）
- 效果按钮（投影、发光、描边等）

#### 图案面板 (PatternPanel)
- 图案预设网格显示
- 图案缩放/角度调整
- 图案操作（新建、载入）

#### 3D 面板 (ThreeDPanel)
- 3D 模式选择（查看/移动/旋转/缩放）
- 3D 对象列表
- 变换控制（位置/旋转 XYZ）
- 渲染设置（质量/光照/阴影）

## 功能特性

### 1. 折叠/展开
点击面板头部可以折叠或展开面板内容，节省空间。

### 2. 关闭面板
点击面板右上角的 × 按钮可以关闭面板（需要 `closable: true`）。

### 3. 自动滚动
面板容器支持垂直滚动，可以容纳任意数量的面板。

### 4. 响应式交互
- 按钮悬停效果
- 选中状态高亮
- 平滑动画过渡

## 样式定制

### 1. 颜色主题

面板使用深色主题，主要颜色变量：

```css
/* 背景色 */
--bg-primary: #2c2c2c;
--bg-secondary: #262626;
--bg-tertiary: #383838;

/* 边框色 */
--border-color: #404040;
--border-dark: #1a1a1a;

/* 高亮色 */
--highlight: #4a90e2;
--highlight-light: #6ab0f3;

/* 文字色 */
--text-primary: #cccccc;
--text-secondary: #999999;
```

### 2. 修改面板宽度

在 `PanelContainer.vue` 中修改：

```css
.panel-container {
  width: 320px; /* 默认宽度，可自定义 */
}
```

### 3. 自定义面板间距

在 `Panel.vue` 中修改：

```css
.panel-content {
  padding: 12px; /* 内边距 */
}
```

## 扩展开发

### 添加新的面板类型

1. 在 `panels/` 目录下创建新的面板组件
2. 在 `PanelContainer.vue` 中导入并添加到模板
3. 在面板配置中添加新的 type

示例：

```vue
<!-- panels/NewPanel.vue -->
<template>
  <div class="new-panel">
    <!-- 面板内容 -->
  </div>
</template>

<script setup lang="ts">
// 面板逻辑
</script>

<style scoped>
/* 面板样式 */
</style>
```

```vue
<!-- PanelContainer.vue -->
<template v-else-if="panel.type === 'new'">
  <NewPanel />
</template>
```

## 性能优化建议

1. **懒加载面板内容**：对于复杂面板，可以使用 `v-if` 替代 `v-show`
2. **虚拟滚动**：图层列表较多时，考虑使用虚拟滚动
3. **防抖处理**：滑块等高频交互事件添加防抖

## 浏览器兼容性

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 已知问题

1. 面板折叠动画在某些浏览器可能不够流畅
2. 触摸设备上的滑块操作体验有待优化

## 未来计划

- [ ] 支持面板拖拽排序
- [ ] 支持面板停靠/浮动
- [ ] 支持自定义面板布局保存
- [ ] 支持面板标签页模式
- [ ] 添加更多预设面板类型

## 许可证

MIT License
