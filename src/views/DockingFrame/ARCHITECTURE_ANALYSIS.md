# 三级面板结构分析与重构方案

## 📊 当前结构分析

### panelDemo 的三级结构（参考）

```
第一级：DockContainer（容器层）
  ├─ 属性：dockPosition (left/right/top/bottom)
  ├─ 布局：flex布局，方向由position决定
  ├─ 尺寸：containerSize (width × height)
  └─ 包含：多个 DockGroup

第二级：DockGroup（分组层）
  ├─ 属性：groupRatio (0~1) - 占比
  ├─ 布局：根据容器方向排列（行组/列组）
  ├─ 调整：分组间有调整手柄
  └─ 包含：多个 DockPanel

第三级：DockPanel（面板层）
  ├─ 属性：panelRatio (0~1) - 占比
  ├─ 渲染：PanelContainer 组件
  ├─ 调整：面板间有调整手柄
  └─ 内容：标签页 + 内容区域
```

### DockingFrame 的当前结构

```
DockablePanelGroup（单一组件）
  ├─ 功能：拖拽、吸附、标签拖动、合并
  ├─ 状态：docked/floating/dragging
  ├─ 位置：left/right/top/bottom/float
  └─ 问题：缺少明确的层级结构
```

## 🎯 重构目标

### 新的三级结构

```
第一级：DockLayoutContainer（布局容器）
  ├─ 职责：定义整体布局方向和停靠位置
  ├─ 布局方式：
  │   ├─ 纵向布局：吸附顶部/底部，可调整高度
  │   ├─ 横向布局：吸附左侧/右侧，可调整宽度
  │   └─ 悬浮布局：可调整高度和宽度
  └─ 包含：多个 PanelGroupContainer

第二级：PanelGroupContainer（面板组容器）
  ├─ 职责：组织多个面板，管理占比
  ├─ 属性：
  │   ├─ groupRatio: 在容器中的占比
  │   ├─ direction: 内部面板排列方向
  │   └─ resizable: 是否可调整
  ├─ 功能：
  │   ├─ 拖拽调整分组占比
  │   ├─ 分组间调整手柄
  │   └─ 面板合并到分组
  └─ 包含：多个 DockablePanelGroup

第三级：DockablePanelGroup（面板组 - 保持原功能）
  ├─ 职责：单个面板的完整功能
  ├─ 保留功能：
  │   ├─ 标签页管理
  │   ├─ 拖拽移动
  │   ├─ 吸附停靠
  │   ├─ 标签拖拽
  │   ├─ 面板合并
  │   └─ 调整大小
  └─ 新增：在分组内的占比属性
```

## 📋 数据结构设计

### 类型定义

```typescript
// 第一级：布局容器配置
interface DockLayoutConfig {
  id: string;
  position: 'left' | 'right' | 'top' | 'bottom' | 'float';
  width: number;
  height: number;
  x?: number;  // 悬浮时的坐标
  y?: number;
  groups: PanelGroupContainerConfig[];
}

// 第二级：面板组容器配置
interface PanelGroupContainerConfig {
  id: string;
  groupRatio: number;  // 在容器中的占比 (0~1)
  direction: 'horizontal' | 'vertical';  // 内部面板排列方向
  resizable: boolean;
  panels: PanelConfig[];
}

// 第三级：面板配置（继承现有 PanelGroup）
interface PanelConfig {
  id: string;
  panelRatio: number;  // 在分组中的占比 (0~1)
  tabs: TabItem[];
  activeTabId: string;
  width: number;
  height: number;
  resizable: boolean;
  // ... 其他现有属性
}
```

## 🔧 实现方案

### 1. 创建第一级组件：DockLayoutContainer

**职责**：
- 定义整体布局容器
- 管理停靠位置（left/right/top/bottom/float）
- 处理容器级别的拖拽和调整
- 提供热区检测和吸附功能

**关键特性**：
```vue
<template>
  <div 
    class="dock-layout-container"
    :class="[`position-${position}`, `state-${state}`]"
    :style="containerStyle"
  >
    <!-- 分组容器列表 -->
    <PanelGroupContainer
      v-for="group in groups"
      :key="group.id"
      :config="group"
      :container-direction="containerDirection"
    />
    
    <!-- 容器调整手柄 -->
    <ResizeHandle v-if="resizable" />
    
    <!-- 热区预览 -->
    <DockZonePreview v-if="isDragging" />
  </div>
</template>
```

