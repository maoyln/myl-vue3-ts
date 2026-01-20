# PhotoShow 面板组合布局系统

> 🎯 **展示与布局分离**：统一的展示形态，数据驱动的布局方式！详见 [ARCHITECTURE.md](./ARCHITECTURE.md)

## 📖 项目简介

这是一个基于 Vue 3 + TypeScript 的 PhotoShop 风格面板组合布局系统，支持**停靠（Dock）**和**悬浮（Float）**两种布局模式。

**核心特性**：
- 🎨 **展示统一**：停靠和悬浮使用同一个展示组件
- 🏗️ **布局分离**：LayoutManager 统一控制所有布局逻辑
- 📐 **三级分层**：容器→分组→面板（停靠模式）
- 🎈 **坐标定位**：fixed + x/y 的自由布局（悬浮模式）
- 📋 **数据驱动**：修改 JSON 配置即可切换布局方式

## 🎯 核心特性

- ✅ **停靠布局**：支持左、右、上、下四个方向的停靠容器
- ✅ **悬浮面板**：支持自由拖拽、调整大小、层级管理
- ✅ **标签页组合**：面板可聚合为标签页组，支持标签页切换和关闭
- ✅ **配置化驱动**：通过 JSON 配置数据快速构建复杂布局
- ✅ **响应式设计**：支持动态调整面板尺寸和位置
- ✅ **类型安全**：完整的 TypeScript 类型定义

## 📁 文件结构（最终版）

```
panelDemo/
├── types.ts                          # 类型定义文件
├── configs.ts                        # 配置数据文件（4套方案）
├── TabItemComponent.vue              # 标签项组件
├── PanelGroupComponent.vue           # 面板内容组件（Tab + Content）
├── PanelContainer.vue                # ⭐ 统一展示容器（停靠和悬浮完全一样）
├── LayoutManagerComponent.vue        # ⭐ 布局控制器（统一管理所有布局）
├── DockingPanel.vue                  # 演示Demo主页面
├── index.ts                          # 导出文件
├── index.vue                         # 路由入口
├── README.md                         # 使用说明文档
├── ARCHITECTURE.md                   # 架构详细说明
└── REFACTORING_SUMMARY.md            # 重构总结
```

**组件数量**：最终精简到 **5 个核心组件** ✨

## 🚀 快速开始

### 1. 查看演示 Demo

直接访问 `DockingPanel.vue` 页面即可查看完整的演示效果。

### 2. 使用布局管理器（推荐）

#### 停靠和悬浮混合布局

```vue
<template>
  <LayoutManagerComponent
    :config="layoutConfig"
    @config-change="handleConfigChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { config1_RightDockWithFloat } from './configs';

const layoutConfig = ref(config1_RightDockWithFloat.layoutManagerConfig);

const handleConfigChange = (newConfig) => {
  console.log('布局配置已更新', newConfig);
};
</script>
```

### 3. 单独使用展示组件

```vue
<template>
  <LayoutManagerComponent
    :config="layoutConfig.layoutManagerConfig"
    :show-debug-info="true"
    @config-change="handleConfigChange"
    @tab-change="handleTabChange"
    @tab-close="handleTabClose"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LayoutManagerComponent from './LayoutManagerComponent.vue';
import { config1_RightDockWithFloat } from './configs';

const layoutConfig = ref(config1_RightDockWithFloat);

const handleConfigChange = (config) => {
  console.log('配置变化:', config);
};

const handleTabChange = (groupId, tabId) => {
  console.log('标签页切换:', groupId, tabId);
};

const handleTabClose = (groupId, tabId) => {
  console.log('标签页关闭:', groupId, tabId);
};
</script>
```

### 3. 自定义配置数据

参考 `configs.ts` 中的示例，创建自己的布局配置：

```typescript
import type { LayoutConfig } from './types';

export const myCustomConfig: LayoutConfig = {
  layoutManagerConfig: {
    managerId: "my_layout",
    dockManagerConfig: {
      hotZoneSize: 20,
      minPanelWidth: 120,
      minPanelHeight: 80
    },
    dockContainerConfig: {
      containerId: "my_dock_container",
      dockPosition: "right",
      containerSize: {
        width: 360,
        height: 800
      },
      isResizable: true,
      groupList: [
        // 配置分组和面板...
      ]
    },
    floatPanelGroupList: [
      // 配置悬浮面板...
    ]
  }
};
```

## 📐 架构设计

### 核心理念：展示与布局分离

```
展示层（PanelContainer）
  - 只负责渲染面板内容
  - 不关心布局方式
  - 停靠和悬浮完全一样

布局层（LayoutManager）
  - 控制停靠的三级分层
  - 控制悬浮的坐标定位
  - 处理拖拽和调整大小
```

### 架构层次

```
LayoutManager（唯一的布局控制器）
│
├── 停靠容器（三级分层 - div嵌套）
│   <div class="dock-container">          ← 第一级
│     <div class="dock-group">            ← 第二级（flex: groupRatio）
│       <div class="dock-panel">          ← 第三级（flex: panelRatio）
│         <PanelContainer />              ← 纯展示
│       </div>
│     </div>
│   </div>
│
└── 悬浮面板（扁平结构 - fixed定位）
    <div class="float-panel" :style="{ position: fixed, x, y }">
      <div class="drag-handle">           ← 拖拽手柄（透明）
      <PanelContainer />                  ← 纯展示（与停靠一样）
      <div class="resize-handles">        ← 调整大小手柄
    </div>
```

