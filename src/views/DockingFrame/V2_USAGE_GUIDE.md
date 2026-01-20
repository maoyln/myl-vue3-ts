# 三级面板结构 V2 - 使用指南

## 🎯 架构概述

### 三级结构

```
第一级：DockLayoutContainer（布局容器）
  ├─ 定义停靠位置（left/right/top/bottom/float）
  ├─ 管理容器级别的尺寸和位置
  └─ 包含多个分组

第二级：PanelGroupContainer（面板组容器）
  ├─ 定义分组占比（groupRatio）
  ├─ 定义内部面板排列方向（direction）
  └─ 包含多个面板

第三级：DockablePanelGroup（面板组）
  ├─ 定义面板占比（panelRatio）
  ├─ 包含标签页（tabs）
  └─ 完整的面板功能（拖拽、合并等）
```

## 📦 组件说明

### 1. DockManagerV2（顶层管理器）

**职责**：
- 管理所有布局容器
- 处理全局拖拽和热区检测
- 协调容器间的交互

**Props**：
```typescript
interface Props {
  config: DockLayoutConfig;  // 完整布局配置
}
```

**Events**：
```typescript
@config-change: (config: DockLayoutConfig) => void;  // 配置变化
@panel-dock: (panelId: string, targetId: string) => void;  // 面板停靠
@panel-undock: (panelId: string) => void;  // 面板取消停靠
```

### 2. DockLayoutContainerV2（第一级）

**职责**：
- 定义布局容器
- 处理容器拖拽和调整大小
- 管理分组列表

**Props**：
```typescript
interface Props {
  container: DockLayoutContainer;
}
```

**布局模式**：

| 模式 | position | 布局方式 | 调整 |
|------|----------|---------|------|
| 左侧停靠 | left | 固定宽度，100%高度 | 可调宽度 |
| 右侧停靠 | right | 固定宽度，100%高度 | 可调宽度 |
| 顶部停靠 | top | 100%宽度，固定高度 | 可调高度 |
| 底部停靠 | bottom | 100%宽度，固定高度 | 可调高度 |
| 悬浮 | float | 固定宽高，自由定位 | 可调宽高 |

### 3. PanelGroupContainerV2（第二级）

**职责**：
- 组织多个面板
- 管理面板占比
- 提供面板间调整手柄

**Props**：
```typescript
interface Props {
  config: PanelGroupContainer;
  containerDirection: LayoutDirection;  // 所在容器方向
  showGroupResizeHandle?: boolean;  // 是否显示分组调整手柄
}
```

**布局计算**：

```typescript
// 分组在容器中的占比
groupStyle = {
  flex: `0 0 ${groupRatio * 100}%`
};

// 面板在分组中的占比
panelStyle = {
  flex: `0 0 ${panelRatio * 100}%`
};
```

### 4. DockablePanelGroup（第三级）

**职责**：
- 完整的面板功能
- 标签页管理
- 拖拽、合并等交互

**保留原有功能**：
- ✅ 标签页管理
- ✅ 拖拽移动
- ✅ 标签拖拽
- ✅ 面板合并
- ✅ 调整大小

**新增属性**：
```typescript
panelRatio?: number;  // 在分组中的占比
containerDirection?: 'horizontal' | 'vertical';  // 所在容器方向
```

## 🚀 快速开始

### 1. 基本使用

```vue
<template>
  <DockManagerV2
    :config="layoutConfig"
    @config-change="handleConfigChange"
  />
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import DockManagerV2 from './docking/DockManagerV2.vue';
import type { DockLayoutConfig } from './docking/typesV2';

const layoutConfig = reactive<DockLayoutConfig>({
  config: {
    hotZoneSize: 80,
    minPanelWidth: 200,
    minPanelHeight: 150,
    minGroupRatio: 0.1,
    minPanelRatio: 0.1,
    snapThreshold: 20
  },
  containers: [
    // 添加容器配置
  ]
});

function handleConfigChange(newConfig: DockLayoutConfig) {
  console.log('配置更新', newConfig);
}
</script>
```

### 2. 创建停靠容器

```typescript
// 左侧停靠容器
const leftContainer: DockLayoutContainer = {
  id: 'container_left',
  position: 'left',
  width: 300,
  height: 600,
  resizable: true,
  minWidth: 200,
  minHeight: 150,
  groups: [
    {
      id: 'group_1',
      groupRatio: 0.6,  // 占容器 60% 高度
      direction: 'vertical',  // 内部面板纵向排列
      resizable: true,
      minRatio: 0.1,
      panels: [
        // 面板配置
      ]
    },
    {
      id: 'group_2',
      groupRatio: 0.4,  // 占容器 40% 高度
      direction: 'vertical',
      resizable: true,
      minRatio: 0.1,
      panels: [
        // 面板配置
      ]
    }
  ]
};
```