### 2. 创建第二级组件：PanelGroupContainer

**职责**：
- 管理一组面板
- 处理分组占比
- 提供分组间调整手柄
- 支持面板合并到分组

**关键特性**：
```vue
<template>
  <div 
    class="panel-group-container"
    :style="groupStyle"
  >
    <!-- 面板列表 -->
    <DockablePanelGroup
      v-for="panel in panels"
      :key="panel.id"
      :group="panel"
      :panel-ratio="panel.panelRatio"
      @drag-start="handlePanelDrag"
      @merge="handlePanelMerge"
    />
    
    <!-- 分组调整手柄 -->
    <ResizeHandle 
      v-if="showResizeHandle"
      @resize="handleGroupResize"
    />
  </div>
</template>
```

### 3. 改造第三级组件：DockablePanelGroup

**保留功能**：
- 标签页管理
- 拖拽移动
- 标签拖拽
- 面板合并
- 调整大小

**新增属性**：
```typescript
interface Props {
  group: PanelGroup;
  panelRatio?: number;  // 新增：在分组中的占比
  containerDirection?: 'horizontal' | 'vertical';  // 新增：所在容器方向
}
```

## 🎨 布局计算逻辑

### 第一级：容器布局

```typescript
// 纵向布局（left/right）
containerStyle = {
  width: `${width}px`,
  height: '100%',
  flexDirection: 'column',  // 分组纵向排列
  position: 'absolute',
  [position]: 0
}

// 横向布局（top/bottom）
containerStyle = {
  width: '100%',
  height: `${height}px`,
  flexDirection: 'row',  // 分组横向排列
  position: 'absolute',
  [position]: 0
}

// 悬浮布局
containerStyle = {
  width: `${width}px`,
  height: `${height}px`,
  position: 'fixed',
  left: `${x}px`,
  top: `${y}px`
}
```

### 第二级：分组布局

```typescript
// 在纵向容器中（left/right）
groupStyle = {
  flex: `0 0 ${groupRatio * 100}%`,  // 高度占比
  width: '100%',
  flexDirection: direction === 'horizontal' ? 'row' : 'column'
}

// 在横向容器中（top/bottom）
groupStyle = {
  flex: `0 0 ${groupRatio * 100}%`,  // 宽度占比
  height: '100%',
  flexDirection: direction === 'horizontal' ? 'row' : 'column'
}
```

### 第三级：面板布局

```typescript
// 面板占比
panelStyle = {
  flex: `0 0 ${panelRatio * 100}%`,
  overflow: 'hidden'
}
```

## 🔄 拖拽吸附流程

### 1. 面板拖拽

```
用户拖动面板 (mousedown on DockablePanelGroup)
  ↓
检测拖动距离 > 阈值
  ↓
从当前分组分离
  ↓
转为悬浮状态
  ↓
跟随鼠标移动
  ↓
检测热区
  ├─ 边缘热区 → 创建新容器
  ├─ 容器热区 → 创建新分组
  └─ 面板热区 → 合并到现有面板
  ↓
释放鼠标 → 完成停靠/合并
```

### 2. 分组调整

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

### 3. 面板调整

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

## 🎯 核心优势

### 1. 清晰的层级结构

```
容器层：定义整体布局
  ↓
分组层：组织面板集合
  ↓
面板层：具体功能实现
```

### 2. 灵活的布局方式

- **纵向容器** + **横向分组** = 复杂布局
- **横向容器** + **纵向分组** = 复杂布局
- 每一层都可以独立调整占比

### 3. 保留原有功能

- DockablePanelGroup 保持原有所有功能
- 只是增加了在分组中的占比属性
- 完全向后兼容

## 📝 实现步骤

1. ✅ 分析现有结构
2. ⏳ 创建新的类型定义
3. ⏳ 实现 DockLayoutContainer（第一级）
4. ⏳ 实现 PanelGroupContainer（第二级）
5. ⏳ 改造 DockablePanelGroup（第三级）
6. ⏳ 实现调整手柄逻辑
7. ⏳ 实现拖拽吸附逻辑
8. ⏳ 实现热区检测
9. ⏳ 测试和优化

---

**设计版本**: 1.0  
**创建时间**: 2026-01-20  
**状态**: 设计完成，准备实现
