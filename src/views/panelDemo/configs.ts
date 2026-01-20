/**
 * PhotoShow 面板组合布局系统 - 配置数据
 * 提供多套不同场景的布局配置方案
 */

import type { LayoutConfig } from './types';

/**
 * 方案1：右侧停靠 + 双悬浮面板组合
 * 适用场景：常规编辑工作流，右侧工具栏 + 悬浮快捷工具
 */
export const config1_RightDockWithFloat: LayoutConfig = {
  layoutManagerConfig: {
    managerId: "layout_manager_01",
    dockManagerConfig: {
      hotZoneSize: 20,
      minPanelWidth: 120,
      minPanelHeight: 80
    },
    dockContainerConfig: {
      containerId: "dock_container_right_01",
      dockPosition: "right",
      containerSize: {
        width: 360,
        height: 800
      },
      isResizable: true,
      groupList: [
        {
          groupId: "dock_group_01",
          groupRatio: 0.25,
          groupConfig: {
            title: "效果与资源",
            icon: "🎨",
            closable: false
          },
          panelList: [
            {
              panelId: "panel_3d",
              panelName: "3D 效果面板",
              panelRatio: 0.5,
              panelConfig: {
                isCollapsible: true,
                isVisible: true,
                defaultState: "expanded"
              },
              tabItem: {
                id: "tab_3d",
                title: "3D 效果",
                icon: "🎲",
                closable: false
              }
            },
            {
              panelId: "panel_pattern",
              panelName: "图案资源面板",
              panelRatio: 0.5,
              panelConfig: {
                isCollapsible: true,
                isVisible: true,
                defaultState: "expanded"
              },
              tabItem: {
                id: "tab_pattern",
                title: "图案资源",
                icon: "🖼️",
                closable: false
              }
            }
          ]
        },
        {
          groupId: "dock_group_02",
          groupRatio: 0.5,
          groupConfig: {
            title: "图层管理",
            icon: "📚",
            closable: false
          },
          panelList: [
            {
              panelId: "panel_layer",
              panelName: "图层管理面板",
              panelRatio: 1.0,
              panelConfig: {
                isCollapsible: true,
                isVisible: true,
                defaultState: "expanded"
              },
              tabItem: {
                id: "tab_layer",
                title: "图层管理",
                icon: "📑",
                closable: false
              }
            }
          ]
        },
        {
          groupId: "dock_group_03",
          groupRatio: 0.25,
          groupConfig: {
            title: "快捷与调色",
            icon: "🛠️",
            closable: false
          },
          panelList: [
            {
              panelId: "panel_quick",
              panelName: "快捷操作面板",
              panelRatio: 0.33,
              panelConfig: {
                isCollapsible: true,
                isVisible: true,
                defaultState: "expanded"
              },
              tabItem: {
                id: "tab_quick",
                title: "快捷操作",
                icon: "⚡",
                closable: false
              }
            },
            {
              panelId: "panel_channel",
              panelName: "通道编辑面板",
              panelRatio: 0.33,
              panelConfig: {
                isCollapsible: true,
                isVisible: true,
                defaultState: "expanded"
              },
              tabItem: {
                id: "tab_channel",
                title: "通道编辑",
                icon: "📡",
                closable: false
              }
            },
            {
              panelId: "panel_color",
              panelName: "颜色配置面板",
              panelRatio: 0.34,
              panelConfig: {
                isCollapsible: true,
                isVisible: true,
                defaultState: "expanded"
              },
              tabItem: {
                id: "tab_color",
                title: "颜色配置",
                icon: "🎨",
                closable: false
              }
            }
          ]
        }
      ]
    },
    floatPanelGroupList: [
      {
        id: "float_group_01",
        title: "常用工具组合",
        icon: "🔧",
        tabs: [
          {
            id: "tab_quick_float",
            title: "快捷操作",
            icon: "⚡",
            closable: true
          },
          {
            id: "tab_color_float",
            title: "颜色配置",
            icon: "🎨",
            closable: true
          }
        ],
        activeTabId: "tab_quick_float",
        width: 300,
        height: 400,
        originalWidth: 300,
        originalHeight: 400,
        x: 100,
        y: 100,
        zIndex: 1000,
        state: "floating",
        position: "float",
        resizable: true,
        closable: true
      },
      {
        id: "float_group_02",
        title: "3D 效果独立面板",
        icon: "🎲",
        tabs: [
          {
            id: "tab_3d_float",
            title: "3D 效果",
            icon: "🎲",
            closable: false
          }
        ],
        activeTabId: "tab_3d_float",
        width: 240,
        height: 360,
        originalWidth: 240,
        originalHeight: 360,
        x: 450,
        y: 150,
        zIndex: 1001,
        state: "floating",
        position: "float",
        resizable: true,
        closable: true
      }
    ]
  }
};