### 差异对比

| 特性 | 停靠模式 | 悬浮模式 | 说明 |
|------|---------|---------|------|
| **展示组件** | PanelContainer | PanelContainer | **同一个** ⭐ |
| 外层容器 | div.dock-panel | div.float-panel | LayoutManager创建 |
| 布局方式 | flex + 占比 | fixed + 坐标 | LayoutManager控制 |
| 三级分层 | ✅ 必需 | ❌ 扁平 | 数据结构不同 |
| 拖拽手柄 | ❌ 无 | ✅ 透明覆盖层 | LayoutManager添加 |
| 边框样式 | 直角 | 圆角 | CSS样式 |
| 调整大小 | ❌ | ✅ | LayoutManager处理 |

## 🎨 配置方案说明

项目提供了 4 套预设配置方案：

### 方案1：右侧停靠 + 双悬浮

**适用场景**：常规编辑工作流，右侧工具栏 + 悬浮快捷工具

**配置特点**：
- 右侧停靠容器，宽度 360px
- 3个分组：效果与资源、图层管理、快捷与调色
- 2个悬浮面板：常用工具组合、3D效果独立面板

### 方案2：底部停靠布局

**适用场景**：时间轴编辑、代码调试等需要横向空间的场景

**配置特点**：
- 底部停靠容器，宽度 1200px，高度 240px
- 3个分组：效果预览、时间轴控制、调试信息
- 无悬浮面板

### 方案3：左侧停靠 + 多悬浮

**适用场景**：资源浏览器 + 多个独立工具窗口

**配置特点**：
- 左侧停靠容器，宽度 280px
- 2个分组：文件浏览、项目管理
- 3个悬浮面板：属性编辑器、历史记录、画笔工具

### 方案4：全场景组合

**适用场景**：专业级复杂工作流，多停靠区域和悬浮工具

**配置特点**：
- 右侧停靠容器，宽度 400px
- 3个分组：图层与蒙版、调整与效果、资源库
- 4个悬浮面板：颜色选择器、画笔设置、路径工具、信息面板

## 🔧 核心类型定义

### LayoutConfig

```typescript
interface LayoutConfig {
  layoutManagerConfig: LayoutManagerConfig;
}
```

### LayoutManagerConfig

```typescript
interface LayoutManagerConfig {
  managerId: string;
  dockManagerConfig: DockManagerConfig;
  dockContainerConfig: DockContainerConfig;
  floatPanelGroupList: PanelGroup[];
}
```

### DockContainerConfig

```typescript
interface DockContainerConfig {
  containerId: string;
  dockPosition: 'left' | 'right' | 'top' | 'bottom';
  containerSize: ContainerSize;
  isResizable: boolean;
  groupList: DockGroup[];
}
```

### PanelGroup（悬浮面板组）

```typescript
interface PanelGroup {
  id: string;
  title: string;
  icon?: string;
  tabs: TabItem[];
  activeTabId: string;
  width: number;
  height: number;
  x: number;
  y: number;
  zIndex: number;
  state: 'docked' | 'floating';
  position: DockPosition;
  resizable: boolean;
  closable: boolean;
}
```

## 📊 数据流说明

1. **配置初始化**：通过 `configs.ts` 加载预设配置
2. **布局渲染**：`LayoutManager` 根据配置渲染停靠容器和悬浮面板
3. **用户交互**：拖拽、调整大小、切换标签页等操作
4. **状态更新**：触发事件，更新配置数据
5. **重新渲染**：响应式更新界面

## 🎮 交互功能

### 停靠容器

- ✅ 支持左、右、上、下四个方向停靠
- ✅ 支持动态调整容器尺寸
- ✅ 支持分组占比调整
- ✅ 支持面板占比调整

### 悬浮面板

- ✅ 拖拽标题栏移动面板
- ✅ 拖拽右侧/底部边缘调整尺寸
- ✅ 拖拽右下角调整宽高
- ✅ 点击面板自动提升层级
- ✅ 最小化/最大化/关闭操作

### 标签页

- ✅ 点击切换激活标签页
- ✅ 点击关闭按钮关闭标签页
- ✅ 支持标签页拖拽（预留接口）

## 🛠️ 技术栈

- **Vue 3**：组合式 API
- **TypeScript**：完整类型支持
- **CSS**：模块化样式，支持深色主题

## 📝 后续扩展

- [ ] 支持标签页跨组拖拽
- [ ] 支持停靠热区识别
- [ ] 支持悬浮面板转停靠
- [ ] 支持停靠面板转悬浮
- [ ] 支持布局配置保存/加载
- [ ] 支持多停靠容器同时存在
- [ ] 支持面板内容组件动态加载

## 📧 联系方式

如有问题或建议，请联系开发团队。

---

**版本**: 1.0.0  
**最后更新**: 2026-01-20
