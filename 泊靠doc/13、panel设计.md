# PhotoShow 面板组合布局（新增悬浮功能）优化方案
## 一、需求文案优化（补充悬浮能力，贴合类型定义规范）
在原有优化基础上，补充悬浮相关文案，同时对齐提供的 TypeScript 类型定义，使文案更精准、完整且符合工程化场景：

| 原文案/新增文案 | 优化后文案 | 优化说明 |
|--------|------------|----------|
| 泊靠功能 | 停靠（Dock）功能 | 统一术语为“停靠”，与 `DockPosition`/`DockZone` 类型定义对齐 |
| 悬浮的时候的组合（需要考虑具体位置） | 悬浮（Float）面板组组合（支持坐标定位、多层级叠加、标签页聚合） | 1. 对齐 `DockPosition = 'float'` 和 `PanelState = 'floating'`；2. 明确悬浮核心特性：坐标可控、zIndex 层级、Tab 标签组合，补充“具体位置”的落地内涵 |
| 右边的工具栏 | 右侧停靠面板容器（支持与悬浮面板组联动） | 补充联动能力，兼顾停靠与悬浮场景 |
| 面板项 | 功能面板（可封装为 Tab 标签项，支持聚合为面板组） | 对齐 `TabItem` 接口，明确“面板项→Tab 标签→面板组”的聚合关系 |
| 列/行组 | 停靠分组（列组/行组，仅作用于停靠状态，悬浮状态无分组约束） | 区分停靠与悬浮的布局差异，停靠依赖分组，悬浮自由布局 |
| 容器壳子 | 面板布局管理器（包含停靠容器核心 + 悬浮面板调度核心） | 升级封装定位，兼顾停靠容器的布局能力和悬浮面板的调度、定位能力 |
| 占比 | 布局占比（仅停靠状态生效，悬浮状态使用固定宽高+坐标） | 明确占比的适用场景，悬浮场景对齐 `PanelGroup` 的 `width/height/x/y` 定义 |
| 拖拽 | 面板组拖拽/标签页拖拽（支持停靠热区识别、悬浮坐标偏移、标签页跨组聚合） | 对齐 `DragInfo`/`TabDragInfo` 接口，明确两种拖拽场景的核心能力 |

## 二、整体核心设计（延续三级分层，补充悬浮适配）
### 1.  整体架构核心：「布局管理器 + 停靠容器（三级分层） + 悬浮面板组」双层架构
在原有「停靠容器 + 列/行组 + 面板项」三级分层基础上，新增顶层**布局管理器**，实现停靠与悬浮的统一调度，整体架构如下：
```
┌──────────────────────── 布局管理器（统一调度） ───────────────────────┐
│  ┌──────────────── 停靠容器（原有三级分层，仅停靠状态生效） ──────────────┐ │
│  │  第一级：停靠容器（DockContainer）- 定义停靠位置、整体尺寸          │ │
│  │  第二级：停靠分组（Column/Row Group）- 定义列/行占比、面板聚合      │ │
│  │  第三级：面板项（PanelItem → 映射为 TabItem）- 定义面板占比、基础配置 │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│  ┌──────────────── 悬浮面板组（Float PanelGroup，仅悬浮状态生效） ────────┐ │
│  │  核心：脱离停靠容器约束，以「面板组」为独立单元，包含以下核心属性：   │ │
│  │  1.  标识与状态：唯一 ID、面板状态（floating）、zIndex 层级          │ │
│  │  2.  尺寸与位置：固定宽高、x/y 坐标（精准定位具体位置）              │ │
│  │  3.  内容聚合：Tab 标签页列表、当前激活标签（对齐 TabItem 接口）      │ │
│  │  4.  原始信息：原始宽高（用于切换为停靠状态时恢复）                  │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```
核心优势：
-  停靠与悬浮解耦又统一，均由布局管理器调度，互不干扰且可无缝切换（如悬浮面板拖拽至停靠热区转为停靠状态）；
-  延续原有三级分层的配置化能力，同时悬浮面板组对齐提供的 `PanelGroup` 接口，保证类型一致性；
-  面板项与 Tab 标签页一一映射，支持单一面板独立成组、多面板聚合为标签页组，兼顾灵活性和易用性。