/**
 * 方案2：底部停靠布局
 * 适用场景：时间轴编辑、代码调试等需要横向空间的场景
 */
export const config2_BottomDock: LayoutConfig = {
  layoutManagerConfig: {
    managerId: "layout_manager_02",
    dockManagerConfig: {
      hotZoneSize: 20,
      minPanelWidth: 120,
      minPanelHeight: 80
    },
    dockContainerConfig: {
      containerId: "dock_container_bottom_01",
      dockPosition: "bottom",
      containerSize: {
        width: 1200,
        height: 240
      },
      isResizable: true,
      groupList: [
        {
          groupId: "dock_group_bottom_01",
          groupRatio: 0.3,
          groupConfig: {
            title: "效果预览",
            icon: "👁️",
            closable: false
          },
          panelList: [
            {
              panelId: "panel_preview",
              panelName: "效果预览面板",
              panelRatio: 1.0,
              panelConfig: {
                isCollapsible: true,
                isVisible: true,
                defaultState: "expanded"
              },
              tabItem: {
                id: "tab_preview",
                title: "效果预览",
                icon: "👁️",
                closable: false
              }
            }
          ]
        },
        {
          groupId: "dock_group_bottom_02",
          groupRatio: 0.4,
          groupConfig: {
            title: "时间轴控制",
            icon: "⏱️",
            closable: false
          },
          panelList: [
            {
              panelId: "panel_timeline",
              panelName: "时间轴面板",
              panelRatio: 1.0,
              panelConfig: {
                isCollapsible: true,
                isVisible: true,
                defaultState: "expanded"
              },
              tabItem: {
                id: "tab_timeline",
                title: "时间轴",
                icon: "📊",
                closable: false
              }
            }
          ]
        },
        {
          groupId: "dock_group_bottom_03",
          groupRatio: 0.3,
          groupConfig: {
            title: "调试信息",
            icon: "🐛",
            closable: false
          },
          panelList: [
            {
              panelId: "panel_console",
              panelName: "控制台面板",
              panelRatio: 0.5,
              panelConfig: {
                isCollapsible: true,
                isVisible: true,
                defaultState: "expanded"
              },
              tabItem: {
                id: "tab_console",
                title: "控制台",
                icon: "💻",
                closable: false
              }
            },
            {
              panelId: "panel_info",
              panelName: "信息面板",
              panelRatio: 0.5,
              panelConfig: {
                isCollapsible: true,
                isVisible: true,
                defaultState: "expanded"
              },
              tabItem: {
                id: "tab_info",
                title: "信息",
                icon: "ℹ️",
                closable: false
              }
            }
          ]
        }
      ]
    },
    floatPanelGroupList: []
  }
};

/**
 * 方案3：左侧停靠 + 多悬浮面板
 * 适用场景：资源浏览器 + 多个独立工具窗口
 */
