# 停泊吸附系统 V2 - 挤压布局架构

## 🎯 V2 版本更新

### 核心改进

1. **✅ 挤压布局**：停靠面板不再浮在内容区上方，而是挤压内容区域
2. **✅ 面板不重叠**：停靠面板合理排列，不会相互覆盖
3. **✅ 智能吸附**：面板可以吸附到同一侧的其他面板旁边
4. **✅ 简化界面**：主页面样式简洁明了
5. **✅ 灵活调整**：停靠面板可调整尺寸

## 🏗️ 新的布局架构

### Flex 布局结构

```
┌─────────────────────────────────────────────────────┐
│ DockContainer (relative)                            │
│ ┌─────────────────────────────────────────────────┐ │
│ │ DockLayout (flex column)                         │ │
│ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │ Top Area (flex row)                         │ │ │
│ │ │ [Panel] [Panel] [Panel]                     │ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │ Middle Area (flex row)                      │ │ │
│ │ │ ┌────┐ ┌──────────────┐ ┌────┐             │ │ │
│ │ │ │Left│ │   Content    │ │Righ│             │ │ │
│ │ │ │Area│ │     Area     │ │t   │             │ │ │
│ │ │ │[P] │ │   (主内容)    │ │Area│             │ │ │
│ │ │ │[P] │ │              │ │[P] │             │ │ │
│ │ │ └────┘ └──────────────┘ └────┘             │ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │ Bottom Area (flex row)                      │ │ │
│ │ │ [Panel] [Panel]                             │ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────┘ │
│                                                       │
│ <!-- 浮动面板 (position: fixed) -->                  │
│ ┌──────────┐                                         │
│ │ Floating │                                         │
│ │  Panel   │                                         │
│ └──────────┘                                         │
└─────────────────────────────────────────────────────┘
```

### 关键特性

#### 1. 停靠面板（Docked Panels）

- **定位方式**：使用相对定位 + Flex 布局
- **空间占用**：占据实际空间，挤压主内容区
- **排列方式**：
  - 左右停靠：纵向排列（flex-direction: column）
  - 上下停靠：横向排列（flex-direction: row）
- **尺寸调整**：
  - 左侧面板：右边缘可调整
  - 右侧面板：左边缘可调整
  - 顶部面板：底边缘可调整
  - 底部面板：顶边缘可调整

#### 2. 浮动面板（Floating Panels）

- **定位方式**：fixed 定位
- **空间占用**：不占据空间，浮在最上层
- **尺寸调整**：右、下、右下角可调整

#### 3. 主内容区（Content Area）

- **Flex 属性**：`flex: 1`（自动填充剩余空间）
- **响应式**：根据停靠面板自动调整大小
- **滚动**：`overflow: auto`（内容过多时滚动）

## 🔄 吸附规则

### 容器边缘吸附

```typescript
// 拖拽到容器边缘（默认50px热区）
容器左边缘 → 停靠到 left 区域
容器右边缘 → 停靠到 right 区域
容器顶边缘 → 停靠到 top 区域
容器底边缘 → 停靠到 bottom 区域
```

### 面板间吸附

```typescript
// 拖拽到已停靠面板附近（默认30px阈值）

左侧/右侧停靠面板：
  - 拖拽到其上方 → 吸附到同一侧（上方）
  - 拖拽到其下方 → 吸附到同一侧（下方）

顶部/底部停靠面板：
  - 拖拽到其左侧 → 吸附到同一侧（左侧）
  - 拖拽到其右侧 → 吸附到同一侧（右侧）
```

**示例**：
- 已有面板停靠在左侧
- 拖拽新面板到该面板下方
- 释放鼠标 → 新面板也停靠在左侧，排列在下方

## 🎨 样式设计

### 停靠区域样式

```css
.dock-area {
  display: flex;
  background-color: #2d2d2d;
  border: 1px solid #3e3e3e;
}

/* 左右停靠区：纵向排列 */
.dock-left, .dock-right {
  flex-direction: column;
  min-width: 200px;
  max-width: 400px;
}

/* 上下停靠区：横向排列 */
.dock-top, .dock-bottom {
  flex-direction: row;
  min-height: 150px;
  max-height: 400px;
}
```

### 面板样式差异

```css
/* 停靠面板 */
.panel-docked {
  border-radius: 0;
  box-shadow: none;
  /* 尺寸由 flex 控制 */
}

/* 浮动面板 */
.panel-floating {
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  position: fixed; /* 关键 */
}
```

## 📝 使用示例

### 基础使用

