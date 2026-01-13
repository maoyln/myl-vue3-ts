# 停泊吸附系统 - 架构设计图

## 📊 系统架构概览

```mermaid
graph TB
    subgraph "用户界面层"
        A[BerthingFrame.vue<br/>演示页面] --> B[DockContainer.vue<br/>容器组件]
        B --> C1[DockablePanel 1]
        B --> C2[DockablePanel 2]
        B --> C3[DockablePanel N...]
    end
    
    subgraph "状态管理层"
        D[useDockManager<br/>核心逻辑]
        D --> E[面板状态管理]
        D --> F[拖拽逻辑]
        D --> G[吸附检测]
        D --> H[位置计算]
    end
    
    subgraph "类型定义层"
        I[types.ts<br/>类型系统]
    end
    
    B -.Provide/Inject.-> D
    C1 -.Inject.-> D
    C2 -.Inject.-> D
    C3 -.Inject.-> D
    
    D --> I
    B --> I
    C1 --> I
    
    style A fill:#667eea
    style B fill:#764ba2
    style D fill:#f093fb
    style I fill:#4facfe
```

## 🔄 数据流图

```mermaid
sequenceDiagram
    participant User as 用户
    participant Panel as DockablePanel
    participant Manager as useDockManager
    participant Container as DockContainer
    
    User->>Panel: 按下标题栏
    Panel->>Manager: startDrag(panelId, x, y)
    Manager->>Manager: 记录拖拽信息
    Manager->>Manager: 转换为浮动状态
    
    User->>Container: 移动鼠标
    Container->>Manager: onDrag(x, y)
    Manager->>Manager: 更新面板位置
    Manager->>Manager: 检测吸附
    Manager->>Container: 更新 hoveredZone
    Container->>Container: 显示吸附提示
    
    User->>Container: 释放鼠标
    Container->>Manager: endDrag()
    Manager->>Manager: 最终吸附检测
    
    alt 应该吸附
        Manager->>Manager: 设置为停靠状态
        Manager->>Manager: 更新面板位置
        Manager->>Manager: 建立父子关系
    else 不吸附
        Manager->>Manager: 保持浮动状态
    end
    
    Manager->>Panel: 触发重新渲染
    Panel->>User: 显示最终状态
```

## 🏗️ 组件关系图

```mermaid
classDiagram
    class DockContainer {
        +manager: DockManager
        +containerRef: HTMLElement
        +handleMouseMove()
        +handleMouseUp()
        +getZoneIndicatorStyle()
    }
    
    class DockablePanel {
        +panel: PanelInstance
        +handleHeaderMouseDown()
        +handleDetach()
        +handleClose()
        +handleResizeStart()
    }
    
    class useDockManager {
        +panels: Map~string, PanelInstance~
        +dragInfo: DragInfo
        +hoveredZone: DockZone
        +addPanel()
        +removePanel()
        +startDrag()
        +onDrag()
        +endDrag()
        +detectSnap()
    }
    
    class PanelInstance {
        +id: string
        +title: string
        +state: PanelState
        +position: DockPosition
        +x: number
        +y: number
        +width: number
        +height: number
        +dockedWith: string
        +dockedPanels: string[]
    }
    
    DockContainer --> useDockManager : provides
    DockablePanel --> useDockManager : injects
    useDockManager --> PanelInstance : manages
    DockContainer ..> DockablePanel : renders
```

## 🎯 状态转换图

```mermaid
stateDiagram-v2
    [*] --> Floating: 创建面板
    Floating --> Dragging: 开始拖拽
    Dragging --> Docked: 吸附成功
    Dragging --> Floating: 未吸附
    Docked --> Dragging: 开始拖拽
    Docked --> Floating: 点击分离
    Floating --> [*]: 关闭面板
    Docked --> [*]: 关闭面板
    
    note right of Floating
        浮动状态
        - 可拖拽
        - 可调整大小
        - 独立显示
    end note
    
    note right of Docked
        停靠状态
        - 固定在边缘
        - 尺寸受约束
        - 可建立父子关系
    end note
    
    note right of Dragging
        拖拽状态
        - 跟随鼠标
        - 检测吸附
        - 显示提示
    end note
```

## 🧩 核心功能模块

