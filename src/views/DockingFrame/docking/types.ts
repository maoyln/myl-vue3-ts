/**
 * 拖拽泊靠系统 - 类型定义
 */

// 停靠位置
export type DockPosition = 'left' | 'right' | 'top' | 'bottom' | 'float'; // 停靠位置

// 面板状态
export type PanelState = 'docked' | 'floating' | 'dragging'; // 面板状态

// 标签页
export interface TabItem {
  id: string; // 标签页ID
  title: string; // 标签页标题
  icon?: string; // 标签页图标
  closable?: boolean; // 是否可关闭
}

// 面板组配置
export interface PanelGroupConfig {
  id?: string; // 面板组ID
  title: string; // 面板组标题
  icon?: string; // 面板组图标
  width?: number; // 面板组宽度
  height?: number; // 面板组高度
  defaultPosition?: DockPosition; // 默认停靠位置
  closable?: boolean; // 是否可关闭
  resizable?: boolean; // 是否可调整大小
}

// 面板组实例
export interface PanelGroup {
  id: string; // 面板组ID
  tabs: TabItem[]; // 标签页列表
  activeTabId: string; // 当前激活的标签页ID
  width: number; // 面板组宽度
  height: number; // 面板组高度
  x: number; // 面板组x坐标
  y: number; // 面板组y坐标
  zIndex: number; // 面板组层级
  state: PanelState; // 面板状态
  position: DockPosition; // 停靠位置
  resizable?: boolean; // 是否可调整大小
}

// 拖拽信息
export interface DragInfo {
  groupId: string; // 面板组ID
  startX: number; // 开始x坐标
  startY: number; // 开始y坐标
  currentX: number; // 当前x坐标
  currentY: number; // 当前y坐标
  offsetX: number; // 偏移量x
  offsetY: number; // 偏移量y
}

// 标签拖拽信息
export interface TabDragInfo {
  groupId: string; // 面板组ID
  tabId: string; // 标签页ID
  startX: number;
  startY: number; // 开始y坐标
  currentX: number; // 当前x坐标
  currentY: number; // 当前y坐标
  hoveredGroupId?: string; // 悬停的面板组ID
  insertIndex?: number; // 插入位置索引
}

// 停靠区域
export interface DockZone {
  position: DockPosition; // 停靠位置
  rect: DOMRect; // 位置及大小信息
}

// 管理器配置
export interface DockManagerConfig {
  hotZoneSize?: number; // 热区大小
  minPanelWidth?: number; // 最小面板宽度
  minPanelHeight?: number; // 最小面板高度
}
