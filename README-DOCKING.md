# 停泊吸附系统 - 架构文档

## 📋 概述

这是一个类似 Photoshop 的停泊吸附系统，支持面板的拖拽、停靠、分离和组合功能。

## 🏗️ 架构设计

### 核心组件

```
src/components/docking/
├── types.ts                  # TypeScript 类型定义
├── useDockManager.ts         # 核心状态管理 Composable
├── DockContainer.vue         # 容器组件（提供吸附热区）
├── DockablePanel.vue         # 可吸附面板组件
└── index.ts                  # 统一导出
```

### 1. 类型系统 (`types.ts`)

定义了整个系统的类型约束：

- **DockPosition**: 停靠位置（left/right/top/bottom/center/float）
- **PanelState**: 面板状态（docked/floating/dragging）
- **PanelInstance**: 面板实例数据
- **DragInfo**: 拖拽过程信息
- **SnapResult**: 吸附检测结果
- **DockManagerConfig**: 管理器配置

### 2. 核心逻辑 (`useDockManager.ts`)

**职责**：
- 管理所有面板的状态
- 处理拖拽逻辑
- 检测吸附（容器边缘 & 面板边缘）
- 计算停靠位置
- 管理面板层级（z-index）

**关键功能**：

```typescript
// 添加面板
addPanel(config: PanelConfig): PanelInstance

// 开始/进行/结束拖拽
startDrag(panelId: string, x: number, y: number)
onDrag(x: number, y: number)
endDrag()

// 检测吸附
detectSnap(panel: PanelInstance, mouseX: number, mouseY: number): SnapResult

// 激活面板（提升 z-index）
activatePanel(panelId: string)
```

**状态管理**：
- 使用 Vue 3 Composition API
- 通过 Provide/Inject 共享状态
- 响应式数据确保 UI 自动更新

### 3. 容器组件 (`DockContainer.vue`)

**职责**：
- 提供主内容区域
- 监听全局鼠标事件（拖拽）
- 显示吸附热区提示
- 渲染所有面板

**特性**：
- 四周边缘有吸附热区（默认 50px）
- 拖拽时显示蓝色半透明提示区域
- 自动响应窗口大小变化

### 4. 面板组件 (`DockablePanel.vue`)

**职责**：
- 渲染单个可吸附面板
- 处理拖拽交互
- 支持停靠/浮动状态切换
- 支持调整大小（浮动状态）

**功能**：
- 标题栏：显示标题、操作按钮
- 内容区：通过 slot 插入自定义内容
- 调整大小手柄：右侧、底部、右下角
- 状态指示：不同状态有不同视觉效果

## 🎯 核心功能实现

### 1. 吸附检测算法

#### 容器边缘吸附
```typescript
// 检测鼠标是否在容器边缘热区内
if (mouseX - containerRect.left < hotZoneSize) {
  // 吸附到左边缘
  return { shouldSnap: true, position: 'left' }
}
```

#### 面板边缘吸附
```typescript
// 检测鼠标是否接近其他已停靠面板的边缘
if (Math.abs(mouseX - panelRect.left) < snapThreshold) {
  // 吸附到该面板左侧
  return { shouldSnap: true, position: 'left', targetPanelId }
}
```

### 2. 拖拽流程

```
用户按下标题栏
    ↓
startDrag() - 记录初始位置和偏移
    ↓
onDrag() - 持续更新面板位置，检测吸附
    ↓
显示吸附提示区域（蓝色半透明）
    ↓
endDrag() - 确定最终位置，执行吸附或保持浮动
```

### 3. 状态转换

```
浮动 (floating)
    ↓ 拖到边缘
停靠 (docked)
    ↓ 点击分离按钮
浮动 (floating)
```

### 4. 面板关系管理

- **父子关系**：面板可以停靠到其他面板上
  - `panel.dockedWith`: 停靠在哪个面板
  - `panel.dockedPanels`: 哪些面板停靠在自己上

- **移除逻辑**：
  - 移除面板时，其子面板自动转为浮动状态
  - 从父面板的子列表中移除引用

## 🎨 视觉设计

### 主题配色
- 背景：深色系（#1e1e1e, #2d2d2d）
- 面板：渐变背景，带阴影
- 吸附提示：蓝色半透明（rgba(66, 133, 244, 0.3)）
- 按钮：悬停效果，过渡动画