```vue
<template>
  <DockContainer :config="config">
    <!-- 主内容区会自动适应停靠面板 -->
    <div class="my-content">
      <h1>主内容区域</h1>
      <p>停靠面板会挤压这个区域</p>
    </div>
  </DockContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { DockContainer } from '@/components/docking';

const config = {
  snapThreshold: 30,
  hotZoneSize: 50,
  minPanelWidth: 200,
  minPanelHeight: 150,
};
</script>
```

### 添加面板

```typescript
// 添加到左侧（默认停靠）
manager.addPanel({
  id: 'panel-1',
  title: '工具面板',
  width: 250,
  height: 400,
  defaultPosition: 'left', // 自动停靠到左侧
});

// 添加浮动面板
manager.addPanel({
  id: 'panel-2',
  title: '属性面板',
  width: 300,
  height: 350,
  defaultPosition: 'float', // 浮动状态
});
```

## 🔧 配置选项

```typescript
interface DockManagerConfig {
  snapThreshold?: number;    // 吸附阈值（像素），默认 30
  hotZoneSize?: number;      // 热区大小（像素），默认 50
  minPanelWidth?: number;    // 最小宽度，默认 200
  minPanelHeight?: number;   // 最小高度，默认 100
  maxPanels?: number;        // 最大面板数
}
```

## 🎯 核心算法

### 1. 面板位置计算

```typescript
function updateDockedPanelSize(panel: PanelInstance) {
  switch (panel.position) {
    case 'left':
    case 'right':
      // 限制宽度，高度由 flex 自动填充
      panel.width = Math.max(
        Math.min(panel.width, containerWidth * 0.4),
        minPanelWidth
      );
      break;
    
    case 'top':
    case 'bottom':
      // 限制高度，宽度由 flex 自动填充
      panel.height = Math.max(
        Math.min(panel.height, containerHeight * 0.4),
        minPanelHeight
      );
      break;
  }
}
```

### 2. 面板分组渲染

```typescript
// 按停靠位置分组
const topPanels = computed(() => 
  panels.filter(p => p.state === 'docked' && p.position === 'top')
);

const bottomPanels = computed(() => 
  panels.filter(p => p.state === 'docked' && p.position === 'bottom')
);

const leftPanels = computed(() => 
  panels.filter(p => p.state === 'docked' && p.position === 'left')
);

const rightPanels = computed(() => 
  panels.filter(p => p.state === 'docked' && p.position === 'right')
);

const floatingPanels = computed(() => 
  panels.filter(p => p.state === 'floating' || p.state === 'dragging')
);
```

### 3. 吸附检测优先级

```
1. 检测容器边缘（优先级最高）
   ↓
2. 检测已停靠面板（面板间吸附）
   ↓
3. 无吸附，保持浮动状态
```

## 🚀 与 V1 版本的对比

| 特性 | V1 版本 | V2 版本 |
|------|---------|---------|
| 停靠面板定位 | fixed | relative + flex |
| 主内容区 | 被覆盖 | 自动挤压 |
| 面板排列 | 可能重叠 | 合理排列 |
| 空间利用 | 差 | 优秀 |
| 用户体验 | 一般 | 类似 PS |
| 性能 | 一般 | 更好 |

## 🎓 最佳实践

### 1. 面板尺寸设置

```typescript
// 推荐设置
{
  width: 250,        // 左右停靠推荐宽度
  height: 200,       // 上下停靠推荐高度
  minWidth: 200,     // 最小宽度
  minHeight: 150,    // 最小高度
}
```

### 2. 默认布局

```typescript
// 创建默认布局
function createDefaultLayout() {
  // 左侧工具栏
  manager.addPanel({
    id: 'tools',
    title: '工具',
    defaultPosition: 'left',
    width: 250,
  });
  
  // 右侧属性面板
  manager.addPanel({
    id: 'properties',
    title: '属性',
    defaultPosition: 'right',
    width: 300,
  });
  
  // 底部历史记录
  manager.addPanel({
    id: 'history',
    title: '历史',
    defaultPosition: 'bottom',
    height: 200,
  });
}
```

### 3. 响应式调整

```typescript
// 监听窗口大小变化
window.addEventListener('resize', () => {
  manager.updateContainerRect();
});
```

## 🐛 已知限制

1. ~~停靠面板暂不支持拖拽排序~~（已实现吸附到同侧）
2. 暂不支持标签页合并功能
3. 暂不支持保存布局到本地存储

## 📚 后续优化方向

1. ✅ 基础挤压布局
2. ✅ 面板间吸附
3. ✅ 调整大小功能
4. 🔄 面板拖拽排序（同侧内部调整顺序）
5. 🔄 面板标签页合并
6. 🔄 布局持久化
7. 🔄 预设布局模板
8. 🔄 键盘快捷键

---

**版本**: 2.0.0  
**更新日期**: 2026-01-13  
**作者**: 前端架构大师