### 2.  布局适配核心：「状态驱动布局模式切换 + 维度适配复用」
在原有「方向驱动占比维度切换」基础上，新增「面板状态驱动布局模式切换」，整体适配逻辑分为两层：
#### （1） 第一层：面板状态驱动（核心切换逻辑）
-  当面板状态为 `docked`（停靠）：启用「停靠容器三级分层」布局，占比维度切换逻辑保持不变，所有布局依赖「占比计算」；
-  当面板状态为 `floating`（悬浮）：禁用停靠分组约束，启用「悬浮面板组」自由布局，所有布局依赖「固定尺寸 + 坐标定位」，无占比相关逻辑。

#### （2） 第二层：停靠状态下的方向驱动占比维度切换（延续原有逻辑，优化对齐类型）
-  停靠位置为 `left`/`right`（纵向停靠容器）：
  -  分组为「列组」，分组占比 = 横向占比（列宽/容器总宽度）；
  -  分组内面板项纵向排列，面板占比 = 纵向占比（面板高度/分组总高度）；
  -  面板项聚合为 Tab 标签页，嵌入列组容器中。
-  停靠位置为 `top`/`bottom`（横向停靠容器）：
  -  分组为「行组」，分组占比 = 纵向占比（行高/容器总高度）；
  -  分组内面板项横向排列，面板占比 = 横向占比（面板宽度/分组总宽度）；
  -  面板项聚合为 Tab 标签页，嵌入行组容器中。

#### （3） 补充：悬浮与停靠切换时的适配逻辑
-  悬浮 → 停靠：读取悬浮面板组的 `originalWidth`/`originalHeight`，映射为停靠分组/面板项的占比，自动适配停靠容器的布局模式；
-  停靠 → 悬浮：读取停靠面板项的占比计算出实际像素尺寸，赋值给悬浮面板组的 `width`/`height`/`originalWidth`/`originalHeight`，同时记录当前鼠标偏移量作为 `x`/`y` 初始坐标。

### 3.  容器壳子（布局管理器）封装核心：「配置化 + 可复用 + 双状态联动」
在原有「配置化 + 可复用」基础上，补充「双状态联动」能力，封装的布局管理器（容器壳子）核心要点：
1.  配置化初始化：支持通过一份完整配置数据，同时初始化停靠容器布局和悬浮面板组布局，无需分别配置；
2.  双状态统一调度：内置 `docked`/`floating` 状态切换逻辑，提供统一的 API（如 `switchPanelState`、`dragPanel`），屏蔽底层布局差异；
3.  可复用布局能力：停靠容器的三级分层布局、悬浮面板组的坐标定位布局，均可独立复用，支持新增多个停靠容器和悬浮面板组；
4.  对齐类型定义：内置 `DockPosition`/`PanelGroup`/`DragInfo` 等类型约束，保证与现有拖拽停靠系统的兼容性；
5.  预留扩展能力：
   -  停靠侧：支持热区识别（对齐 `DockZone`）、分组拖拽调整、占比动态修改；
   -  悬浮侧：支持 zIndex 层级调整、标签页跨组拖拽（对齐 `TabDragInfo`）、悬浮面板组合并/拆分；
6.  视觉一致性保障：统一停靠面板和悬浮面板的样式容器，仅在悬浮面板组增加「拖拽标题栏」「层级调整按钮」，保持整体视觉风格统一。