```mermaid
graph LR
    subgraph "拖拽系统"
        A1[startDrag] --> A2[onDrag] --> A3[endDrag]
    end
    
    subgraph "吸附检测"
        B1[容器边缘检测] --> B3[返回吸附结果]
        B2[面板边缘检测] --> B3
    end
    
    subgraph "位置管理"
        C1[计算停靠位置]
        C2[计算浮动位置]
        C3[更新面板尺寸]
    end
    
    subgraph "关系管理"
        D1[建立父子关系]
        D2[移除关系]
        D3[查询关系]
    end
    
    A2 --> B1
    A2 --> B2
    A3 --> B3
    B3 --> C1
    B3 --> C2
    C1 --> D1
    D2 --> C2
    
    style A2 fill:#ff6b6b
    style B3 fill:#4ecdc4
    style C1 fill:#45b7d1
    style D1 fill:#96ceb4
```

## 📐 吸附检测算法流程

```mermaid
flowchart TD
    Start([开始拖拽]) --> CheckContainer{检测容器边缘}
    
    CheckContainer -->|距离左边缘 < hotZoneSize| SnapLeft[吸附到左边]
    CheckContainer -->|距离右边缘 < hotZoneSize| SnapRight[吸附到右边]
    CheckContainer -->|距离顶边缘 < hotZoneSize| SnapTop[吸附到顶部]
    CheckContainer -->|距离底边缘 < hotZoneSize| SnapBottom[吸附到底部]
    CheckContainer -->|都不满足| CheckPanels{检测面板边缘}
    
    CheckPanels -->|遍历所有已停靠面板| LoopPanels[计算距离]
    LoopPanels -->|距离某面板边缘 < snapThreshold| SnapPanel[吸附到该面板]
    LoopPanels -->|都不满足| NoSnap[不吸附]
    
    SnapLeft --> ShowIndicator[显示吸附指示器]
    SnapRight --> ShowIndicator
    SnapTop --> ShowIndicator
    SnapBottom --> ShowIndicator
    SnapPanel --> ShowIndicator
    NoSnap --> HideIndicator[隐藏指示器]
    
    ShowIndicator --> End([继续拖拽])
    HideIndicator --> End
    
    style CheckContainer fill:#ffd93d
    style CheckPanels fill:#ffd93d
    style ShowIndicator fill:#6bcf7f
    style NoSnap fill:#ff6b6b
```

## 🎨 UI 层级结构