### 3. 创建面板

```typescript
const panel: PanelGroupV2 = {
  id: 'panel_explorer',
  tabs: [
    { id: 'tab_explorer', title: '资源管理器', icon: '📁', closable: false }
  ],
  activeTabId: 'tab_explorer',
  width: 300,
  height: 300,
  originalWidth: 300,
  originalHeight: 300,
  x: 0,
  y: 0,
  zIndex: 1000,
  state: 'docked',
  position: 'left',
  resizable: true,
  panelRatio: 0.5  // 在分组中占 50%
};
```

### 4. 创建悬浮容器

```typescript
const floatContainer: DockLayoutContainer = {
  id: 'container_float',
  position: 'float',
  width: 400,
  height: 300,
  x: 600,  // X 坐标
  y: 200,  // Y 坐标
  zIndex: 1001,
  resizable: true,
  minWidth: 200,
  minHeight: 150,
  groups: [
    {
      id: 'group_float',
      groupRatio: 1,  // 占容器 100%
      direction: 'vertical',
      resizable: true,
      minRatio: 0.1,
      panels: [
        // 面板配置
      ]
    }
  ]
};
```

## 🎨 布局示例

### 示例 1：IDE 布局

```
┌─────────────────────────────────────┐
│            顶部工具栏                │
├───────┬─────────────────┬───────────┤
│       │                 │           │
│ 左侧  │                 │   右侧    │
│ 面板  │   主编辑区域     │   面板    │
│ (30%) │                 │   (20%)   │
│       │                 │           │
├───────┴─────────────────┴───────────┤
│          底部终端 (25%)              │
└─────────────────────────────────────┘
```

**配置**：

```typescript
{
  containers: [
    {
      id: 'left',
      position: 'left',
      width: 300,  // 30%
      groups: [
        { groupRatio: 0.5, panels: [...] },  // 上半部分
        { groupRatio: 0.5, panels: [...] }   // 下半部分
      ]
    },
    {
      id: 'right',
      position: 'right',
      width: 200,  // 20%
      groups: [
        { groupRatio: 1, panels: [...] }
      ]
    },
    {
      id: 'bottom',
      position: 'bottom',
      height: 250,  // 25%
      groups: [
        { groupRatio: 1, panels: [...] }
      ]
    }
  ]
}
```

### 示例 2：PhotoShop 风格布局

```
┌─────────┬───────────────────┬─────────┐
│  工具   │                   │  图层   │
│  面板   │                   │  面板   │
│  (15%) │   主画布区域       │  (20%)  │
│         │                   │         │
├─────────┤                   ├─────────┤
│  历史   │                   │  属性   │
│  面板   │                   │  面板   │
└─────────┴───────────────────┴─────────┘
```

**配置**：

```typescript
{
  containers: [
    {
      id: 'left',
      position: 'left',
      width: 180,
      groups: [
        { groupRatio: 0.7, panels: [toolPanel] },
        { groupRatio: 0.3, panels: [historyPanel] }
      ]
    },
    {
      id: 'right',
      position: 'right',
      width: 240,
      groups: [
        { groupRatio: 0.6, panels: [layersPanel] },
        { groupRatio: 0.4, panels: [propertiesPanel] }
      ]
    }
  ]
}
```

## 🔄 拖拽交互

### 1. 面板拖拽

**操作流程**：

```
1. 鼠标按住面板标题栏
   ↓
2. 移动超过阈值
   ↓
3. 显示拖拽 Ghost
   ↓
4. 检测热区
   ├─ 边缘热区：创建新容器
   ├─ 容器热区：合并到容器
   └─ 面板热区：合并到面板
   ↓
5. 释放鼠标完成操作
```

**热区类型**：

| 热区类型 | 触发条件 | 效果 |
|---------|---------|------|
| edge | 鼠标在屏幕边缘 80px 内 | 创建新的停靠容器 |
| container | 鼠标在现有容器上 | 合并到现有容器 |
| group | 鼠标在分组上 | 合并到分组 |
| panel | 鼠标在面板上 | 合并到面板 |

### 2. 占比调整

**分组占比调整**：

```
用户拖动分组手柄
  ↓
计算拖动距离
  ↓
更新当前分组和相邻分组的 groupRatio
  ↓
限制最小占比（10%）
  ↓
归一化总占比为 100%
```

**面板占比调整**：

