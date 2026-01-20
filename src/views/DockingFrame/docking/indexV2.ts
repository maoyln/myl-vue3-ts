/**
 * 三级面板结构 V2 - 导出文件
 */

// 类型定义
export * from './typesV2';

// V2 组件
export { default as DockManagerProviderV2 } from './DockManagerProviderV2.vue';
export { default as DockManagerV2 } from './DockManagerV2.vue';
export { default as DockLayoutContainerV2 } from './DockLayoutContainerV2.vue';
export { default as PanelGroupContainerV2 } from './PanelGroupContainerV2.vue';

// 原有组件（作为第三级使用）
export { default as DockablePanelGroup } from './DockablePanelGroup.vue';

// 原有工具
export { useDockManager } from './useDockManager';
export { injectDockManager } from './useDockManager';
