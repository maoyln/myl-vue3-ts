/**
 * 面板管理器 - 核心逻辑
 * 实现热区识别、拖拽调整、层级管理、标签页跨组拖拽等功能
 */

import { ref, computed } from 'vue';
import type {
  LayoutManagerConfig,
  PanelGroup,
  DockZone,
  TabDragInfo,
  DragInfo,
  DockPosition,
  DockGroup,
  DockPanel
} from './types';

export interface PanelManagerOptions {
  /** 热区大小 */
  hotZoneSize?: number;
  /** 最小面板宽度 */
  minPanelWidth?: number;
  /** 最小面板高度 */
  minPanelHeight?: number;
}

export function usePanelManager(options?: PanelManagerOptions) {
  const hotZoneSize = options?.hotZoneSize ?? 80;
  const minPanelWidth = options?.minPanelWidth ?? 200;
  const minPanelHeight = options?.minPanelHeight ?? 150;

  // ========== 状态管理 ==========
  
  const layoutConfig = ref<LayoutManagerConfig | null>(null);
  const containerRect = ref<DOMRect | null>(null);
  const maxZIndex = ref(1000);
  
  // 拖拽相关状态
  const dragInfo = ref<DragInfo | null>(null);
  const tabDragInfo = ref<TabDragInfo | null>(null);
  const hoveredZone = ref<DockZone>('none');
  const hoveredGroupId = ref<string | null>(null);
  
  // 占比调整相关
  const resizingGroupId = ref<string | null>(null);
  const resizingPanelId = ref<string | null>(null);

  // ========== 容器管理 ==========
  
  let containerElement: HTMLElement | null = null;

  function registerContainer(element: HTMLElement) {
    containerElement = element;
    updateContainerRect();
    
    // 监听窗口大小变化
    window.addEventListener('resize', updateContainerRect);
  }

  function unregisterContainer() {
    window.removeEventListener('resize', updateContainerRect);
    containerElement = null;
  }

  function updateContainerRect() {
    if (containerElement) {
      containerRect.value = containerElement.getBoundingClientRect();
    }
  }

  // ========== 热区检测 ==========
  
  /**
   * 检测鼠标位置对应的停靠热区
   */
  function detectDockZone(mouseX: number, mouseY: number): DockZone {
    if (!containerRect.value) return 'none';

    const rect = containerRect.value;
    const relX = mouseX - rect.left;
    const relY = mouseY - rect.top;

    // 检测边缘热区
    if (relX < hotZoneSize) return 'left';
    if (relX > rect.width - hotZoneSize) return 'right';
    if (relY < hotZoneSize) return 'top';
    if (relY > rect.height - hotZoneSize) return 'bottom';

    // 检测中心区域（用于合并到现有停靠面板）
    // 如果当前有停靠容器，检测是否悬停在停靠容器上
    if (layoutConfig.value?.dockContainerConfig) {
      const dockConfig = layoutConfig.value.dockContainerConfig;
      const dockRect = getDockContainerRect(dockConfig.dockPosition);
      
      if (dockRect && isPointInRect(mouseX, mouseY, dockRect)) {
        return 'center';
      }
    }

    return 'none';
  }

  /**
   * 获取停靠容器的矩形区域
   */
  function getDockContainerRect(position: Exclude<DockPosition, 'float'>): DOMRect | null {
    if (!containerElement) return null;
    
    const dockContainer = containerElement.querySelector(`[data-dock-position="${position}"]`) as HTMLElement;
    return dockContainer ? dockContainer.getBoundingClientRect() : null;
  }

  /**
   * 判断点是否在矩形内
   */
  function isPointInRect(x: number, y: number, rect: DOMRect): boolean {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  /**
   * 获取热区预览矩形（用于视觉提示）
   */
  function getHotZonePreviewRect(zone: DockZone): { left: string; top: string; width: string; height: string } | null {
    if (!containerRect.value || zone === 'none') return null;

    const rect = containerRect.value;
    const previewSize = 0.3; // 预览区域占容器的30%

    switch (zone) {
      case 'left':
        return {
          left: '0',
          top: '0',
          width: `${previewSize * 100}%`,
          height: '100%'
        };
      case 'right':
        return {
          left: `${(1 - previewSize) * 100}%`,
          top: '0',
          width: `${previewSize * 100}%`,
          height: '100%'
        };
      case 'top':
        return {
          left: '0',
          top: '0',
          width: '100%',
          height: `${previewSize * 100}%`
        };
      case 'bottom':
        return {
          left: '0',
          top: `${(1 - previewSize) * 100}%`,
          width: '100%',
          height: `${previewSize * 100}%`
        };
      case 'center':
        return {
          left: '25%',
          top: '25%',
          width: '50%',
          height: '50%'
        };
      default:
        return null;
    }
  }

  // ========== 悬浮面板层级管理 ==========
  
  /**
   * 提升悬浮面板到最前面
   */
  function bringToFront(groupId: string) {
    if (!layoutConfig.value) return;
    
    const panelGroup = layoutConfig.value.floatPanelGroupList.find(g => g.id === groupId);
    if (!panelGroup) return;
    
    const currentMax = Math.max(...layoutConfig.value.floatPanelGroupList.map(g => g.zIndex));
    if (panelGroup.zIndex < currentMax) {
      panelGroup.zIndex = currentMax + 1;
      maxZIndex.value = Math.max(maxZIndex.value, panelGroup.zIndex);
    }
  }

  /**
   * 调整 zIndex（用于层级控制按钮）
   */
  function adjustZIndex(groupId: string, direction: 'forward' | 'backward') {
    if (!layoutConfig.value) return;
    
    const groups = layoutConfig.value.floatPanelGroupList;
    const index = groups.findIndex(g => g.id === groupId);
    if (index === -1) return;

    const currentGroup = groups[index];
    
    if (direction === 'forward') {
      // 前移一层：与上一个交换 zIndex
      const higher = groups.filter(g => g.zIndex > currentGroup.zIndex).sort((a, b) => a.zIndex - b.zIndex);
      if (higher.length > 0) {
        const temp = currentGroup.zIndex;
        currentGroup.zIndex = higher[0].zIndex;
        higher[0].zIndex = temp;
      }
    } else {
      // 后移一层：与下一个交换 zIndex
      const lower = groups.filter(g => g.zIndex < currentGroup.zIndex).sort((a, b) => b.zIndex - a.zIndex);
      if (lower.length > 0) {
        const temp = currentGroup.zIndex;
        currentGroup.zIndex = lower[0].zIndex;
        lower[0].zIndex = temp;
      }
    }
  }

  // ========== 标签页拖拽 ==========
  
  /**
   * 开始拖拽标签页
   */
  function startDragTab(groupId: string, tabId: string, clientX: number, clientY: number) {
    tabDragInfo.value = {
      isDragging: true,
      draggedTabId: tabId,
      sourceGroupId: groupId,
      hoveredGroupId: null,
      insertIndex: undefined
    };
  }

  /**
   * 标签页拖拽中
   */
  function onDragTab(clientX: number, clientY: number) {
    if (!tabDragInfo.value || !layoutConfig.value) return;

    // 检测悬停的目标面板组
    const targetGroup = detectHoveredGroup(clientX, clientY);
    
    if (targetGroup) {
      tabDragInfo.value.hoveredGroupId = targetGroup.id;
      
      // 计算插入位置
      const insertIndex = calculateTabInsertIndex(targetGroup.id, clientX, clientY);
      tabDragInfo.value.insertIndex = insertIndex;
    } else {
      tabDragInfo.value.hoveredGroupId = null;
      tabDragInfo.value.insertIndex = undefined;
    }
  }

  /**
   * 结束标签页拖拽
   */
  function endDragTab() {
    if (!tabDragInfo.value || !layoutConfig.value) return;

    const { draggedTabId, sourceGroupId, hoveredGroupId, insertIndex } = tabDragInfo.value;
    
    if (hoveredGroupId && sourceGroupId !== hoveredGroupId && draggedTabId) {
      // 跨组移动标签页
      moveTabBetweenGroups(sourceGroupId, hoveredGroupId, draggedTabId, insertIndex);
    }

    tabDragInfo.value = null;
  }

  /**
   * 检测鼠标悬停的面板组
   */
  function detectHoveredGroup(mouseX: number, mouseY: number): PanelGroup | null {
    if (!layoutConfig.value) return null;

    // 检测悬浮面板
    for (const group of layoutConfig.value.floatPanelGroupList) {
      if (isPointInPanelGroup(mouseX, mouseY, group)) {
        return group;
      }
    }

    return null;
  }

  /**
   * 判断点是否在面板组内
   */
  function isPointInPanelGroup(x: number, y: number, group: PanelGroup): boolean {
    return (
      x >= group.x &&
      x <= group.x + group.width &&
      y >= group.y &&
      y <= group.y + group.height
    );
  }

  /**
   * 计算标签页插入位置
   */
  function calculateTabInsertIndex(groupId: string, mouseX: number, mouseY: number): number {
    const groupElement = document.querySelector(`[data-panel-group-id="${groupId}"]`);
    if (!groupElement) return 0;

    const tabsContainer = groupElement.querySelector('.panel-tabs');
    if (!tabsContainer) return 0;

    const tabs = Array.from(tabsContainer.querySelectorAll('.tab-item'));
    
    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i] as HTMLElement;
      const rect = tab.getBoundingClientRect();
      const midX = rect.left + rect.width / 2;
      
      if (mouseX < midX) {
        return i;
      }
    }

    return tabs.length;
  }

  /**
   * 在面板组之间移动标签页
   */
  function moveTabBetweenGroups(
    sourceGroupId: string,
    targetGroupId: string,
    tabId: string,
    insertIndex?: number
  ) {
    if (!layoutConfig.value) return;

    // 找到源面板组和目标面板组
    const sourceGroup = layoutConfig.value.floatPanelGroupList.find(g => g.id === sourceGroupId);
    const targetGroup = layoutConfig.value.floatPanelGroupList.find(g => g.id === targetGroupId);

    if (!sourceGroup || !targetGroup) return;

    // 从源面板组移除标签页
    const tabIndex = sourceGroup.tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return;

    const [tab] = sourceGroup.tabs.splice(tabIndex, 1);

    // 添加到目标面板组
    const targetIndex = insertIndex ?? targetGroup.tabs.length;
    targetGroup.tabs.splice(targetIndex, 0, tab);

    // 更新激活标签
    if (sourceGroup.activeTabId === tabId) {
      sourceGroup.activeTabId = sourceGroup.tabs[0]?.id || '';
    }
    
    targetGroup.activeTabId = tabId;

    // 如果源面板组没有标签了，删除它
    if (sourceGroup.tabs.length === 0) {
      const index = layoutConfig.value.floatPanelGroupList.findIndex(g => g.id === sourceGroupId);
      if (index !== -1) {
        layoutConfig.value.floatPanelGroupList.splice(index, 1);
      }
    }
  }

  // ========== 面板合并/拆分 ==========
  
  /**
   * 合并两个悬浮面板
   */
  function mergePanelGroups(sourceGroupId: string, targetGroupId: string) {
    if (!layoutConfig.value) return;

    const sourceGroup = layoutConfig.value.floatPanelGroupList.find(g => g.id === sourceGroupId);
    const targetGroup = layoutConfig.value.floatPanelGroupList.find(g => g.id === targetGroupId);

    if (!sourceGroup || !targetGroup || sourceGroup === targetGroup) return;

    // 将源面板的所有标签页移动到目标面板
    targetGroup.tabs.push(...sourceGroup.tabs);

    // 删除源面板
    const index = layoutConfig.value.floatPanelGroupList.findIndex(g => g.id === sourceGroupId);
    if (index !== -1) {
      layoutConfig.value.floatPanelGroupList.splice(index, 1);
    }
  }

  /**
   * 从面板组中拆分标签页为新面板
   */
  function splitTabToNewPanel(groupId: string, tabId: string, x: number, y: number) {
    if (!layoutConfig.value) return;

    const sourceGroup = layoutConfig.value.floatPanelGroupList.find(g => g.id === groupId);
    if (!sourceGroup) return;

    const tabIndex = sourceGroup.tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return;

    const [tab] = sourceGroup.tabs.splice(tabIndex, 1);

    // 创建新面板
    const newGroup: PanelGroup = {
      id: `panel_${Date.now()}`,
      title: tab.title,
      icon: tab.icon,
      tabs: [tab],
      activeTabId: tab.id,
      width: sourceGroup.width,
      height: sourceGroup.height,
      originalWidth: sourceGroup.originalWidth,
      originalHeight: sourceGroup.originalHeight,
      x: x,
      y: y,
      zIndex: ++maxZIndex.value,
      state: 'floating',
      position: 'float',
      resizable: true,
      closable: true
    };

    layoutConfig.value.floatPanelGroupList.push(newGroup);

    // 更新源面板的激活标签
    if (sourceGroup.activeTabId === tabId) {
      sourceGroup.activeTabId = sourceGroup.tabs[0]?.id || '';
    }

    // 如果源面板没有标签了，删除它
    if (sourceGroup.tabs.length === 0) {
      const index = layoutConfig.value.floatPanelGroupList.findIndex(g => g.id === groupId);
      if (index !== -1) {
        layoutConfig.value.floatPanelGroupList.splice(index, 1);
      }
    }

    return newGroup.id;
  }

  // ========== 占比动态调整 ==========
  
  /**
   * 开始调整分组占比
   */
  function startResizeGroup(groupId: string) {
    resizingGroupId.value = groupId;
  }

  /**
   * 调整分组占比
   */
  function resizeGroup(groupId: string, newRatio: number) {
    if (!layoutConfig.value?.dockContainerConfig) return;

    const group = layoutConfig.value.dockContainerConfig.groupList.find(g => g.groupId === groupId);
    if (!group) return;

    // 限制占比范围 0.1 ~ 0.9
    group.groupRatio = Math.max(0.1, Math.min(0.9, newRatio));
    
    // 重新计算其他分组的占比
    normalizeGroupRatios();
  }

  /**
   * 开始调整面板占比
   */
  function startResizePanel(panelId: string) {
    resizingPanelId.value = panelId;
  }

  /**
   * 调整面板占比
   */
  function resizePanel(groupId: string, panelId: string, newRatio: number) {
    if (!layoutConfig.value?.dockContainerConfig) return;

    const group = layoutConfig.value.dockContainerConfig.groupList.find(g => g.groupId === groupId);
    if (!group) return;

    const panel = group.panelList.find(p => p.panelId === panelId);
    if (!panel) return;

    // 限制占比范围 0.1 ~ 0.9
    panel.panelRatio = Math.max(0.1, Math.min(0.9, newRatio));
    
    // 重新计算同组其他面板的占比
    normalizePanelRatios(groupId);
  }

  /**
   * 归一化分组占比（确保总和为1）
   */
  function normalizeGroupRatios() {
    if (!layoutConfig.value?.dockContainerConfig) return;

    const groups = layoutConfig.value.dockContainerConfig.groupList;
    const total = groups.reduce((sum, g) => sum + g.groupRatio, 0);
    
    if (total > 0) {
      groups.forEach(g => {
        g.groupRatio = g.groupRatio / total;
      });
    }
  }

  /**
   * 归一化面板占比（确保总和为1）
   */
  function normalizePanelRatios(groupId: string) {
    if (!layoutConfig.value?.dockContainerConfig) return;

    const group = layoutConfig.value.dockContainerConfig.groupList.find(g => g.groupId === groupId);
    if (!group) return;

    const total = group.panelList.reduce((sum, p) => sum + p.panelRatio, 0);
    
    if (total > 0) {
      group.panelList.forEach(p => {
        p.panelRatio = p.panelRatio / total;
      });
    }
  }

  /**
   * 结束调整
   */
  function endResize() {
    resizingGroupId.value = null;
    resizingPanelId.value = null;
  }

  // ========== 导出 ==========
  
  return {
    // 状态
    layoutConfig,
    containerRect,
    dragInfo,
    tabDragInfo,
    hoveredZone: computed(() => hoveredZone.value),
    hoveredGroupId: computed(() => hoveredGroupId.value),
    resizingGroupId: computed(() => resizingGroupId.value),
    resizingPanelId: computed(() => resizingPanelId.value),
    
    // 容器管理
    registerContainer,
    unregisterContainer,
    updateContainerRect,
    
    // 热区检测
    detectDockZone,
    getHotZonePreviewRect,
    
    // 层级管理
    bringToFront,
    adjustZIndex,
    
    // 标签页拖拽
    startDragTab,
    onDragTab,
    endDragTab,
    
    // 面板合并/拆分
    mergePanelGroups,
    splitTabToNewPanel,
    
    // 占比调整
    startResizeGroup,
    resizeGroup,
    startResizePanel,
    resizePanel,
    endResize,
  };
}
