/**
 * PhotoShow 面板组合布局系统 - 类型定义
 * 支持停靠（Dock）和悬浮（Float）两种布局模式
 */

// ===== 基础类型定义 =====

/** 停靠位置类型 */
export type DockPosition = 'left' | 'right' | 'top' | 'bottom' | 'float';

/** 面板状态类型 */
export type PanelState = 'docked' | 'floating';

/** 默认状态类型 */
export type DefaultState = 'expanded' | 'collapsed';

// ===== Tab 标签项相关 =====

/** Tab 标签项接口 */
export interface TabItem {
  /** 唯一标识 */
  id: string;
  /** 标题 */
  title: string;
  /** 图标 */
  icon?: string;
  /** 是否可关闭 */
  closable: boolean;
  /** 内容组件名称（可选） */
  component?: string;
}

// ===== 停靠容器相关 =====

/** 容器尺寸 */
export interface ContainerSize {
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
}

/** 面板配置 */
export interface PanelConfig {
  /** 是否可折叠 */
  isCollapsible: boolean;
  /** 是否可见 */
  isVisible: boolean;
  /** 默认状态 */
  defaultState: DefaultState;
}

/** 停靠面板项（第三级） */
export interface DockPanel {
  /** 面板唯一标识 */
  panelId: string;
  /** 面板名称 */
  panelName: string;
  /** 面板占比（0~1） */
  panelRatio: number;
  /** 面板配置 */
  panelConfig: PanelConfig;
  /** 映射为 Tab 标签项 */
  tabItem: TabItem;
}

/** 分组配置 */
export interface GroupConfig {
  /** 标题 */
  title: string;
  /** 图标 */
  icon?: string;
  /** 是否可关闭 */
  closable: boolean;
}

/** 停靠分组（第二级：列组或行组） */
export interface DockGroup {
  /** 分组唯一标识 */
  groupId: string;
  /** 分组占比（0~1） */
  groupRatio: number;
  /** 分组配置 */
  groupConfig: GroupConfig;
  /** 面板列表 */
  panelList: DockPanel[];
}

/** 停靠容器配置（第一级） */
export interface DockContainerConfig {
  /** 容器唯一标识 */
  containerId: string;
  /** 停靠位置 */
  dockPosition: Exclude<DockPosition, 'float'>;
  /** 容器尺寸 */
  containerSize: ContainerSize;
  /** 是否可调整大小 */
  isResizable: boolean;
  /** 分组列表 */
  groupList: DockGroup[];
}

// ===== 悬浮面板组相关 =====

/** 悬浮面板组接口 */
export interface PanelGroup {
  /** 唯一标识 */
  id: string;
  /** 标题 */
  title: string;
  /** 图标 */
  icon?: string;
  /** 标签页列表 */
  tabs: TabItem[];
  /** 当前激活的标签页ID */
  activeTabId: string;
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
  /** 原始宽度（用于状态切换） */
  originalWidth: number;
  /** 原始高度（用于状态切换） */
  originalHeight: number;
  /** X 坐标 */
  x: number;
  /** Y 坐标 */
  y: number;
  /** 层级 */
  zIndex: number;
  /** 面板状态 */
  state: PanelState;
  /** 停靠位置 */
  position: DockPosition;
  /** 是否可调整大小 */
  resizable: boolean;
  /** 是否可关闭 */
  closable: boolean;
}

// ===== 拖拽相关 =====

/** 停靠热区类型 */
export type DockZone = 'left' | 'right' | 'top' | 'bottom' | 'center' | 'none';

/** 拖拽信息 */
export interface DragInfo {
  /** 是否正在拖拽 */
  isDragging: boolean;
  /** 拖拽的面板组ID */
  draggedGroupId?: string;
  /** 当前鼠标位置 */
  mousePosition?: { x: number; y: number };
  /** 当前悬停的停靠热区 */
  hoveredZone?: DockZone;
}

/** 标签页拖拽信息 */
export interface TabDragInfo {
  /** 是否正在拖拽 */
  isDragging: boolean;
  /** 拖拽的标签页ID */
  draggedTabId?: string;
  /** 来源面板组ID */
  sourceGroupId?: string;
  /** 悬停的目标面板组ID */
  hoveredGroupId?: string;
  /** 插入位置索引 */
  insertIndex?: number;
}

// ===== 布局管理器配置 =====

/** 停靠管理器配置 */
export interface DockManagerConfig {
  /** 停靠热区尺寸 */
  hotZoneSize: number;
  /** 最小面板宽度 */
  minPanelWidth: number;
  /** 最小面板高度 */
  minPanelHeight: number;
}

/** 布局管理器完整配置 */
export interface LayoutManagerConfig {
  /** 管理器唯一标识 */
  managerId: string;
  /** 停靠管理器配置 */
  dockManagerConfig: DockManagerConfig;
  /** 停靠容器配置 */
  dockContainerConfig: DockContainerConfig;
  /** 悬浮面板组列表 */
  floatPanelGroupList: PanelGroup[];
}

/** 顶层配置数据结构 */
export interface LayoutConfig {
  layoutManagerConfig: LayoutManagerConfig;
}