## 三、标准化数据格式（JSON 结构，对齐 TypeScript 类型定义）
### 1.  顶层数据结构：布局管理器完整配置（包含停靠+悬浮）
```json
{
  "layoutManagerConfig": {
    "managerId": "photo_show_layout_manager_01",
    "dockManagerConfig": {
      "hotZoneSize": 20,
      "minPanelWidth": 120,
      "minPanelHeight": 80
    },
    // 停靠容器配置（延续原有三级分层，对齐 DockPosition 类型）
    "dockContainerConfig": {
      "containerId": "dock_container_right_01",
      "dockPosition": "right",
      "containerSize": {
        "width": 360,
        "height": 800
      },
      "isResizable": true,
      "groupList": [
        {
          "groupId": "dock_group_01",
          "groupRatio": 0.25,
          "groupConfig": {
            "title": "效果与资源",
            "icon": "icon-effect",
            "closable": false
          },
          "panelList": [
            {
              "panelId": "panel_3d",
              "panelName": "3D 效果面板",
              "panelRatio": 0.5,
              "panelConfig": {
                "isCollapsible": true,
                "isVisible": true,
                "defaultState": "expanded"
              },
              // 映射为 TabItem（对齐 TabItem 接口）
              "tabItem": {
                "id": "tab_3d",
                "title": "3D 效果",
                "icon": "icon-3d",
                "closable": false
              }
            },
            {
              "panelId": "panel_pattern",
              "panelName": "图案资源面板",
              "panelRatio": 0.5,
              "panelConfig": {
                "isCollapsible": true,
                "isVisible": true,
                "defaultState": "expanded"
              },
              "tabItem": {
                "id": "tab_pattern",
                "title": "图案资源",
                "icon": "icon-pattern",
                "closable": false
              }
            }
          ]
        },
        {
          "groupId": "dock_group_02",
          "groupRatio": 0.5,
          "groupConfig": {
            "title": "图层管理",
            "icon": "icon-layer",
            "closable": false
          },
          "panelList": [
            {
              "panelId": "panel_layer",
              "panelName": "图层管理面板",
              "panelRatio": 1.0,
              "panelConfig": {
                "isCollapsible": true,
                "isVisible": true,
                "defaultState": "expanded"
              },
              "tabItem": {
                "id": "tab_layer",
                "title": "图层管理",
                "icon": "icon-layer",
                "closable": false
              }
            }
          ]
        },
        {
          "groupId": "dock_group_03",
          "groupRatio": 0.25,
          "groupConfig": {
            "title": "快捷与调色",
            "icon": "icon-tool",
            "closable": false
          },
          "panelList": [
            {
              "panelId": "panel_quick",
              "panelName": "快捷操作面板",
              "panelRatio": 1/3,
              "panelConfig": {
                "isCollapsible": true,
                "isVisible": true,
                "defaultState": "expanded"
              },
              "tabItem": {
                "id": "tab_quick",
                "title": "快捷操作",
                "icon": "icon-quick",
                "closable": false
              }
            },
            {
              "panelId": "panel_channel",
              "panelName": "通道编辑面板",
              "panelRatio": 1/3,
              "panelConfig": {
                "isCollapsible": true,
                "isVisible": true,
                "defaultState": "expanded"
              },
              "tabItem": {
                "id": "tab_channel",
                "title": "通道编辑",
                "icon": "icon-channel",
                "closable": false
              }
            },
            {
              "panelId": "panel_color",
              "panelName": "颜色配置面板",
              "panelRatio": 1/3,
              "panelConfig": {
                "isCollapsible": true,
                "isVisible": true,
                "defaultState": "expanded"
              },
              "tabItem": {
                "id": "tab_color",
                "title": "颜色配置",
                "icon": "icon-color",
                "closable": false
              }
            }
          ]
        }
      ]
    },
    // 悬浮面板组配置（对齐 PanelGroup 接口，补充具体位置信息）
    "floatPanelGroupList": [
      {
        "id": "float_group_01",
        "title": "常用工具组合",
        "icon": "icon-combo",
        "tabs": [
          {
            "id": "tab_quick",
            "title": "快捷操作",
            "icon": "icon-quick",
            "closable": true
          },
          {
            "id": "tab_color",
            "title": "颜色配置",
            "icon": "icon-color",
            "closable": true
          }
        ],
        "activeTabId": "tab_quick",
        "width": 300,
        "height": 400,
        "originalWidth": 300,
        "originalHeight": 400,
        "x": 600,
        "y": 200,
        "zIndex": 1000,
        "state": "floating",
        "position": "float",
        "resizable": true,
        "closable": true
      },
      {
        "id": "float_group_02",
        "title": "3D 效果独立面板",
        "icon": "icon-3d",
        "tabs": [
          {
            "id": "tab_3d",
            "title": "3D 效果",
            "icon": "icon-3d",
            "closable": false
          }
        ],
        "activeTabId": "tab_3d",
        "width": 240,
        "height": 360,
        "originalWidth": 240,
        "originalHeight": 360,
        "x": 1000,
        "y": 300,
        "zIndex": 1001,
        "state": "floating",
        "position": "float",
        "resizable": true,
        "closable": true
      }
    ]
  }
}
```