### 交互反馈
- 拖拽时：降低透明度，改变光标
- 吸附时：显示目标区域高亮
- 悬停时：增强阴影，提升视觉层次

## 📝 使用示例

### 基础使用

```vue
<template>
  <DockContainer ref="dockContainerRef" :config="dockConfig">
    <div>主内容区域</div>
  </DockContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { DockContainer } from '@/components/docking';

const dockContainerRef = ref();

// 添加面板
function addPanel() {
  const manager = dockContainerRef.value?.manager;
  manager?.addPanel({
    id: 'my-panel',
    title: '我的面板',
    width: 300,
    height: 400,
    defaultPosition: 'right',
  });
}
</script>
```

### 自定义面板内容

面板内容通过 `DockablePanel` 的默认 slot 显示占位符。
如果需要自定义内容，可以：

1. **扩展 DockablePanel 组件**，添加具名 slot
2. **创建专门的面板组件**，包装 DockablePanel

示例：

```vue
<DockablePanel :panel="panel">
  <template #default="{ panel }">
    <MyCustomContent :data="panel.data" />
  </template>
</DockablePanel>
```

## ⚙️ 配置选项

```typescript
interface DockManagerConfig {
  snapThreshold?: number;    // 吸附阈值，默认 30px
  hotZoneSize?: number;      // 热区大小，默认 50px
  minPanelWidth?: number;    // 最小宽度，默认 200px
  minPanelHeight?: number;   // 最小高度，默认 100px
  maxPanels?: number;        // 最大面板数
}
```

## 🔧 扩展点

### 1. 添加新的停靠位置
修改 `DockPosition` 类型和 `updateDockedPanelPosition()` 方法

### 2. 自定义吸附算法
修改 `detectSnap()` 方法中的检测逻辑

### 3. 支持面板分组
扩展 `PanelInstance`，添加 `groupId` 字段

### 4. 持久化面板布局
监听 `panels` 状态变化，保存到 localStorage

### 5. 添加动画效果
在状态转换时添加 CSS 或 JavaScript 动画

## 🎯 最佳实践

1. **性能优化**
   - 使用防抖处理 resize 事件
   - 拖拽时减少不必要的计算
   - 使用 CSS transform 而非 position 优化动画

2. **类型安全**
   - 充分利用 TypeScript 类型检查
   - 为所有公共 API 提供类型定义

3. **状态管理**
   - 使用 Provide/Inject 避免 props 传递
   - 保持状态不可变性（readonly）

4. **用户体验**
   - 提供清晰的视觉反馈
   - 合理的默认值
   - 支持键盘快捷键（可扩展）

## 📚 API 参考

### DockContainer Props

```typescript
interface Props {
  config?: DockManagerConfig;
}
```

### DockablePanel Props

```typescript
interface Props {
  panel: PanelInstance;
}
```

### useDockManager 返回值

```typescript
interface DockManager {
  // 状态
  panels: Readonly<Ref<Map<string, PanelInstance>>>;
  panelList: ComputedRef<PanelInstance[]>;
  dragInfo: Readonly<Ref<DragInfo | null>>;
  hoveredZone: Readonly<Ref<DockZone | null>>;
  containerRect: Readonly<Ref<DOMRect | null>>;

  // 方法
  registerContainer(element: HTMLElement): void;
  addPanel(config: PanelConfig): PanelInstance;
  removePanel(panelId: string): void;
  getPanel(panelId: string): PanelInstance | undefined;
  startDrag(panelId: string, x: number, y: number): void;
  onDrag(x: number, y: number): void;
  endDrag(): void;
  activatePanel(panelId: string): void;
  resizePanel(panelId: string, width: number, height: number): void;
}
```

## 🚀 未来改进方向

1. ✅ 基础拖拽和停靠
2. ✅ 面板间相互吸附
3. ✅ 调整大小功能
4. 🔄 面板标签页（多个面板合并）
5. 🔄 保存和恢复布局
6. 🔄 面板最小化/最大化
7. 🔄 拖拽预览（幽灵面板）
8. 🔄 自定义主题
9. 🔄 键盘快捷键支持
10. 🔄 触摸设备支持

## 📄 许可证

MIT License

---

**作者**: 前端架构大师
**版本**: 1.0.0
**更新日期**: 2026-01-13
