/**
 * 三级面板结构类型定义 V2
 * 第一级：DockLayoutContainer（布局容器）
 * 第二级：PanelGroupContainer（面板组容器）
 * 第三级：DockablePanelGroup（面板组）
 */

// ========== 基础类型 ==========

// 停靠位置
export type DockPosition = 'left' | 'right' | 'top' | 'bottom' | 'float';

// 面板状态
export type PanelState = 'docked' | 'floating' | 'dragging';

// 布局方向
export type LayoutDirection = 'horizontal' | 'vertical';

// 标签页
export interface TabItem {
  id: string;
  title: string;
  icon?: string;
  closable?: boolean;
}

// ========== 第三级：面板组（DockablePanelGroup）==========

export interface PanelGroupV2 {
  id: string;
  tabs: TabItem[];
  activeTabId: string;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  x: number;
  y: number;
  zIndex: number;
  state: PanelState;
  position: DockPosition;
  resizable?: boolean;
  
  // 新增：在分组中的占比
  panelRatio?: number;  // 0~1，在 PanelGroupContainer 中的占比
}

// ========== 第二级：面板组容器 ==========

export interface PanelGroupContainer {
  id: string;
  groupRatio: number;  // 0~1，在 DockLayoutContainer 中的占比
  direction: LayoutDirection;  // 内部面板排列方向
  resizable: boolean;
  minRatio: number;  // 最小占比，默认 0.1
  panels: PanelGroupV2[];
}

// ========== 第一级：布局容器 ==========

export interface DockLayoutContainer {
  id: string;
  position: DockPosition;
  width: number;
  height: number;
  x?: number;  // 悬浮时的坐标
  y?: number;
  zIndex?: number;  // 悬浮时的层级
  resizable: boolean;
  minWidth: number;
  minHeight: number;
  groups: PanelGroupContainer[];
}

// ========== 拖拽相关 ==========

// 拖拽信息
export interface DragInfo {
  type: 'panel' | 'tab' | 'container';  // 拖拽类型
  sourceId: string;  // 源ID
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  offsetX: number;
  offsetY: number;
  sourceContainerId?: string;  // 源容器ID
  sourceGroupId?: string;  // 源分组ID
}

// 标签拖拽信息
export interface TabDragInfo {
  tabId: string;
  sourceGroupId: string;
  sourcePanelId: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  hoveredPanelId?: string;
  hoveredGroupId?: string;
  insertIndex?: number;
}

// 停靠热区
export interface DockZone {
  type: 'edge' | 'container' | 'group' | 'panel';  // 热区类型
  position: DockPosition;
  targetId?: string;  // 目标ID（容器/分组/面板）
  rect?: DOMRect;
  insertIndex?: number;  // 插入位置
}

// ========== 调整大小相关 ==========

// 调整手柄方向
export type ResizeDirection = 'horizontal' | 'vertical';

// 调整信息
export interface ResizeInfo {
  type: 'container' | 'group' | 'panel';
  targetId: string;
  direction: ResizeDirection;
  startSize: number;
  startPos: number;
  minSize: number;
  maxSize: number;
}

// ========== 管理器配置 ==========

export interface DockManagerV2Config {
  hotZoneSize: number;  // 热区大小，默认 80px
  minPanelWidth: number;  // 最小面板宽度，默认 200px
  minPanelHeight: number;  // 最小面板高度，默认 150px
  minGroupRatio: number;  // 最小分组占比，默认 0.1
  minPanelRatio: number;  // 最小面板占比，默认 0.1
  snapThreshold: number;  // 吸附阈值，默认 20px
}

// ========== 整体布局配置 ==========

export interface DockLayoutConfig {
  containers: DockLayoutContainer[];
  config: DockManagerV2Config;
}

// ========== 事件 ==========

// 面板事件
export interface PanelEvent {
  type: 'drag' | 'resize' | 'close' | 'merge' | 'split';
  panelId: string;
  data?: any;
}

// 分组事件
export interface GroupEvent {
  type: 'resize' | 'add' | 'remove' | 'reorder';
  groupId: string;
  data?: any;
}

// 容器事件
export interface ContainerEvent {
  type: 'drag' | 'resize' | 'dock' | 'undock';
  containerId: string;
  data?: any;
}