```
┌─────────────────────────────────────────────────────────┐
│ DockContainer (z-index: 1)                              │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Main Content Area                                    │ │
│ │ (用户自定义内容)                                      │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ ┌───────────────────┐  ┌───────────────────┐            │
│ │ Panel 1           │  │ Panel 2           │            │
│ │ (z-index: 1001)   │  │ (z-index: 1002)   │            │
│ │ ┌───────────────┐ │  │ ┌───────────────┐ │            │
│ │ │ Header        │ │  │ │ Header        │ │            │
│ │ ├───────────────┤ │  │ ├───────────────┤ │            │
│ │ │               │ │  │ │               │ │            │
│ │ │ Content       │ │  │ │ Content       │ │            │
│ │ │               │ │  │ │               │ │            │
│ │ └───────────────┘ │  │ └───────────────┘ │            │
│ └───────────────────┘  └───────────────────┘            │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Dock Zone Indicator (z-index: 9999)                  │ │
│ │ (仅拖拽时显示)                                        │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 📊 数据结构关系

```mermaid
erDiagram
    DOCK-MANAGER ||--o{ PANEL-INSTANCE : manages
    PANEL-INSTANCE ||--o| PANEL-INSTANCE : dockedWith
    PANEL-INSTANCE ||--o{ PANEL-INSTANCE : dockedPanels
    DOCK-MANAGER ||--o| DRAG-INFO : tracks
    DOCK-MANAGER ||--o| DOCK-ZONE : displays
    
    DOCK-MANAGER {
        Map panels
        DragInfo dragInfo
        DockZone hoveredZone
        DOMRect containerRect
        number maxZIndex
    }
    
    PANEL-INSTANCE {
        string id PK
        string title
        PanelState state
        DockPosition position
        number x
        number y
        number width
        number height
        number zIndex
        string dockedWith FK
        array dockedPanels
    }
    
    DRAG-INFO {
        string panelId FK
        number startX
        number startY
        number currentX
        number currentY
        number offsetX
        number offsetY
    }
    
    DOCK-ZONE {
        DockPosition position
        DOMRect rect
    }
```

## 🔧 核心算法伪代码

### 吸附检测算法

```
function detectSnap(panel, mouseX, mouseY):
    // 1. 检测容器边缘
    if mouseX - container.left < hotZoneSize:
        return { shouldSnap: true, position: 'left' }
    if container.right - mouseX < hotZoneSize:
        return { shouldSnap: true, position: 'right' }
    if mouseY - container.top < hotZoneSize:
        return { shouldSnap: true, position: 'top' }
    if container.bottom - mouseY < hotZoneSize:
        return { shouldSnap: true, position: 'bottom' }
    
    // 2. 检测面板边缘
    for each dockedPanel in panels:
        if abs(mouseX - dockedPanel.left) < snapThreshold:
            return { shouldSnap: true, position: 'left', targetPanelId }
        if abs(mouseX - dockedPanel.right) < snapThreshold:
            return { shouldSnap: true, position: 'right', targetPanelId }
        // ... 检测上下边缘
    
    return { shouldSnap: false }
```

### 拖拽流程

```
function startDrag(panelId, x, y):
    panel = getPanel(panelId)
    panel.zIndex = ++maxZIndex
    
    if panel.state == 'docked':
        panel.state = 'floating'
        removeFromParent(panel)
    
    panel.state = 'dragging'
    
    dragInfo = {
        panelId: panelId,
        startX: x,
        startY: y,
        offsetX: x - panel.x,
        offsetY: y - panel.y
    }

function onDrag(x, y):
    if not dragInfo:
        return
    
    panel = getPanel(dragInfo.panelId)
    panel.x = x - dragInfo.offsetX
    panel.y = y - dragInfo.offsetY
    
    snapResult = detectSnap(panel, x, y)
    if snapResult.shouldSnap:
        showSnapIndicator(snapResult)
    else:
        hideSnapIndicator()

function endDrag():
    panel = getPanel(dragInfo.panelId)
    snapResult = detectSnap(panel, dragInfo.currentX, dragInfo.currentY)
    
    if snapResult.shouldSnap:
        panel.state = 'docked'
        panel.position = snapResult.position
        
        if snapResult.targetPanelId:
            panel.dockedWith = snapResult.targetPanelId
            addToParent(panel, snapResult.targetPanelId)
        
        updateDockedPosition(panel)
    else:
        panel.state = 'floating'
    
    dragInfo = null
    hoveredZone = null
```

## 🚀 扩展架构

```mermaid
graph TB
    subgraph "当前功能 ✅"
        A1[基础拖拽]
        A2[停靠吸附]
        A3[调整大小]
        A4[面板管理]
    end
    
    subgraph "扩展功能 🔄"
        B1[标签页合并]
        B2[布局持久化]
        B3[最小化/最大化]
        B4[拖拽预览]
        B5[键盘快捷键]
        B6[触摸支持]
        B7[自定义主题]
        B8[面板动画]
    end
    
    subgraph "高级功能 🎯"
        C1[布局模板]
        C2[分屏视图]
        C3[面板历史]
        C4[协作同步]
    end
    
    A1 --> B1
    A2 --> B1
    A4 --> B2
    A1 --> B3
    A1 --> B4
    A4 --> B5
    A1 --> B6
    A4 --> B7
    A1 --> B8
    
    B1 --> C1
    B2 --> C1
    B2 --> C3
    B2 --> C4
    
    style A1 fill:#6bcf7f
    style A2 fill:#6bcf7f
    style A3 fill:#6bcf7f
    style A4 fill:#6bcf7f
```

## 📈 性能优化策略

1. **拖拽优化**
   - 使用 `requestAnimationFrame` 优化拖拽渲染
   - 防抖/节流鼠标事件
   - CSS transform 代替 position 变化

2. **吸附检测优化**
   - 空间索引（四叉树/R树）
   - 只检测可见面板
   - 缓存面板边界信息

3. **渲染优化**
   - 虚拟滚动（大量面板时）
   - 懒加载面板内容
   - 使用 CSS containment

4. **内存优化**
   - 移除面板时清理事件监听
   - WeakMap 管理面板引用
   - 及时释放 DOM 引用

## 🎯 设计模式应用

| 模式 | 应用场景 | 位置 |
|------|---------|------|
| **Provider/Inject** | 跨组件状态共享 | useDockManager |
| **Composable** | 逻辑复用 | useDockManager |
| **Observer** | 响应式状态管理 | Vue Reactivity |
| **Strategy** | 吸附检测算法 | detectSnap |
| **Command** | 面板操作 | addPanel/removePanel |
| **Factory** | 面板实例创建 | addPanel |

---

**文档版本**: 1.0.0  
**最后更新**: 2026-01-13  
**维护者**: 前端架构团队
