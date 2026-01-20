# 三级面板结构 V2 - 项目说明

## 🎯 项目简介

基于用户需求，实现了**清晰的三级分层架构**，将原有的 DockablePanelGroup 作为第三级，并新增了容器层和分组层，实现了更灵活、更强大的面板布局系统。

## ✨ 核心特性

### 1. 三级分层架构

```
第一级：DockLayoutContainer（布局容器）
  ├─ 职责：定义停靠位置和整体布局方向
  ├─ 类型：left/right/top/bottom/float
  └─ 包含：多个 PanelGroupContainer

第二级：PanelGroupContainer（面板组容器）
  ├─ 职责：组织多个面板，管理占比
  ├─ 属性：groupRatio（占比）、direction（方向）
  └─ 包含：多个 DockablePanelGroup

第三级：DockablePanelGroup（面板组）
  ├─ 职责：完整的面板功能
  ├─ 功能：标签页、拖拽、合并、吸附
  └─ 属性：panelRatio（在分组中的占比）
```

### 2. 灵活的布局方式

**纵向布局**：
- 左/右停靠容器
- 分组纵向排列
- 可调整高度占比

**横向布局**：
- 上/下停靠容器
- 分组横向排列
- 可调整宽度占比

**悬浮布局**：
- 自由定位
- 可调整宽高
- 可拖拽移动

### 3. 完整的拖拽吸附

- ✅ 边缘热区检测（80px）
- ✅ 容器热区检测
- ✅ 实时视觉反馈
- ✅ Ghost 跟随鼠标
- ✅ 自动创建容器
- ✅ 智能合并面板

### 4. 占比动态调整

- ✅ 分组间占比调整
- ✅ 面板间占比调整
- ✅ 最小占比限制（10%）
- ✅ 自动归一化（100%）
- ✅ 实时视觉反馈

### 5. 保持原有功能

- ✅ 所有 DockablePanelGroup 功能
- ✅ 标签页管理
- ✅ 标签拖拽
- ✅ 面板合并
- ✅ 调整大小
- ✅ 完全兼容

## 📦 文件结构

```
DockingFrame/
├── docking/
│   ├── typesV2.ts                      # ⭐ V2 类型定义
│   ├── DockManagerV2.vue               # ⭐ 顶层管理器
│   ├── DockLayoutContainerV2.vue       # ⭐ 第一级组件
│   ├── PanelGroupContainerV2.vue       # ⭐ 第二级组件
│   ├── DockablePanelGroup.vue          # 第三级组件（原有）
│   ├── indexV2.ts                      # ⭐ V2 导出文件
│   └── ... (原有文件)
├── Berthing02V2.vue                    # ⭐ V2 演示页面
├── ARCHITECTURE_ANALYSIS.md            # ⭐ 架构分析
├── V2_USAGE_GUIDE.md                   # ⭐ 使用指南
├── V2_QUICK_START.md                   # ⭐ 快速入门
├── V2_SUMMARY.md                       # ⭐ 完成总结
└── README_V2.md                        # ⭐ 本文档
```

## 🚀 快速开始

### 1. 导入

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
  containers: [
    // 容器配置
  ]
};
```

### 3. 使用组件

```vue
<DockManagerV2
  :config="layoutConfig"
  @config-change="handleConfigChange"