### 2.  不同场景适配示例
#### （1） 底部停靠容器（仅修改核心配置项，其余结构一致）
```json
{
  "layoutManagerConfig": {
    "dockContainerConfig": {
      "containerId": "dock_container_bottom_01",
      "dockPosition": "bottom",
      "containerSize": {
        "width": 1200,
        "height": 240
      },
      "groupList": [
        {
          "groupId": "dock_group_bottom_01",
          "groupRatio": 0.25,
          "groupConfig": {
            "title": "效果预览",
            "icon": "icon-preview",
            "closable": false
          },
          "panelList": [
            {
              "panelId": "panel_3d_bottom",
              "panelName": "3D 效果面板",
              "panelRatio": 0.5,
              "tabItem": {
                "id": "tab_3d_bottom",
                "title": "3D 效果",
                "icon": "icon-3d",
                "closable": false
              }
            }
          ]
        }
      ]
    }
  }
}
```

#### （2） 悬浮面板组修改位置（调整 x/y 坐标，实现精准定位）
```json
{
  "layoutManagerConfig": {
    "floatPanelGroupList": [
      {
        "id": "float_group_01",
        "x": 700,
        "y": 300,
        "zIndex": 1002,
        "state": "floating",
        "position": "float"
      }
    ]
  }
}
```

### 3.  数据格式说明（对齐 TypeScript 类型定义，补充核心要点）
1.  整体对齐提供的 TypeScript 接口：
    -  `dockPosition` 包含 `left/right/top/bottom/float`，与 `DockPosition` 类型一致；
    -  `floatPanelGroupList` 中的每个项，完全对齐 `PanelGroup` 接口，包含 `id/tabs/activeTabId/width/height/x/y/zIndex/state/position` 等所有字段；
    -  `dockManagerConfig` 对齐 `DockManagerConfig` 接口，包含 `hotZoneSize/minPanelWidth/minPanelHeight`；
    -  `tabItem` 对齐 `TabItem` 接口，包含 `id/title/icon/closable`。
2.  停靠状态下的「占比」字段（`groupRatio/panelRatio`）仍为 0~1 之间的小数，总和建议为 1，仅用于停靠容器的布局计算，悬浮状态不依赖该字段。
3.  悬浮状态下的 `x/y` 为相对于浏览器视口的像素坐标，`zIndex` 为数字类型，值越大层级越高，避免悬浮面板组遮挡冲突。
4.  面板项与 Tab 标签页通过 `panelId` 与 `tabItem.id` 关联，支持双向映射，便于在停靠与悬浮状态切换时同步面板内容。
5.  数据结构具有可扩展性：
    -  新增停靠容器：在 `layoutManagerConfig` 中追加 `dockContainerConfig` 即可；
    -  新增悬浮面板组：在 `floatPanelGroupList` 中追加面板组配置即可；
    -  新增标签页：在对应分组的 `panelList.tabItem` 或悬浮面板组的 `tabs` 中追加即可。

## 四、补充说明
1.  该数据格式与提供的拖拽停靠系统类型定义完全兼容，可直接作为布局初始化配置，无需额外转换；
2.  悬浮面板组的「具体位置」通过 `x/y` 坐标精准控制，支持用户拖拽修改后更新该配置，实现布局保存与恢复；
3.  停靠容器的三级分层与悬浮面板组的自由布局，通过布局管理器实现无缝联动，核心是「面板项↔Tab 标签页」的映射关系，保证内容一致性；
4.  若需支持「标签页跨组拖拽」，可在顶层配置中新增 `tabDragRelation` 字段，记录 `tabId` 与 `groupId` 的关联关系，对齐 `TabDragInfo` 接口的 `hoveredGroupId` 和 `insertIndex`。