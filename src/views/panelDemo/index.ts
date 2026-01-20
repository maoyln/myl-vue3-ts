/**
 * PhotoShow 面板组合布局系统 - 统一导出
 */

// 组件导出
export { default as TabItemComponent } from './TabItemComponent.vue';
export { default as PanelGroupComponent } from './PanelGroupComponent.vue';
export { default as PanelContainer } from './PanelContainer.vue';
export { default as LayoutManagerComponent } from './LayoutManagerComponent.vue';
export { default as DockingPanel } from './DockingPanel.vue';

// 类型导出
export type {
  // 基础类型
  DockPosition,
  PanelState,
  DefaultState,
  
  // Tab 标签项
  TabItem,
  
  // 停靠容器相关
  ContainerSize,
  PanelConfig,
  DockPanel,
  GroupConfig,
  DockGroup,
  DockContainerConfig,
  
  // 悬浮面板相关
  PanelGroup,
  
  // 拖拽相关
  DockZone,
  DragInfo,
  TabDragInfo,
  
  // 布局管理器
  DockManagerConfig,
  LayoutManagerConfig,
  LayoutConfig
} from './types';

// 配置数据导出
export {
  config1_RightDockWithFloat,
  config2_BottomDock,
  config3_LeftDockWithMultiFloat,
  config4_ComplexLayout,
  configList
} from './configs';
