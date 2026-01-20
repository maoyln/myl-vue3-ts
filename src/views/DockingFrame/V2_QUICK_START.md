# 三级面板结构 V2 - 快速入门 🚀

## 📋 5分钟快速上手

### 1. 导入组件

```typescript
import { DockManagerV2 } from '@/views/DockingFrame/docking/indexV2';
import type { DockLayoutConfig } from '@/views/DockingFrame/docking/typesV2';
```

### 2. 创建配置

```typescript
const layoutConfig: DockLayoutConfig = {
  config: {
    hotZoneSize: 80,
    minPanelWidth: 200,
    minPanelHeight: 150,
    minGroupRatio: 0.1,
    minPanelRatio: 0.1,
    snapThreshold: 20
  },
  containers: []  // 先创建空配置
};
```

### 3. 添加第一个容器

```typescript
// 左侧停靠容器
layoutConfig.containers.push({
  id: 'left',
  position: 'left',
  width: 300,
  height: 600,
  resizable: true,
  minWidth: 200,
  minHeight: 150,
  groups: []  // 先创建空分组
});
```

### 4. 添加分组

```typescript
const leftContainer = layoutConfig.containers[0];

// 添加第一个分组
leftContainer.groups.push({
  id: 'group_1',
  groupRatio: 0.6,  // 占容器 60% 高度
  direction: 'vertical',  // 面板纵向排列
  resizable: true,
  minRatio: 0.1,
  panels: []  // 先创建空面板列表
});

// 添加第二个分组
leftContainer.groups.push({
  id: 'group_2',
  groupRatio: 0.4,  // 占容器 40% 高度
  direction: 'vertical',
  resizable: true,
  minRatio: 0.1,
  panels: []
});
```

### 5. 添加面板

```typescript
const group1 = leftContainer.groups[0];

// 添加资源管理器面板
group1.panels.push({
  id: 'panel_explorer',
  tabs: [
    { id: 'tab_1', title: '资源管理器', icon: '📁', closable: false }
  ],
  activeTabId: 'tab_1',
  width: 300,
  height: 180,
  originalWidth: 300,
  originalHeight: 180,
  x: 0,
  y: 0,
  zIndex: 1000,
  state: 'docked',
  position: 'left',
  resizable: true,
  panelRatio: 0.5  // 在分组中占 50%
});

// 添加搜索面板
group1.panels.push({
  id: 'panel_search',
  tabs: [
    { id: 'tab_2', title: '搜索', icon: '🔍', closable: true }
  ],
  activeTabId: 'tab_2',
  width: 300,
  height: 180,
  originalWidth: 300,
  originalHeight: 180,
  x: 0,
  y: 0,
  zIndex: 1000,
  state: 'docked',
  position: 'left',
  resizable: true,
  panelRatio: 0.5  // 在分组中占 50%
});
```

### 6. 使用组件

```vue
<template>
  <DockManagerV2
    :config="layoutConfig"
    @config-change="handleConfigChange"
  />
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { DockManagerV2 } from '@/views/DockingFrame/docking/indexV2';
import type { DockLayoutConfig } from '@/views/DockingFrame/docking/typesV2';

const layoutConfig = reactive<DockLayoutConfig>({
  // 上面创建的配置
});

function handleConfigChange(newConfig: DockLayoutConfig) {
  console.log('配置已更新', newConfig);
}
</script>
```

## 🎯 常见布局模板

### 模板 1：简单IDE布局

```typescript
{
  containers: [
    {
      id: 'left',
      position: 'left',
      width: 250,
      groups: [{
        groupRatio: 1,
        direction: 'vertical',
        panels: [/* 左侧面板 */]
      }]
    },
    {
      id: 'bottom',
      position: 'bottom',
      height: 200,
      groups: [{
        groupRatio: 1,
        direction: 'horizontal',
        panels: [/* 底部面板 */]
      }]
    }
  ]
}
```

### 模板 2：双分栏布局

```typescript
{
  containers: [
    {
      id: 'left',
      position: 'left',
      width: 300,
      groups: [
        {
          groupRatio: 0.6,
          direction: 'vertical',
          panels: [/* 上半部分 */]
        },
        {
          groupRatio: 0.4,
          direction: 'vertical',
          panels: [/* 下半部分 */]
        }
      ]
    }
  ]
}
```

### 模板 3：PhotoShop风格

```typescript
{
  containers: [
    {
      id: 'left',
      position: 'left',
      width: 200,
      groups: [
        {
          groupRatio: 0.7,
          direction: 'vertical',
          panels: [/* 工具面板 */]
        },
        {
          groupRatio: 0.3,
          direction: 'vertical',
          panels: [/* 历史面板 */]
        }
      ]
    },
    {
      id: 'right',
      position: 'right',
      width: 250,
      groups: [
        {
          groupRatio: 0.5,
          direction: 'vertical',
          panels: [/* 图层面板 */]
        },
        {
          groupRatio: 0.5,
          direction: 'horizontal',
          panels: [/* 属性、颜色面板 */]
        }
      ]
    }
  ]
}
```