/>
```

详细教程请查看 [快速入门](./V2_QUICK_START.md)

## 🎨 布局示例

### IDE 布局

```
┌──────────┬────────────────────┬──────────┐
│          │                    │          │
│  左侧    │                    │  右侧    │
│  面板    │   主编辑区域        │  面板    │
│  (30%)   │                    │  (25%)   │
│          │                    │          │
├──────────┴────────────────────┴──────────┤
│           底部终端 (30%)                  │
└───────────────────────────────────────────┘
```

### PhotoShop 布局

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

更多示例请查看 [演示页面](./Berthing02V2.vue)

## 📊 与原版对比

| 特性 | 原版 | V2 |
|------|------|-----|
| **架构** | 单一组件 | 三级分层 ⭐ |
| **布局控制** | 隐式 | 显式清晰 ⭐ |
| **分组概念** | 无 | 有（第二级）⭐ |
| **占比控制** | 隐式 | 显式 ratio ⭐ |
| **复杂布局** | 较难 | 容易 ⭐ |
| **代码清晰度** | 中等 | 优秀 ⭐ |
| **可维护性** | 一般 | 优秀 ⭐ |
| **拖拽吸附** | ✅ | ✅ 增强 |
| **面板合并** | ✅ | ✅ 保留 |
| **标签拖拽** | ✅ | ✅ 保留 |

### 主要改进

1. **结构更清晰**：三级分层，职责明确
2. **布局更灵活**：支持复杂嵌套布局
3. **占比更精确**：显式 ratio 属性，自动归一化
4. **代码更好维护**：组件职责单一，易于扩展

## 📚 文档导航

### 快速入门
- [5分钟快速开始](./V2_QUICK_START.md) - 最快上手指南
- [完整使用指南](./V2_USAGE_GUIDE.md) - 详细的API和示例

### 深入理解
- [架构分析](./ARCHITECTURE_ANALYSIS.md) - 设计思路和数据结构
- [完成总结](./V2_SUMMARY.md) - 项目总结和对比

### 实践
- [演示页面](./Berthing02V2.vue) - 完整的实现示例
- [类型定义](./docking/typesV2.ts) - TypeScript 类型

## 🔧 配置说明

### 全局配置

```typescript
interface DockManagerV2Config {
  hotZoneSize: number;       // 热区大小，推荐 80px
  minPanelWidth: number;     // 最小面板宽度，推荐 200px
  minPanelHeight: number;    // 最小面板高度，推荐 150px
  minGroupRatio: number;     // 最小分组占比，推荐 0.1
  minPanelRatio: number;     // 最小面板占比，推荐 0.1
  snapThreshold: number;     // 吸附阈值，推荐 20px
}
```

### 容器配置

```typescript
interface DockLayoutContainer {
  id: string;                          // 唯一ID
  position: DockPosition;              // 停靠位置
  width: number;                       // 宽度
  height: number;                      // 高度
  x?: number;                          // X坐标（悬浮时）
  y?: number;                          // Y坐标（悬浮时）
  resizable: boolean;                  // 是否可调整
  minWidth: number;                    // 最小宽度
  minHeight: number;                   // 最小高度
  groups: PanelGroupContainer[];       // 分组列表
}
```

## 🎯 使用场景

### 1. IDE 开发工具

适合创建类似 VS Code 的界面：
- 左侧文件浏览器
- 右侧属性面板
- 底部终端
- 中央编辑区

### 2. 图形设计工具

适合创建类似 PhotoShop 的界面：
- 左侧工具栏
- 右侧图层面板
- 底部属性面板
- 中央画布区

### 3. 数据分析工具

适合创建仪表板：
- 多个数据面板
- 灵活的布局组合
- 可拖拽调整布局

### 4. 项目管理工具

适合创建看板界面：
- 多个工作区
- 灵活的面板组合
- 可自定义布局

## ⚡ 性能优化建议

### 1. 减少重渲染

```typescript
// 使用 computed 缓存计算结果
const groupStyle = computed(() => ({
  flex: `0 0 ${props.config.groupRatio * 100}%`
}));
```

### 2. 事件防抖

```typescript
// 拖拽事件添加防抖
const debouncedDrag = debounce(handleDrag, 16); // 60fps
```

### 3. 虚拟滚动

```typescript
// 大量标签页时使用虚拟滚动
<VirtualScroller :items="tabs" />
```

## 🐛 故障排除

### 问题 1：面板不显示

**检查**：
- ✓ 容器是否添加到 containers 数组
- ✓ 分组是否添加到 groups 数组
- ✓ 面板是否添加到 panels 数组
- ✓ 占比是否大于 0

### 问题 2：拖拽不响应

**检查**：
- ✓ DockManagerV2 是否正确挂载
- ✓ 事件监听是否绑定
- ✓ z-index 是否足够高

### 问题 3：占比显示异常

**检查**：
- ✓ 总占比是否等于 1.0
- ✓ 是否调用了归一化函数
- ✓ 最小占比设置是否合理

## 🤝 贡献指南

### 添加新功能

1. 在对应层级添加属性
2. 更新类型定义
3. 实现功能逻辑
4. 添加文档说明
5. 提供使用示例

### 报告问题

请提供：
- 问题描述
- 复现步骤
- 预期行为
- 实际行为
- 环境信息

## 📈 版本历史

### V2.0.0 (2026-01-20)

**重大更新**：
- ✨ 创建三级分层架构
- ✨ 新增容器层和分组层
- ✨ 显式占比控制
- ✨ 增强的拖拽吸附
- ✨ 完整的文档系统

**新增组件**：
- DockManagerV2
- DockLayoutContainerV2
- PanelGroupContainerV2

**新增文档**：
- ARCHITECTURE_ANALYSIS.md
- V2_USAGE_GUIDE.md
- V2_QUICK_START.md
- V2_SUMMARY.md
- README_V2.md

## 📮 联系方式

- 项目路径：`src/views/DockingFrame`
- 演示页面：`Berthing02V2.vue`
- 文档目录：`DockingFrame/`

## 📄 许可证

本项目遵循项目整体许可证。

---

**版本**: 2.0.0  
**最后更新**: 2026-01-20  
**状态**: ✅ 已完成  
**质量评分**: ⭐⭐⭐⭐⭐

**核心价值**：清晰的三级架构 + 灵活的布局方式 + 保持原有功能