```
用户拖动面板手柄
  ↓
计算拖动距离
  ↓
更新当前面板和相邻面板的 panelRatio
  ↓
限制最小占比（10%）
  ↓
归一化总占比为 100%
```

## ⚙️ 配置选项

### 全局配置

```typescript
interface DockManagerV2Config {
  hotZoneSize: number;       // 热区大小，默认 80px
  minPanelWidth: number;     // 最小面板宽度，默认 200px
  minPanelHeight: number;    // 最小面板高度，默认 150px
  minGroupRatio: number;     // 最小分组占比，默认 0.1
  minPanelRatio: number;     // 最小面板占比，默认 0.1
  snapThreshold: number;     // 吸附阈值，默认 20px
}
```

**推荐配置**：

```typescript
// 小屏幕
{
  hotZoneSize: 60,
  minPanelWidth: 180,
  minPanelHeight: 120,
  minGroupRatio: 0.15,
  minPanelRatio: 0.15,
  snapThreshold: 15
}

// 中等屏幕（默认）
{
  hotZoneSize: 80,
  minPanelWidth: 200,
  minPanelHeight: 150,
  minGroupRatio: 0.1,
  minPanelRatio: 0.1,
  snapThreshold: 20
}

// 大屏幕
{
  hotZoneSize: 100,
  minPanelWidth: 250,
  minPanelHeight: 180,
  minGroupRatio: 0.08,
  minPanelRatio: 0.08,
  snapThreshold: 25
}
```

## 📝 API 参考

### DockManagerV2 API

```typescript
// Props
interface Props {
  config: DockLayoutConfig;
}

// Events
{
  'config-change': (config: DockLayoutConfig) => void;
  'panel-dock': (panelId: string, targetId: string) => void;
  'panel-undock': (panelId: string) => void;
}
```

### DockLayoutContainerV2 API

```typescript
// Props
interface Props {
  container: DockLayoutContainer;
}

// Events
{
  'container-drag': (event: MouseEvent) => void;
  'container-resize': (width: number, height: number) => void;
  'container-dock': (position: string) => void;
  'panel-drag-start': (panel: PanelGroupV2, event: MouseEvent) => void;
  'panel-close': (panelId: string) => void;
  'panel-merge': (sourcePanelId: string, targetPanelId: string) => void;
}
```

### PanelGroupContainerV2 API

```typescript
// Props
interface Props {
  config: PanelGroupContainer;
  containerDirection: LayoutDirection;
  showGroupResizeHandle?: boolean;
}

// Events
{
  'panel-drag-start': (panel: PanelGroupV2, event: MouseEvent) => void;
  'group-resize': (newRatio: number) => void;
  'panel-ratio-change': (panelId: string, newRatio: number) => void;
  'panel-close': (panelId: string) => void;
  'panel-merge': (sourcePanelId: string, targetPanelId: string) => void;
}
```

## 🎯 最佳实践

### 1. 占比设置

- 分组占比总和应为 1.0
- 面板占比总和应为 1.0
- 最小占比不应小于 0.1（10%）

### 2. 方向选择

- 左右停靠容器：建议使用 vertical 方向分组
- 上下停靠容器：建议使用 horizontal 方向分组
- 悬浮容器：根据需求选择

### 3. 性能优化

- 限制同时打开的面板数量
- 使用虚拟滚动处理大量标签页
- 添加防抖处理拖拽事件

### 4. 用户体验

- 提供清晰的视觉反馈
- 合理的最小尺寸限制
- 直观的热区提示

## 🐛 常见问题

### Q1：占比总和不为 100%

**问题**：分组或面板的占比总和不等于 1.0

**解决**：调用归一化函数

```typescript
function normalizeRatios(items: Array<{ratio: number}>) {
  const total = items.reduce((sum, item) => sum + item.ratio, 0);
  if (total > 0) {
    items.forEach(item => {
      item.ratio = item.ratio / total;
    });
  }
}
```

### Q2：拖拽不响应

**问题**：面板拖拽没有反应

**检查**：
1. 是否正确处理 mousedown 事件
2. 是否阻止了事件冒泡
3. 是否正确设置拖拽状态

### Q3：热区不显示

**问题**：拖拽时看不到热区预览

**检查**：
1. hotZoneSize 配置是否合理
2. z-index 是否足够高
3. 容器元素是否正确注册

## 📚 相关文档

- [架构分析](./ARCHITECTURE_ANALYSIS.md)
- [类型定义](./docking/typesV2.ts)
- [演示页面](./Berthing02V2.vue)

---

**版本**: 2.0.0  
**最后更新**: 2026-01-20  
**作者**: Assistant