## 🎨 常用操作示例

### 添加悬浮容器

```typescript
function addFloatPanel() {
  layoutConfig.containers.push({
    id: `float_${Date.now()}`,
    position: 'float',
    width: 400,
    height: 300,
    x: 500,
    y: 200,
    zIndex: 1001,
    resizable: true,
    minWidth: 200,
    minHeight: 150,
    groups: [{
      id: `group_${Date.now()}`,
      groupRatio: 1,
      direction: 'vertical',
      resizable: true,
      minRatio: 0.1,
      panels: [{
        id: `panel_${Date.now()}`,
        tabs: [{ id: `tab_${Date.now()}`, title: '新面板', icon: '📄' }],
        activeTabId: `tab_${Date.now()}`,
        width: 400,
        height: 300,
        originalWidth: 400,
        originalHeight: 300,
        x: 0,
        y: 0,
        zIndex: 1000,
        state: 'floating',
        position: 'float',
        resizable: true,
        panelRatio: 1
      }]
    }]
  });
}
```

### 移除容器

```typescript
function removeContainer(containerId: string) {
  const index = layoutConfig.containers.findIndex(c => c.id === containerId);
  if (index !== -1) {
    layoutConfig.containers.splice(index, 1);
  }
}
```

### 查找面板

```typescript
function findPanel(panelId: string) {
  for (const container of layoutConfig.containers) {
    for (const group of container.groups) {
      const panel = group.panels.find(p => p.id === panelId);
      if (panel) {
        return { container, group, panel };
      }
    }
  }
  return null;
}
```

## 🔧 调试技巧

### 1. 查看当前布局

```typescript
function debugLayout() {
  console.log('容器数量:', layoutConfig.containers.length);
  
  layoutConfig.containers.forEach((container, i) => {
    console.log(`容器 ${i}:`, {
      id: container.id,
      position: container.position,
      groups: container.groups.length
    });
    
    container.groups.forEach((group, j) => {
      console.log(`  分组 ${j}:`, {
        id: group.id,
        ratio: group.groupRatio,
        panels: group.panels.length
      });
    });
  });
}
```

### 2. 验证占比

```typescript
function validateRatios() {
  layoutConfig.containers.forEach(container => {
    // 验证分组占比
    const groupTotal = container.groups.reduce((sum, g) => sum + g.groupRatio, 0);
    if (Math.abs(groupTotal - 1) > 0.01) {
      console.warn(`容器 ${container.id} 分组占比不正确: ${groupTotal}`);
    }
    
    // 验证面板占比
    container.groups.forEach(group => {
      const panelTotal = group.panels.reduce((sum, p) => sum + (p.panelRatio || 0), 0);
      if (Math.abs(panelTotal - 1) > 0.01) {
        console.warn(`分组 ${group.id} 面板占比不正确: ${panelTotal}`);
      }
    });
  });
}
```

### 3. 性能监控

```typescript
function monitorPerformance() {
  const start = performance.now();
  
  // 执行操作
  // ...
  
  const end = performance.now();
  console.log(`操作耗时: ${end - start}ms`);
}
```

## ⚠️ 常见错误

### 错误 1：占比总和不为 1

**原因**：手动设置占比时没有归一化

**解决**：
```typescript
function normalizeGroupRatios(groups: PanelGroupContainer[]) {
  const total = groups.reduce((sum, g) => sum + g.groupRatio, 0);
  if (total > 0) {
    groups.forEach(g => g.groupRatio /= total);
  }
}
```

### 错误 2：面板没有显示

**检查清单**：
- ✓ container 是否添加到 containers 数组
- ✓ group 是否添加到 groups 数组
- ✓ panel 是否添加到 panels 数组
- ✓ panelRatio 是否 > 0
- ✓ tabs 数组是否非空

### 错误 3：拖拽不响应

**检查清单**：
- ✓ DockManagerV2 是否正确挂载
- ✓ 事件监听是否正确绑定
- ✓ z-index 是否足够高

## 📚 下一步

- 查看 [完整使用指南](./V2_USAGE_GUIDE.md)
- 查看 [架构分析](./ARCHITECTURE_ANALYSIS.md)
- 查看 [演示页面](./Berthing02V2.vue)

## 🎉 完成！

现在你已经掌握了三级面板结构的基本用法，可以开始创建自己的布局了！

---

**预计学习时间**: 5-10分钟  
**难度**: ⭐⭐  
**适合人群**: 所有开发者
