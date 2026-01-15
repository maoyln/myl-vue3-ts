# 面板组 Tabs 功能使用说明

## 🎯 功能概述

面板组（Panel Group）功能实现了类似 VS Code 和 Photoshop 的多标签页管理系统，支持：
- ✅ 多标签页面板（类似浏览器标签页）
- ✅ 标签页拖拽拆分
- ✅ 标签页拖拽合并
- ✅ 标签页切换和关闭
- ✅ 整个面板组的拖拽和停泊

## 📦 核心组件

### 1. DockablePanelGroup.vue

支持多标签页的面板组组件。

**Props:**
```typescript
interface Props {
  group: PanelGroup; // 面板组数据
}
```

**插槽:**
```vue
<DockablePanelGroup :group="group">
  <template #default="{ group, activeTab }">
    <!-- 自定义标签页内容 -->
  </template>
</DockablePanelGroup>
```

### 2. 新增类型定义

#### TabItem（标签页）
```typescript
interface TabItem {
  id: string;         // 标签页 ID
  title: string;      // 标签页标题
  icon?: string;      // 标签页图标
  closable?: boolean; // 是否可关闭
  content?: any;      // 标签页内容数据
}
```

#### PanelGroup（面板组）
```typescript
interface PanelGroup {
  id: string;                // 组 ID
  tabs: TabItem[];           // 标签页列表
  activeTabId: string;       // 当前激活的标签页
  width: number;
  height: number;
  x: number;
  y: number;
  zIndex: number;
  state: PanelState;        // 'docked' | 'floating' | 'dragging'
  position: DockPosition;   // 'left' | 'right' | 'top' | 'bottom' | 'float'
  resizable?: boolean;
  // ...
}
```

## 🚀 使用方法

### 基础用法

```vue
<template>
  <DockContainer ref="containerRef">
    <div>主内容区</div>
    
    <!-- 自定义面板组内容 -->
    <template #panel-group-content="{ group, activeTab }">
      <div>
        <h3>{{ activeTab?.title }}</h3>
        <p>当前标签: {{ activeTab?.id }}</p>
      </div>
    </template>
  </DockContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { DockContainer } from '@/components/docking';

const containerRef = ref();

// 添加面板组
function addPanel() {
  const manager = containerRef.value?.manager;
  manager.addPanelGroup?.({
    id: 'panel-1',
    title: '工具箱',
    icon: '🔧',
    width: 280,
    height: 400,
    defaultPosition: 'left',
    closable: true,
    resizable: true,
  });
}
</script>
```

### 管理器 API

#### 添加面板组
```typescript
manager.addPanelGroup(config: PanelConfig): PanelGroup
```

#### 移除面板组
```typescript
manager.removePanelGroup(groupId: string): void
```

#### 获取面板组
```typescript
manager.getPanelGroup(groupId: string): PanelGroup | undefined
```

#### 激活面板组
```typescript
manager.activatePanelGroup(groupId: string): void
```

#### 标签页操作

**切换激活标签:**
```typescript
manager.setActiveTab(groupId: string, tabId: string): void
```

**关闭标签页:**
```typescript
manager.closeTab(groupId: string, tabId: string): void
```

**合并标签到其他面板组:**
```typescript
manager.mergeTabToGroup(
  sourceGroupId: string,
  tabId: string,
  targetGroupId: string
): void
```

**拆分标签成新面板组:**
```typescript
manager.splitTabToNewGroup(
  sourceGroupId: string,
  tabId: string,
  x: number,
  y: number
): void
```

#### 拖拽相关

**开始拖拽面板组:**
```typescript
manager.startDragGroup(groupId: string, clientX: number, clientY: number): void
```

**开始拖拽标签页:**
```typescript
manager.startDragTab(
  groupId: string,
  tabId: string,
  clientX: number,
  clientY: number
): void
```

**拖拽标签页中:**
```typescript
manager.onDragTab(clientX: number, clientY: number): void
```

**结束拖拽标签页:**
```typescript
manager.endDragTab(): void
```

#### 其他操作

**分离面板组:**
```typescript
manager.detachPanelGroup(groupId: string): void
```

**调整面板组大小:**
```typescript
manager.resizePanelGroup(groupId: string, width: number, height: number): void
```

## 💡 交互说明

### 1. 标签页切换
- 点击标签页即可切换到该标签
- 当前激活的标签会高亮显示
- 底部有蓝色指示线

### 2. 拖拽标签页

#### 拆分操作
1. 按住标签页并拖动
2. 拖出面板组区域
3. 释放鼠标
4. 标签页会自动拆分成新的独立面板组

#### 合并操作
1. 按住标签页并拖动
2. 拖动到另一个面板组的标签栏区域
3. 当目标面板组高亮时释放鼠标
4. 标签页会自动合并到目标面板组

### 3. 拖拽面板组
- 点击标签栏的空白区域并拖动
- 可以拖动整个面板组（包含所有标签页）
- 支持停泊到容器边缘

### 4. 关闭标签页
- 点击标签页上的 ✕ 按钮关闭
- 至少保留一个标签页
- 如果只剩一个标签页，✕ 按钮会隐藏
- 关闭所有标签页后，面板组自动移除