export const config3_LeftDockWithMultiFloat: LayoutConfig = {
  layoutManagerConfig: {
    managerId: "layout_manager_03",
    dockManagerConfig: {
      hotZoneSize: 20,
      minPanelWidth: 120,
      minPanelHeight: 80
    },
    dockContainerConfig: {
      containerId: "dock_container_left_01",
      dockPosition: "left",
      containerSize: {
        width: 280,
        height: 800
      },
      isResizable: true,
      groupList: [
        {
          groupId: "dock_group_left_01",
          groupRatio: 0.4,
          groupConfig: {
            title: "文件浏览",
            icon: "📁",
            closable: false
          },
          panelList: [
            {
              panelId: "panel_explorer",
              panelName: "资源浏览器",
              panelRatio: 1.0,
              panelConfig: {
                isCollapsible: true,
                isVisible: true,
                defaultState: "expanded"
              },
              tabItem: {
                id: "tab_explorer",
                title: "资源浏览",
                icon: "📂",
                closable: false
              }
            }
          ]
        },
        {
          groupId: "dock_group_left_02",
          groupRatio: 0.6,
          groupConfig: {
            title: "项目管理",
            icon: "📋",
            closable: false
          },
          panelList: [
            {
              panelId: "panel_project",
              panelName: "项目结构",
              panelRatio: 0.5,
              panelConfig: {
                isCollapsible: true,
                isVisible: true,
                defaultState: "expanded"
              },
              tabItem: {
                id: "tab_project",
                title: "项目结构",
                icon: "🗂️",
                closable: false
              }
            },
            {
              panelId: "panel_outline",
              panelName: "大纲视图",
              panelRatio: 0.5,
              panelConfig: {
                isCollapsible: true,
                isVisible: true,
                defaultState: "expanded"
              },
              tabItem: {
                id: "tab_outline",
                title: "大纲",
                icon: "📝",
                closable: false
              }
            }
          ]
        }
      ]
    },
    floatPanelGroupList: [
      {
        id: "float_group_03_01",
        title: "属性编辑器",
        icon: "⚙️",
        tabs: [
          {
            id: "tab_properties",
            title: "属性",
            icon: "⚙️",
            closable: true
          }
        ],
        activeTabId: "tab_properties",
        width: 320,
        height: 450,
        originalWidth: 320,
        originalHeight: 450,
        x: 350,
        y: 80,
        zIndex: 1000,
        state: "floating",
        position: "float",
        resizable: true,
        closable: true
      },
      {
        id: "float_group_03_02",
        title: "历史记录",
        icon: "📜",
        tabs: [
          {
            id: "tab_history",
            title: "历史",
            icon: "⏮️",
            closable: true
          },
          {
            id: "tab_action",
            title: "动作",
            icon: "⚡",
            closable: true
          }
        ],
        activeTabId: "tab_history",
        width: 280,
        height: 380,
        originalWidth: 280,
        originalHeight: 380,
        x: 720,
        y: 120,
        zIndex: 1001,
        state: "floating",
        position: "float",
        resizable: true,
        closable: true
      },
      {
        id: "float_group_03_03",
        title: "画笔工具",
        icon: "🖌️",
        tabs: [
          {
            id: "tab_brush",
            title: "画笔",
            icon: "🖌️",
            closable: false
          }
        ],
        activeTabId: "tab_brush",
        width: 250,
        height: 320,
        originalWidth: 250,
        originalHeight: 320,
        x: 1050,
        y: 200,
        zIndex: 1002,
        state: "floating",
        position: "float",
        resizable: true,
        closable: true
      }
    ]
  }
};

/**
 * 方案4：全场景组合（左右底 + 多悬浮）
 * 适用场景：专业级复杂工作流，同时需要多个停靠区域和悬浮工具
 */
