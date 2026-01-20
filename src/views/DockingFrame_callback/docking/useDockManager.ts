/**
 * 拖拽泊靠管理器 - 核心逻辑
 */

import { ref, computed, provide, inject, readonly } from 'vue';
import type {
  PanelGroup,
  PanelGroupConfig,
  DockPosition,
  DragInfo,
  TabDragInfo,
  DockZone,
  DockManagerConfig,
} from './types';

const DOCK_MANAGER_KEY = Symbol('DOCK_MANAGER');

export function useDockManager(config?: DockManagerConfig) {
  const hotZoneSize = config?.hotZoneSize ?? 50; // 热区大小
  const minPanelWidth = config?.minPanelWidth ?? 250; // 最小面板宽度
  const minPanelHeight = config?.minPanelHeight ?? 200; // 最小面板高度

  // 状态
  const panelGroups = ref<Map<string, PanelGroup>>(new Map()); // 面板组列表
  (window as any).panelGroups = panelGroups.value; // TODO 数据打印
  const dragInfo = ref<DragInfo | null>(null); // 拖拽信息
  const tabDragInfo = ref<TabDragInfo | null>(null); // 标签拖拽信息
  const hoveredZone = ref<DockZone | null>(null); // 悬停的区域
  const hoveredGroup = ref<string | null>(null); // 悬停的面板组ID
  const containerRect = ref<DOMRect | null>(null); // 容器矩形
  const maxZIndex = ref(1000); // 最大层级

  let containerElement: HTMLElement | null = null; // 容器元素

  // 注册容器
  function registerContainer(element: HTMLElement) {
    containerElement = element;
    updateContainerRect(); // 更新容器矩形
  }

  // 更新容器矩形
  function updateContainerRect() {
    if (containerElement) {
      containerRect.value = containerElement.getBoundingClientRect(); // 获取容器矩形
    }
  }

  // 添加面板组
  function addPanelGroup(config: PanelGroupConfig): PanelGroup {
    const groupId = config.id || `group-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    const tabId = `tab-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`; // 标签ID

    const width = config.width || minPanelWidth;
    const height = config.height || minPanelHeight;

    const group: PanelGroup = {
      id: groupId,
      tabs: [{
        id: tabId,
        title: config.title,
        icon: config.icon,
        closable: config.closable !== false,
      }],
      activeTabId: tabId,
      width,
      height,
      originalWidth: width, // 保存原始宽度
      originalHeight: height, // 保存原始高度
      x: 100,
      y: 100,
      zIndex: ++maxZIndex.value,
      state: config.defaultPosition && config.defaultPosition !== 'float' ? 'docked' : 'floating',
      position: config.defaultPosition || 'float',
      resizable: config.resizable !== false,
    };

    panelGroups.value.set(groupId, group);

    if (group.state === 'docked') {
      updateDockedLayout(group.position);
    }

    return group;
  }

  // 移除面板组
  function removePanelGroup(groupId: string) {
    const group = panelGroups.value.get(groupId);
    if (!group) return;

    const oldPosition = group.position; // 原来的停靠位置
    const wasDocked = group.state === 'docked'; // 是否是停靠状态

    panelGroups.value.delete(groupId);

    if (wasDocked && oldPosition !== 'float') { // 如果原来的位置不是浮动，则更新停靠布局
      updateDockedLayout(oldPosition);
    }
  }

  // 获取面板组
  function getPanelGroup(groupId: string): PanelGroup | undefined {
    return panelGroups.value.get(groupId);
  }

  // 开始拖拽面板组
  function startDragGroup(groupId: string, clientX: number, clientY: number) {
    const group = panelGroups.value.get(groupId);
    if (!group) return;

    group.zIndex = ++maxZIndex.value;

    const oldPosition = group.position;
    const wasDocked = group.state === 'docked';

    let offsetX = 0;
    let offsetY = 0;

    if (wasDocked) {
      // 获取当前元素位置和尺寸
      const element = document.querySelector(`[data-panel-group-id="${groupId}"]`);
      if (element) {
        const rect = element.getBoundingClientRect();
        const oldWidth = rect.width;
        const oldHeight = rect.height;
        
        // 计算鼠标在当前面板中的相对位置（百分比）
        const relativeX = (clientX - rect.left) / oldWidth;
        const relativeY = (clientY - rect.top) / oldHeight;
        
        // 恢复原始宽高
        const newWidth = group.originalWidth;
        const newHeight = group.originalHeight;
        
        // 根据相对位置计算新的 x, y 坐标，保持鼠标在面板中的相对位置不变
        group.x = clientX - (newWidth * relativeX);
        group.y = clientY - (newHeight * relativeY);
        group.width = newWidth;
        group.height = newHeight;
        
        // 计算偏移量（鼠标相对于面板左上角的距离）
        offsetX = newWidth * relativeX;
        offsetY = newHeight * relativeY;
      }
      
      group.state = 'floating';
      group.position = 'float';

      if (oldPosition !== 'float') {
        requestAnimationFrame(() => {
          updateDockedLayout(oldPosition);
        });
      }
    } else {
      // 浮动状态直接计算偏移
      offsetX = clientX - group.x;
      offsetY = clientY - group.y;
    }

    group.state = 'dragging';

    dragInfo.value = {
      groupId,
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      currentY: clientY,
      offsetX,
      offsetY,
    };

    updateContainerRect();
  }

  // 拖拽中
  function onDrag(clientX: number, clientY: number) {
    if (!dragInfo.value) return;

    const group = panelGroups.value.get(dragInfo.value.groupId);
    if (!group) return;

    dragInfo.value.currentX = clientX;
    dragInfo.value.currentY = clientY;

    group.x = clientX - dragInfo.value.offsetX;
    group.y = clientY - dragInfo.value.offsetY;

    // 检测是否悬停在其他组上（用于组合并）
    detectGroupHover(clientX, clientY);

    // 如果悬停在其他组上，清除停靠预览
    if (hoveredGroup.value && hoveredGroup.value !== dragInfo.value.groupId) {
      hoveredZone.value = null;
      return;
    }

    // 检测停靠区域
    const dockResult = detectDockZone(clientX, clientY);
    hoveredZone.value = dockResult; // 悬停的区域
  }

  // 结束拖拽
  function endDrag() {
    if (!dragInfo.value) return;

    const group = panelGroups.value.get(dragInfo.value.groupId);
    if (!group) {
      dragInfo.value = null;
      hoveredZone.value = null;
      hoveredGroup.value = null;
      return;
    }

    const oldPosition = group.position;
    const oldState = group.state;

    // 优先检测组合并
    if (hoveredGroup.value && hoveredGroup.value !== dragInfo.value.groupId) {
      mergeGroup(dragInfo.value.groupId, hoveredGroup.value);
      dragInfo.value = null;
      hoveredZone.value = null;
      hoveredGroup.value = null;
      return;
    }

    // 检测停靠区域
    const dockResult = detectDockZone(dragInfo.value.currentX, dragInfo.value.currentY);

    if (dockResult) {
      // 停靠前保存当前宽高作为原始宽高
      group.originalWidth = group.width;
      group.originalHeight = group.height;
      group.state = 'docked';
      group.position = dockResult.position;
      updateDockedLayout(dockResult.position);
    } else {
      group.state = 'floating';
      group.position = 'float';

      if (oldState === 'docked' && oldPosition !== 'float') {
        updateDockedLayout(oldPosition);
      }
    }

    dragInfo.value = null;
    hoveredZone.value = null;
    hoveredGroup.value = null;
  }

  // 开始拖拽标签
  function startDragTab(groupId: string, tabId: string, clientX: number, clientY: number) {
    const group = panelGroups.value.get(groupId);
    if (!group) return;

    const tab = group.tabs.find(t => t.id === tabId);
    if (!tab) return;

    // 如果只有一个标签，直接拖拽整个面板组（面板会跟随鼠标移动）
    if (group.tabs.length === 1) {
      startDragGroup(groupId, clientX, clientY);
      return;
    }

    // 多个标签时，走标签拖拽逻辑
    tabDragInfo.value = {
      groupId,
      tabId,
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      currentY: clientY,
    };
  }

  // 拖拽标签中
  function onDragTab(clientX: number, clientY: number) {
    if (!tabDragInfo.value) return;

    tabDragInfo.value.currentX = clientX;
    tabDragInfo.value.currentY = clientY;

    // 检测悬停的面板组
    detectTabHover(clientX, clientY);

    // 如果悬停在其他面板组上（准备合并tab），清除停靠预览
    if (tabDragInfo.value.hoveredGroupId && 
        tabDragInfo.value.hoveredGroupId !== tabDragInfo.value.groupId) {
      hoveredZone.value = null;
      return;
    }

    // 如果没有悬停在其他组上，检测容器边缘停靠区域
    const dockResult = detectDockZone(clientX, clientY);
    hoveredZone.value = dockResult;
  }

  // 结束拖拽标签
  function endDragTab() {
    if (!tabDragInfo.value) return;

    const { groupId, tabId, hoveredGroupId, insertIndex } = tabDragInfo.value;
    const sourceGroup = panelGroups.value.get(groupId);

    if (!sourceGroup) {
      tabDragInfo.value = null;
      hoveredZone.value = null;
      return;
    }

    // 情况1: 合并到其他面板组
    if (hoveredGroupId !== undefined && insertIndex !== undefined) {
      if (hoveredGroupId === groupId) {
        // 同一面板组内排序
        reorderTab(groupId, tabId, insertIndex);
      } else {
        // 合并到其他面板组
        mergeTab(groupId, tabId, hoveredGroupId, insertIndex);
      }
    } else if (sourceGroup.tabs.length > 1) {
      // 情况2: 拆分成新面板组（只有多个tab时才能拆分）
      const dockResult = detectDockZone(tabDragInfo.value.currentX, tabDragInfo.value.currentY);
      if (dockResult) {
        splitTabAndDock(groupId, tabId, dockResult.position);
      } else {
        splitTab(groupId, tabId, tabDragInfo.value.currentX, tabDragInfo.value.currentY);
      }
    }

    tabDragInfo.value = null;
    hoveredGroup.value = null;
    hoveredZone.value = null;
  }

  // 合并标签
  function mergeTab(sourceGroupId: string, tabId: string, targetGroupId: string, insertIndex?: number) {
    const sourceGroup = panelGroups.value.get(sourceGroupId); // 源面板组
    const targetGroup = panelGroups.value.get(targetGroupId); // 目标面板组

    if (!sourceGroup || !targetGroup) return;

    const tabIndex = sourceGroup.tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return;

    const tab = sourceGroup.tabs[tabIndex];
    sourceGroup.tabs.splice(tabIndex, 1); // 移除源面板组中的标签

    if (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= targetGroup.tabs.length) {
      targetGroup.tabs.splice(insertIndex, 0, tab);
    } else {
      targetGroup.tabs.push(tab); // 添加到目标面板组末尾
    }

    targetGroup.activeTabId = tabId; // 设置目标面板组激活标签

    if (sourceGroup.tabs.length === 0) {
      removePanelGroup(sourceGroupId);
    } else if (sourceGroup.activeTabId === tabId) {
      sourceGroup.activeTabId = sourceGroup.tabs[Math.min(tabIndex, sourceGroup.tabs.length - 1)].id; // 如果移除的是激活的标签，激活另一个
    }
  }

  // 合并面板组（将源组的所有标签合并到目标组）
  function mergeGroup(sourceGroupId: string, targetGroupId: string) {
    const sourceGroup = panelGroups.value.get(sourceGroupId);
    const targetGroup = panelGroups.value.get(targetGroupId);

    if (!sourceGroup || !targetGroup || sourceGroupId === targetGroupId) return;

    // 将源组的所有标签添加到目标组末尾
    targetGroup.tabs.push(...sourceGroup.tabs);

    // 激活源组的当前激活标签
    if (sourceGroup.activeTabId) {
      targetGroup.activeTabId = sourceGroup.activeTabId;
    }

    // 删除源组
    removePanelGroup(sourceGroupId);
  }

  // 重新排序标签
  function reorderTab(groupId: string, tabId: string, newIndex: number) {
    const group = panelGroups.value.get(groupId);
    if (!group) return;

    const currentIndex = group.tabs.findIndex(t => t.id === tabId);
    if (currentIndex === -1 || currentIndex === newIndex) return;

    const adjustedIndex = newIndex > currentIndex ? newIndex - 1 : newIndex;
    const [tab] = group.tabs.splice(currentIndex, 1);
    group.tabs.splice(adjustedIndex, 0, tab);
  }

  // 拆分标签
  function splitTab(sourceGroupId: string, tabId: string, x: number, y: number) {
    const sourceGroup = panelGroups.value.get(sourceGroupId);
    if (!sourceGroup) return;

    const tabIndex = sourceGroup.tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return;

    const tab = sourceGroup.tabs[tabIndex];
    sourceGroup.tabs.splice(tabIndex, 1);

    // 使用源组的原始宽高
    const width = sourceGroup.originalWidth;
    const height = sourceGroup.originalHeight;

    const newGroup: PanelGroup = {
      id: `group-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      tabs: [tab],
      activeTabId: tab.id,
      width,
      height,
      originalWidth: width,
      originalHeight: height,
      x: x - 100,
      y: y - 20,
      zIndex: ++maxZIndex.value,
      state: 'floating',
      position: 'float',
      resizable: sourceGroup.resizable,
    };

    panelGroups.value.set(newGroup.id, newGroup);

    if (sourceGroup.activeTabId === tabId && sourceGroup.tabs.length > 0) {
      sourceGroup.activeTabId = sourceGroup.tabs[Math.min(tabIndex, sourceGroup.tabs.length - 1)].id;
    }
  }

  // 拆分并停靠
  function splitTabAndDock(sourceGroupId: string, tabId: string, position: DockPosition) {
    const sourceGroup = panelGroups.value.get(sourceGroupId);
    if (!sourceGroup) return;

    const tabIndex = sourceGroup.tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return;

    const tab = sourceGroup.tabs[tabIndex];
    sourceGroup.tabs.splice(tabIndex, 1);

    // 使用源组的原始宽高
    const width = sourceGroup.originalWidth;
    const height = sourceGroup.originalHeight;

    const newGroup: PanelGroup = {
      id: `group-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      tabs: [tab],
      activeTabId: tab.id,
      width,
      height,
      originalWidth: width,
      originalHeight: height,
      x: 0,
      y: 0,
      zIndex: ++maxZIndex.value,
      state: 'docked',
      position,
      resizable: sourceGroup.resizable,
    };

    panelGroups.value.set(newGroup.id, newGroup);
    updateDockedLayout(position);

    if (sourceGroup.activeTabId === tabId && sourceGroup.tabs.length > 0) {
      sourceGroup.activeTabId = sourceGroup.tabs[Math.min(tabIndex, sourceGroup.tabs.length - 1)].id;
    }
  }

  // 设置激活标签
  function setActiveTab(groupId: string, tabId: string) {
    const group = panelGroups.value.get(groupId);
    if (group && group.tabs.find(t => t.id === tabId)) {
      group.activeTabId = tabId;
    }
  }

  // 关闭标签
  function closeTab(groupId: string, tabId: string) {
    const group = panelGroups.value.get(groupId);
    if (!group) return;

    const tabIndex = group.tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1 || group.tabs.length <= 1) return;

    group.tabs.splice(tabIndex, 1);

    if (group.activeTabId === tabId) {
      group.activeTabId = group.tabs[Math.min(tabIndex, group.tabs.length - 1)].id;
    }
  }

  // 调整大小
  function resizePanelGroup(groupId: string, width: number, height: number) {
    const group = panelGroups.value.get(groupId);
    if (!group) return;

    group.width = Math.max(width, minPanelWidth);
    group.height = Math.max(height, minPanelHeight);

    // 如果是浮动状态，同时更新原始宽高
    if (group.state === 'floating' || group.state === 'dragging') {
      group.originalWidth = group.width;
      group.originalHeight = group.height;
    }
  }

  // 检测停靠区域
  function detectDockZone(mouseX: number, mouseY: number): DockZone | null {
    if (!containerRect.value) return null;

    const rect = containerRect.value;

    // 检测边缘
    if (mouseX - rect.left < hotZoneSize) {
      return {
        position: 'left',
        rect: new DOMRect(rect.left, rect.top, 50, rect.height), // 左边缘停靠区域
      };
    }
    if (rect.right - mouseX < hotZoneSize) {
      return {
        position: 'right',
        rect: new DOMRect(rect.right - 50, rect.top, 50, rect.height), // 右边缘停靠区域
      };
    }
    if (mouseY - rect.top < hotZoneSize) {
      return {
        position: 'top',
        rect: new DOMRect(rect.left, rect.top, rect.width, 50), // 上边缘停靠区域
      };
    }
    if (rect.bottom - mouseY < hotZoneSize) {
      return {
        position: 'bottom',
        rect: new DOMRect(rect.left, rect.bottom - 50, rect.width, 50),
      };
    }

    return null;
  }

  // 检测组悬停（用于组合并）
  function detectGroupHover(clientX: number, clientY: number) {
    hoveredGroup.value = null;

    if (!dragInfo.value) return;

    // 按 zIndex 从高到低排序，优先检测最上层的面板
    const sortedGroups = Array.from(panelGroups.value.entries()).sort(
      ([, a], [, b]) => b.zIndex - a.zIndex
    );

    const tabsHeaderHeight = 36;

    for (const [id] of sortedGroups) {
      // 不检测自己
      if (id === dragInfo.value.groupId) continue;

      const element = document.querySelector(`[data-panel-group-id="${id}"]`);
      if (!element) continue;

      const rect = element.getBoundingClientRect();

      // 检测是否悬停在标签栏区域
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.top + tabsHeaderHeight
      ) {
        hoveredGroup.value = id;
        break;
      }
    }
  }

  // 检测标签悬停
  function detectTabHover(clientX: number, clientY: number) {
    hoveredGroup.value = null;

    if (!tabDragInfo.value) return;

    // 按 zIndex 从高到低排序，优先检测最上层的面板
    const sortedGroups = Array.from(panelGroups.value.entries()).sort(
      ([, a], [, b]) => b.zIndex - a.zIndex
    );

    const tabsHeaderHeight = 36;

    for (const [id, group] of sortedGroups) {
      const element = document.querySelector(`[data-panel-group-id="${id}"]`);
      if (!element) continue;

      const rect = element.getBoundingClientRect();
      
      // 检测是否悬停在标签栏区域
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.top + tabsHeaderHeight
      ) {
        hoveredGroup.value = id;

        const tabsContainer = element.querySelector('.panel-tabs-container');
        if (tabsContainer) {
          const tabs = tabsContainer.querySelectorAll('.panel-tab');
          let insertIndex = group.tabs.length; // 默认插入到末尾

          for (let i = 0; i < tabs.length; i++) {
            const tabElement = tabs[i] as HTMLElement;
            const tabRect = tabElement.getBoundingClientRect();
            const tabMidpoint = tabRect.left + tabRect.width / 2;

            // 距离那个tab间距近一些(更新插入位置)
            if (clientX < tabMidpoint) {
              insertIndex = i;
              break;
            }
          }

          // 如果同一面板组内拖拽，则排除无效位置
          // 例如：拖动 tab1(index=0) 到 index=0 或 index=1 都是无意义的
          if (id === tabDragInfo.value.groupId) {
            const sourceTabIndex = group.tabs.findIndex(t => t.id === tabDragInfo.value?.tabId);
            if (sourceTabIndex !== -1 && (insertIndex === sourceTabIndex || insertIndex === sourceTabIndex + 1)) {
              tabDragInfo.value.hoveredGroupId = id;
              tabDragInfo.value.insertIndex = undefined;
              break;
            }
          }

          // if (id === tabDragInfo.value.groupId && group.tabs.length === 1) {
          //   continue;
          // }

          tabDragInfo.value.hoveredGroupId = id;
          tabDragInfo.value.insertIndex = insertIndex;
        }
        break;
      }
    }

    if (!hoveredGroup.value && tabDragInfo.value) {
      tabDragInfo.value.hoveredGroupId = undefined;
      tabDragInfo.value.insertIndex = undefined;
    }
  }

  // 更新停靠布局
  function updateDockedLayout(position: DockPosition) {
    if (!containerRect.value || position === 'float') return;

    const rect = containerRect.value;
    const groups = Array.from(panelGroups.value.values()).filter(
      g => g.state === 'docked' && g.position === position
    );

    if (groups.length === 0) return;

    if (position === 'left' || position === 'right') {
      const heightPerGroup = rect.height / groups.length;
      groups.forEach(g => {
        g.height = heightPerGroup;
      });
    } else {
      const widthPerGroup = rect.width / groups.length;
      groups.forEach(g => {
        g.width = widthPerGroup;
      });
    }
  }

  // 激活面板组
  function activatePanelGroup(groupId: string) {
    const group = panelGroups.value.get(groupId);
    if (group) {
      group.zIndex = ++maxZIndex.value;
    }
  }

  const panelGroupList = computed(() => {
    return Array.from(panelGroups.value.values()).sort((a, b) => a.zIndex - b.zIndex);
  });

  const manager = {
    panelGroupList,
    dragInfo: readonly(dragInfo),
    tabDragInfo: readonly(tabDragInfo),
    hoveredZone: readonly(hoveredZone),
    hoveredGroup: readonly(hoveredGroup),

    registerContainer,
    updateContainerRect,
    addPanelGroup,
    removePanelGroup,
    getPanelGroup,
    startDragGroup,
    onDrag,
    endDrag,
    startDragTab,
    onDragTab,
    endDragTab,
    setActiveTab,
    closeTab,
    resizePanelGroup,
    activatePanelGroup,
    updateDockedLayout,
  };

  provide(DOCK_MANAGER_KEY, manager);

  return manager;
}

export function injectDockManager() {
  const manager = inject<ReturnType<typeof useDockManager>>(DOCK_MANAGER_KEY);
  if (!manager) {
    throw new Error('DockManager not provided');
  }
  return manager;
}