### 5. 调整大小
- 浮动状态：拖动右、下、右下角调整
- 停靠状态：拖动对应边缘调整

## 📖 完整示例

参考 `src/views/DockingGroupDemo.vue` 查看完整的使用示例。

### 创建多标签面板组

```typescript
// 方式1: 直接创建包含多个标签的面板组
const group = manager.addPanelGroup({
  id: 'group-1',
  title: '工具箱',
  icon: '🔧',
  width: 300,
  height: 400,
});

// 手动添加更多标签
group.tabs.push({
  id: 'tab-2',
  title: '颜色',
  icon: '🎨',
  closable: true,
});

group.tabs.push({
  id: 'tab-3',
  title: '图层',
  icon: '📚',
  closable: true,
});

// 方式2: 创建多个单标签面板，然后通过拖拽合并
manager.addPanelGroup({
  id: 'tools',
  title: '工具箱',
  icon: '🔧',
});

manager.addPanelGroup({
  id: 'colors',
  title: '颜色',
  icon: '🎨',
});

// 用户可以通过拖拽将它们合并
```

### 响应标签切换事件

```vue
<template>
  <DockContainer>
    <template #panel-group-content="{ group, activeTab }">
      <div v-if="activeTab?.id === 'tools'">
        <!-- 工具箱内容 -->
      </div>
      <div v-else-if="activeTab?.id === 'colors'">
        <!-- 颜色面板内容 -->
      </div>
      <div v-else-if="activeTab?.id === 'layers'">
        <!-- 图层面板内容 -->
      </div>
    </template>
  </DockContainer>
</template>
```

### 程序化操作

```typescript
// 切换到指定标签
manager.setActiveTab('group-1', 'tab-2');

// 关闭标签
manager.closeTab('group-1', 'tab-3');

// 合并标签
manager.mergeTabToGroup('group-1', 'tab-1', 'group-2');

// 拆分标签
manager.splitTabToNewGroup('group-1', 'tab-2', 400, 300);
```

## 🎨 样式定制

### 标签栏样式

```css
/* 标签栏背景 */
.panel-tabs-header {
  background-color: #3e3e3e;
  border-bottom: 1px solid #555;
}

/* 标签页 */
.panel-tab {
  background-color: rgba(255, 255, 255, 0.03);
  color: #aaa;
}

/* 激活的标签页 */
.panel-tab.is-active {
  background-color: #2d2d2d;
  color: #fff;
  border-bottom: 2px solid #4A90E2;
}

/* 标签页悬停 */
.panel-tab:hover {
  background-color: rgba(255, 255, 255, 0.05);
}
```

### 自定义标签图标

```vue
<template>
  <DockablePanelGroup :group="group">
    <!-- 可以通过 CSS 自定义图标样式 -->
  </DockablePanelGroup>
</template>

<style>
.tab-icon {
  font-size: 14px;
  /* 自定义图标样式 */
}
</style>
```

## 🔧 高级配置

### 自定义拖拽行为

```typescript
// 禁止标签页拆分（只允许在面板组内切换）
// 可以通过修改 startDragTab 逻辑实现
```

### 自定义合并规则

```typescript
// 可以在 mergeTabToGroup 中添加自定义逻辑
// 例如：只允许相同类型的标签合并
```

### 保存和恢复布局

```typescript
// 保存布局
const layout = {
  groups: manager.panelGroupList.value.map(g => ({
    id: g.id,
    tabs: g.tabs,
    activeTabId: g.activeTabId,
    position: g.position,
    // ...
  }))
};
localStorage.setItem('panel-layout', JSON.stringify(layout));

// 恢复布局
const saved = JSON.parse(localStorage.getItem('panel-layout') || '{}');
saved.groups?.forEach((data: any) => {
  const group = manager.addPanelGroup(data.tabs[0]);
  // 添加其他标签
  data.tabs.slice(1).forEach((tab: TabItem) => {
    group.tabs.push(tab);
  });
  group.activeTabId = data.activeTabId;
});
```

## 🐛 常见问题

### 标签页无法拖拽
- 确保正确注册了 DockContainer
- 检查是否正确监听了鼠标事件
- 确认 manager 的拖拽方法已正确调用

### 合并不生效
- 检查 hoveredGroup 状态是否正确
- 确保标签栏区域的碰撞检测逻辑正确
- 查看控制台是否有错误信息

### 标签页显示异常
- 检查 tabs 数组是否正确
- 确认 activeTabId 是否有效
- 检查 CSS 样式是否正确加载

## 📚 参考文档

- [基础停泊功能](./03、停泊吸附系统使用说明.md)
- [需求列表](./01、Photoshop风格组件拖拽、停泊吸附功能需求列表.md)
- [技术实现](./02、Vue3%20实现%20PS%20风格拖拽停泊吸附功能%20-%20工具类与组件拆解分析.md)

## 🎉 演示页面

访问 `/docking-group-demo` 查看完整的功能演示。

功能包括：
- 快速添加不同类型的面板
- 标签页拖拽拆分和合并
- 预设布局加载
- 实时状态显示
- 详细的操作说明

---

**版本**: v1.0.0  
**更新日期**: 2026-01-14