export const config4_ComplexLayout: LayoutConfig = {
  layoutManagerConfig: {
    managerId: "layout_manager_04",
    dockManagerConfig: {
      hotZoneSize: 20,
      minPanelWidth: 120,
      minPanelHeight: 80
    },
    // 注意：这里只能配置一个停靠容器，实际应用中需要支持多个停靠容器
    // 这里以右侧为例
    dockContainerConfig: {
      containerId: "dock_container_complex_right",
      dockPosition: "right",
      containerSize: {
        width: 400,
        height: 800
      },
      isResizable: true,
      groupList: [
        {
          groupId: "dock_group_complex_01",
          groupRatio: 0.35,
          groupConfig: {
            title: "图层与蒙版",
            icon: "📚",
            closable: false
          },
          panelList: [
            {
              panelId: "panel_layer_complex",
              panelName: "图层",
              panelRatio: 0.7,
              panelConfig: {
                isCollapsible: true,
                isVisible: true,
                defaultState: "expanded"
              },
              tabItem: {
                id: "tab_layer_complex",
                title: "图层",
                icon: "📑",
                closable: false
              }
            },
            {
              panelId: "panel_mask",
              panelName: "蒙版",
              panelRatio: 0.3,
              panelConfig: {
                isCollapsible: true,
                isVisible: true,
                defaultState: "expanded"
              },
              tabItem: {
                id: "tab_mask",
                title: "蒙版",
                icon: "🎭",
                closable: false
              }
            }
          ]
        },
        {
          groupId: "dock_group_complex_02",
          groupRatio: 0.35,
          groupConfig: {
            title: "调整与效果",
            icon: "🎨",
            closable: false
          },
          panelList: [
            {
              panelId: "panel_adjustment",
              panelName: "调整",
              panelRatio: 0.5,
              panelConfig: {
                isCollapsible: true,
                isVisible: true,
                defaultState: "expanded"
              },
              tabItem: {
                id: "tab_adjustment",
                title: "调整",
                icon: "🎛️",
                closable: false
              }
            },
            {
              panelId: "panel_effect",
              panelName: "效果",
              panelRatio: 0.5,
              panelConfig: {
                isCollapsible: true,
                isVisible: true,
                defaultState: "expanded"
              },
              tabItem: {
                id: "tab_effect",
                title: "效果",
                icon: "✨",
                closable: false
              }
            }
          ]
        },
        {
          groupId: "dock_group_complex_03",
          groupRatio: 0.3,
          groupConfig: {
            title: "资源库",
            icon: "🗃️",
            closable: false
          },
          panelList: [
            {
              panelId: "panel_assets",
              panelName: "资源",
              panelRatio: 1.0,
              panelConfig: {
                isCollapsible: true,
                isVisible: true,
                defaultState: "expanded"
              },
              tabItem: {
                id: "tab_assets",
                title: "资源库",
                icon: "📦",
                closable: false
              }
            }
          ]
        }
      ]
    },
    floatPanelGroupList: [
      {
        id: "float_group_04_01",
        title: "颜色选择器",
        icon: "🎨",
        tabs: [
          {
            id: "tab_color_picker",
            title: "颜色",
            icon: "🎨",
            closable: true
          },
          {
            id: "tab_swatches",
            title: "色板",
            icon: "🖍️",
            closable: true
          }
        ],
        activeTabId: "tab_color_picker",
        width: 280,
        height: 350,
        originalWidth: 280,
        originalHeight: 350,
        x: 50,
        y: 50,
        zIndex: 1000,
        state: "floating",
        position: "float",
        resizable: true,
        closable: true
      },
      {
        id: "float_group_04_02",
        title: "画笔设置",
        icon: "🖌️",
        tabs: [
          {
            id: "tab_brush_settings",
            title: "画笔设置",
            icon: "🖌️",
            closable: false
          }
        ],
        activeTabId: "tab_brush_settings",
        width: 320,
        height: 420,
        originalWidth: 320,
        originalHeight: 420,
        x: 380,
        y: 80,
        zIndex: 1001,
        state: "floating",
        position: "float",
        resizable: true,
        closable: true
      },
      {
        id: "float_group_04_03",
        title: "路径工具",
        icon: "✏️",
        tabs: [
          {
            id: "tab_paths",
            title: "路径",
            icon: "✏️",
            closable: true
          }
        ],
        activeTabId: "tab_paths",
        width: 260,
        height: 300,
        originalWidth: 260,
        originalHeight: 300,
        x: 750,
        y: 150,
        zIndex: 1002,
        state: "floating",
        position: "float",
        resizable: true,
        closable: true
      },
      {
        id: "float_group_04_04",
        title: "信息面板",
        icon: "ℹ️",
        tabs: [
          {
            id: "tab_info_complex",
            title: "信息",
            icon: "ℹ️",
            closable: true
          },
          {
            id: "tab_histogram",
            title: "直方图",
            icon: "📊",
            closable: true
          }
        ],
        activeTabId: "tab_info_complex",
        width: 300,
        height: 250,
        originalWidth: 300,
        originalHeight: 250,
        x: 100,
        y: 450,
        zIndex: 1003,
        state: "floating",
        position: "float",
        resizable: true,
        closable: true
      }
    ]
  }
};

/**
 * 配置方案列表（用于演示切换）
 */
export const configList = [
  {
    id: 'config1',
    name: '方案1：右侧停靠 + 双悬浮',
    description: '常规编辑工作流，右侧工具栏 + 悬浮快捷工具',
    config: config1_RightDockWithFloat
  },
  {
    id: 'config2',
    name: '方案2：底部停靠布局',
    description: '时间轴编辑、代码调试等需要横向空间的场景',
    config: config2_BottomDock
  },
  {
    id: 'config3',
    name: '方案3：左侧停靠 + 多悬浮',
    description: '资源浏览器 + 多个独立工具窗口',
    config: config3_LeftDockWithMultiFloat
  },
  {
    id: 'config4',
    name: '方案4：全场景组合',
    description: '专业级复杂工作流，多停靠区域和悬浮工具',
    config: config4_ComplexLayout
  }
];
