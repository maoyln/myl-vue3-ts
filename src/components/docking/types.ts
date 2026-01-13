/**
 * 停泊吸附系统类型定义
 */

// 停靠位置
export type DockPosition = 'left' | 'right' | 'top' | 'bottom' | 'center' | 'float';

// 面板状态
export type PanelState = 'docked' | 'floating' | 'dragging';

// 吸附区域
export interface DockZone {
  position: DockPosition;
  rect: DOMRect;
  element?: HTMLElement;
}

// 面板配置
export interface PanelConfig {
  id: string;
  title: string;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  defaultPosition?: DockPosition;
  closable?: boolean;
  resizable?: boolean;
}

// 面板实例
export interface PanelInstance extends PanelConfig {
  state: PanelState;
  position: DockPosition;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  dockedWith?: string; // 停靠在哪个面板上
  dockedPanels?: string[]; // 停靠在自己上的面板
}

// 拖拽信息
export interface DragInfo {
  panelId: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  offsetX: number;
  offsetY: number;
}

// 吸附检测结果
export interface SnapResult {
  shouldSnap: boolean;
  position?: DockPosition;
  targetPanelId?: string; // 吸附到哪个面板
  targetRect?: DOMRect;
}

// 停靠管理器配置
export interface DockManagerConfig {
  snapThreshold?: number; // 吸附阈值（像素）
  hotZoneSize?: number; // 热区大小（像素）
  minPanelWidth?: number;
  minPanelHeight?: number;
  maxPanels?: number;
}
