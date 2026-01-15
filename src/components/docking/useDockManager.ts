/**
 * 停泊管理器 Composable
 * 核心逻辑：管理所有面板的状态、拖拽、吸附等功能
 */

import { ref, computed, provide, inject, readonly } from 'vue';
import { useSnapCalculator } from './useSnapCalculator';
import { useDragState } from './useDragState';
import type {
  PanelConfig,
  PanelInstance,
  PanelGroup,
  TabDragInfo,
  DragInfo,
  DockZone,
  SnapResult,
  DockManagerConfig,
  DockPosition,
} from './types';

const DOCK_MANAGER_KEY = Symbol('DOCK_MANAGER');

export function useDockManager(config?: DockManagerConfig) {
  // 配置
  const hotZoneSize = config?.hotZoneSize ?? 50;
  const minPanelWidth = config?.minPanelWidth ?? 200;
  const minPanelHeight = config?.minPanelHeight ?? 100;

  // 状态
  const panels = ref<Map<string, PanelInstance>>(new Map());
  const panelGroups = ref<Map<string, PanelGroup>>(new Map());
  const dragInfo = ref<DragInfo | null>(null);
  const tabDragInfo = ref<TabDragInfo | null>(null);
  const hoveredZone = ref<DockZone | null>(null);
  const hoveredGroup = ref<string | null>(null); // 标签页悬停在哪个面板组上
  const containerRect = ref<DOMRect | null>(null);
  const maxZIndex = ref(1000);

  // 容器引用
  let containerElement: HTMLElement | null = null;

  // 集成工具类
  const snapCalculator = useSnapCalculator({
    snapThreshold: 8, // PS 风格的吸附距离
  });

  const dragState = useDragState({
    boundaryPadding: 50,
  });

  /**
   * 注册容器元素
   */
  function registerContainer(element: HTMLElement) {
    containerElement = element;
    updateContainerRect();
  }

  /**
   * 更新容器尺寸
   */
  function updateContainerRect() {
    if (containerElement) {
      containerRect.value = containerElement.getBoundingClientRect();
    }
  }

  /**
   * 添加面板
   */
  function addPanel(config: PanelConfig): PanelInstance {
    const panel: PanelInstance = {
      ...config,
      state: 'floating',
      position: config.defaultPosition || 'float',
      x: 100,
      y: 100,
      width: config.width || minPanelWidth,
      height: config.height || minPanelHeight,
      minWidth: config.minWidth || minPanelWidth,
      minHeight: config.minHeight || minPanelHeight,
      zIndex: ++maxZIndex.value,
      dockedPanels: [],
    };

    // 如果有默认位置，则自动停靠
    if (config.defaultPosition && config.defaultPosition !== 'float') {
      panel.state = 'docked';
    }

    // 先添加到列表中，然后再更新布局
    panels.value.set(config.id, panel);

    // 更新停靠布局
    if (panel.state === 'docked' && panel.position !== 'float' && panel.position !== 'center') {
      updateDockedPanelsByPosition(panel.position);
    }

    return panel;
  }

  /**
   * 移除面板
   */
  function removePanel(panelId: string) {
    const panel = panels.value.get(panelId);
    if (!panel) return;

    // 记录面板原来的位置和状态
    const oldPosition = panel.position;
    const wasDockedState = panel.state === 'docked';

    // 如果有停靠在此面板上的其他面板，将它们转为浮动
    if (panel.dockedPanels && panel.dockedPanels.length > 0) {
      panel.dockedPanels.forEach(id => {
        const dockedPanel = panels.value.get(id);
        if (dockedPanel) {
          dockedPanel.state = 'floating';
          dockedPanel.position = 'float';
          dockedPanel.dockedWith = undefined;
        }
      });
    }

    // 如果此面板停靠在其他面板上，从父面板移除引用
    if (panel.dockedWith) {
      const parentPanel = panels.value.get(panel.dockedWith);
      if (parentPanel && parentPanel.dockedPanels) {
        parentPanel.dockedPanels = parentPanel.dockedPanels.filter(id => id !== panelId);
      }
    }

    panels.value.delete(panelId);

    // 如果移除的是停靠面板，更新该位置的其他面板布局
    if (wasDockedState && oldPosition !== 'float' && oldPosition !== 'center') {
      updateDockedPanelsByPosition(oldPosition);
    }
  }

  /**
   * 获取面板
   */
  function getPanel(panelId: string): PanelInstance | undefined {
    return panels.value.get(panelId);
  }

  /**
   * 开始拖拽
   */
  function startDrag(panelId: string, clientX: number, clientY: number) {
    const panel = panels.value.get(panelId);
    if (!panel) return;

    // 提升 z-index
    panel.zIndex = ++maxZIndex.value;

    // 记录原来的位置，用于后续更新布局
    const oldPosition = panel.position;
    const wasDockedState = panel.state === 'docked';

    // 如果面板是停靠状态，转换为浮动状态
    if (panel.state === 'docked') {
      // 从父面板移除引用
      if (panel.dockedWith) {
        const parentPanel = panels.value.get(panel.dockedWith);
        if (parentPanel && parentPanel.dockedPanels) {
          parentPanel.dockedPanels = parentPanel.dockedPanels.filter(id => id !== panelId);
        }
        panel.dockedWith = undefined;
      }

      // 设置面板为浮动状态，并计算其绝对位置
      panel.state = 'floating';
      
      // 获取面板在停靠状态下的实际位置（相对于视口）
      const panelElement = document.querySelector(`[data-panel-id="${panelId}"]`);
      if (panelElement) {
        const rect = panelElement.getBoundingClientRect();
        panel.x = rect.left;
        panel.y = rect.top;
        // 保持当前尺寸
        panel.width = rect.width;
        panel.height = rect.height;
      }
      
      panel.position = 'float';

      // 更新原位置的其他停靠面板布局
      if (wasDockedState && oldPosition !== 'float' && oldPosition !== 'center') {
        // 延迟更新，确保当前面板已经从停靠列表中移除
        setTimeout(() => {
          updateDockedPanelsByPosition(oldPosition);
        }, 0);
      }
    }

    panel.state = 'dragging';

    dragInfo.value = {
      panelId,
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      currentY: clientY,
      offsetX: clientX - panel.x,
      offsetY: clientY - panel.y,
    };

    updateContainerRect();
  }

  /**
   * 拖拽中
   */
  function onDrag(clientX: number, clientY: number) {
    if (!dragInfo.value) return;

    // 尝试获取面板或面板组
    const panel = panels.value.get(dragInfo.value.panelId);
    const group = panelGroups.value.get(dragInfo.value.panelId);
    
    const target = panel || group;
    if (!target) return;

    // 更新拖拽状态
    dragState.updateDrag(clientX, clientY);

    // 更新位置
    dragInfo.value.currentX = clientX;
    dragInfo.value.currentY = clientY;

    target.x = clientX - dragInfo.value.offsetX;
    target.y = clientY - dragInfo.value.offsetY;

    // 使用新的吸附计算器（仅对面板使用）
    if (panel) {
      const otherPanels = Array.from(panels.value.values()).filter(
        p => p.id !== panel.id && (p.state === 'floating' || p.state === 'docked')
      );

      const snapResult = snapCalculator.calculateSnap(
        panel,
        otherPanels,
        containerRect.value,
        dragState.disableSnap.value // Alt 键禁用吸附
      );

      if (snapResult.shouldSnap) {
        panel.x = snapResult.adjustedX;
        panel.y = snapResult.adjustedY;
      }

      // 检测停泊区吸附
      const dockSnapResult = detectSnap(panel, clientX, clientY);
      hoveredZone.value = dockSnapResult.shouldSnap
        ? {
            position: dockSnapResult.position!,
            rect: dockSnapResult.targetRect!,
          }
        : null;
    }
  }

  /**
   * 结束拖拽
   */
  function endDrag() {
    if (!dragInfo.value) return;

    // 尝试获取面板或面板组
    const panel = panels.value.get(dragInfo.value.panelId);
    const group = panelGroups.value.get(dragInfo.value.panelId);

    if (!panel && !group) {
      dragInfo.value = null;
      hoveredZone.value = null;
      return;
    }

    // 处理面板
    if (panel) {
      // 记录原来的位置，用于判断是否需要更新布局
      const oldPosition = panel.position;
      const oldState = panel.state;

      // 检测是否应该吸附
      const snapResult = detectSnap(
        panel,
        dragInfo.value.currentX,
        dragInfo.value.currentY
      );

      if (snapResult.shouldSnap && snapResult.position) {
        // 执行吸附
        panel.state = 'docked';
        panel.position = snapResult.position;
        panel.dockedWith = snapResult.targetPanelId;

        // 如果吸附到其他面板，更新父面板的引用
        if (snapResult.targetPanelId) {
          const parentPanel = panels.value.get(snapResult.targetPanelId);
          if (parentPanel) {
            if (!parentPanel.dockedPanels) {
              parentPanel.dockedPanels = [];
            }
            if (!parentPanel.dockedPanels.includes(panel.id)) {
              parentPanel.dockedPanels.push(panel.id);
            }
          }
        }

        // 更新该位置所有停靠面板的尺寸
        updateDockedPanelsByPosition(panel.position);
      } else {
        // 保持浮动状态
        panel.state = 'floating';
        panel.position = 'float';

        // 如果之前是停靠状态，需要更新原位置的面板布局
        if (oldState === 'docked' && oldPosition !== 'float' && oldPosition !== 'center') {
          updateDockedPanelsByPosition(oldPosition);
        }
      }
    }

    // 处理面板组
    if (group) {
      // TODO: 可以添加面板组的停泊检测逻辑
      group.state = 'floating';
      group.position = 'float';
    }

    dragInfo.value = null;
    hoveredZone.value = null;
  }

  /**
   * 检测吸附
   */
  function detectSnap(
    panel: PanelInstance,
    mouseX: number,
    mouseY: number
  ): SnapResult {
    if (!containerRect.value) {
      return { shouldSnap: false };
    }

    const containerR = containerRect.value;

    // 1. 检测容器边缘吸附
    const edgeSnap = detectContainerEdgeSnap(mouseX, mouseY, containerR);
    if (edgeSnap.shouldSnap) {
      return edgeSnap;
    }

    // 2. 检测其他面板吸附
    const panelSnap = detectPanelSnap(panel, mouseX, mouseY);
    if (panelSnap.shouldSnap) {
      return panelSnap;
    }

    return { shouldSnap: false };
  }

  /**
   * 检测容器边缘吸附
   * 优化：显示正确的预览尺寸（考虑现有面板和面板组数量）
   */
  function detectContainerEdgeSnap(
    mouseX: number,
    mouseY: number,
    containerR: DOMRect
  ): SnapResult {
    const defaultWidth = 250; // 默认停靠宽度
    const defaultHeight = 200; // 默认停靠高度

    // 左边缘
    if (mouseX - containerR.left < hotZoneSize) {
      const panelCount = Array.from(panels.value.values()).filter(
        p => p.state === 'docked' && p.position === 'left'
      ).length;
      const groupCount = Array.from(panelGroups.value.values()).filter(
        g => g.state === 'docked' && g.position === 'left'
      ).length;
      const existingCount = panelCount + groupCount;
      const heightPerPanel = containerR.height / (existingCount + 1);

      return {
        shouldSnap: true,
        position: 'left',
        targetRect: new DOMRect(
          containerR.left,
          containerR.top,
          defaultWidth,
          heightPerPanel
        ),
      };
    }

    // 右边缘
    if (containerR.right - mouseX < hotZoneSize) {
      const panelCount = Array.from(panels.value.values()).filter(
        p => p.state === 'docked' && p.position === 'right'
      ).length;
      const groupCount = Array.from(panelGroups.value.values()).filter(
        g => g.state === 'docked' && g.position === 'right'
      ).length;
      const existingCount = panelCount + groupCount;
      const heightPerPanel = containerR.height / (existingCount + 1);

      return {
        shouldSnap: true,
        position: 'right',
        targetRect: new DOMRect(
          containerR.right - defaultWidth,
          containerR.top,
          defaultWidth,
          heightPerPanel
        ),
      };
    }

    // 顶边缘
    if (mouseY - containerR.top < hotZoneSize) {
      const panelCount = Array.from(panels.value.values()).filter(
        p => p.state === 'docked' && p.position === 'top'
      ).length;
      const groupCount = Array.from(panelGroups.value.values()).filter(
        g => g.state === 'docked' && g.position === 'top'
      ).length;
      const existingCount = panelCount + groupCount;
      const widthPerPanel = containerR.width / (existingCount + 1);

      return {
        shouldSnap: true,
        position: 'top',
        targetRect: new DOMRect(
          containerR.left,
          containerR.top,
          widthPerPanel,
          defaultHeight
        ),
      };
    }

    // 底边缘
    if (containerR.bottom - mouseY < hotZoneSize) {
      const panelCount = Array.from(panels.value.values()).filter(
        p => p.state === 'docked' && p.position === 'bottom'
      ).length;
      const groupCount = Array.from(panelGroups.value.values()).filter(
        g => g.state === 'docked' && g.position === 'bottom'
      ).length;
      const existingCount = panelCount + groupCount;
      const widthPerPanel = containerR.width / (existingCount + 1);

      return {
        shouldSnap: true,
        position: 'bottom',
        targetRect: new DOMRect(
          containerR.left,
          containerR.bottom - defaultHeight,
          widthPerPanel,
          defaultHeight
        ),
      };
    }

    return { shouldSnap: false };
  }

  /**
   * 检测面板吸附（已停靠面板周围）
   * 优化：吸附在面板连接处，并考虑多面板布局
   */
  function detectPanelSnap(
    draggedPanel: PanelInstance,
    mouseX: number,
    mouseY: number
  ): SnapResult {
    if (!containerRect.value) return { shouldSnap: false };

    const containerR = containerRect.value;

    // 遍历所有已停靠的面板
    for (const [id, panel] of panels.value) {
      if (id === draggedPanel.id || panel.state !== 'docked') continue;

      const panelElement = document.querySelector(`[data-panel-id="${id}"]`);
      if (!panelElement) continue;

      const rect = panelElement.getBoundingClientRect();

      // 根据面板的停靠位置，检测是否可以吸附在同一侧
      if (panel.position === 'left' || panel.position === 'right') {
        // 左右停靠面板：检测上下连接处
        
        // 检测是否在合理的水平范围内（面板的水平区域）
        const isInHorizontalRange = mouseX >= rect.left - hotZoneSize && 
                                     mouseX <= rect.right + hotZoneSize;

        if (!isInHorizontalRange) continue;

        // 获取该侧所有停靠面板和面板组，计算新的高度分配
        const sameSidePanels = Array.from(panels.value.values()).filter(
          p => p.state === 'docked' && p.position === panel.position
        );
        const sameSideGroups = Array.from(panelGroups.value.values()).filter(
          g => g.state === 'docked' && g.position === panel.position
        );
        const totalCount = sameSidePanels.length + sameSideGroups.length;
        const newHeightPerPanel = containerR.height / (totalCount + 1);

        // 检测是否在面板上边缘附近（可以插入到上方）
        if (Math.abs(mouseY - rect.top) < hotZoneSize) {
          return {
            shouldSnap: true,
            position: panel.position,
            targetPanelId: id,
            targetRect: new DOMRect(
              rect.left,
              rect.top - newHeightPerPanel,
              rect.width,
              newHeightPerPanel
            ),
          };
        }

        // 检测是否在面板下边缘附近（可以插入到下方）
        if (Math.abs(mouseY - rect.bottom) < hotZoneSize) {
          return {
            shouldSnap: true,
            position: panel.position,
            targetPanelId: id,
            targetRect: new DOMRect(
              rect.left,
              rect.bottom,
              rect.width,
              newHeightPerPanel
            ),
          };
        }

      } else if (panel.position === 'top' || panel.position === 'bottom') {
        // 上下停靠面板：检测左右连接处

        // 检测是否在合理的垂直范围内（面板的垂直区域）
        const isInVerticalRange = mouseY >= rect.top - hotZoneSize && 
                                   mouseY <= rect.bottom + hotZoneSize;

        if (!isInVerticalRange) continue;

        // 获取该侧所有停靠面板和面板组，计算新的宽度分配
        const sameSidePanels = Array.from(panels.value.values()).filter(
          p => p.state === 'docked' && p.position === panel.position
        );
        const sameSideGroups = Array.from(panelGroups.value.values()).filter(
          g => g.state === 'docked' && g.position === panel.position
        );
        const totalCount = sameSidePanels.length + sameSideGroups.length;
        const newWidthPerPanel = containerR.width / (totalCount + 1);

        // 检测是否在面板左边缘附近（可以插入到左侧）
        if (Math.abs(mouseX - rect.left) < hotZoneSize) {
          return {
            shouldSnap: true,
            position: panel.position,
            targetPanelId: id,
            targetRect: new DOMRect(
              rect.left - newWidthPerPanel,
              rect.top,
              newWidthPerPanel,
              rect.height
            ),
          };
        }

        // 检测是否在面板右边缘附近（可以插入到右侧）
        if (Math.abs(mouseX - rect.right) < hotZoneSize) {
          return {
            shouldSnap: true,
            position: panel.position,
            targetPanelId: id,
            targetRect: new DOMRect(
              rect.right,
              rect.top,
              newWidthPerPanel,
              rect.height
            ),
          };
        }
      }
    }

    return { shouldSnap: false };
  }

  /**
   * 更新指定位置所有停靠面板的尺寸
   * 实现类似 Photoshop 的自动布局：
   * - 单个面板：占满整个侧边（左右100%高，上下100%宽）
   * - 多个面板：等分空间
   */
  function updateDockedPanelsByPosition(position: DockPosition) {
    if (!containerRect.value || position === 'float' || position === 'center') return;

    const containerR = containerRect.value;

    // 获取该位置的所有停靠面板
    const dockedPanels = Array.from(panels.value.values()).filter(
      p => p.state === 'docked' && p.position === position
    );

    // 获取该位置的所有停靠面板组
    const dockedGroups = Array.from(panelGroups.value.values()).filter(
      g => g.state === 'docked' && g.position === position
    );

    const totalCount = dockedPanels.length + dockedGroups.length;
    if (totalCount === 0) return;

    switch (position) {
      case 'left':
      case 'right': {
        // 左右停靠：高度平分，宽度保持
        const totalHeight = containerR.height;
        const heightPerItem = totalHeight / totalCount;

        // 更新面板
        dockedPanels.forEach((p) => {
          // 保持宽度不变，限制在合理范围内
          p.width = Math.max(
            Math.min(p.width, containerR.width * 0.4),
            p.minWidth || minPanelWidth
          );
          // 高度等分
          p.height = heightPerItem;
        });

        // 更新面板组
        dockedGroups.forEach((g) => {
          // 保持宽度不变，限制在合理范围内
          g.width = Math.max(
            Math.min(g.width, containerR.width * 0.4),
            g.minWidth || minPanelWidth
          );
          // 高度等分
          g.height = heightPerItem;
        });
        break;
      }

      case 'top':
      case 'bottom': {
        // 上下停靠：宽度平分，高度保持
        const totalWidth = containerR.width;
        const widthPerItem = totalWidth / totalCount;

        // 更新面板
        dockedPanels.forEach((p) => {
          // 宽度等分
          p.width = widthPerItem;
          // 保持高度不变，限制在合理范围内
          p.height = Math.max(
            Math.min(p.height, containerR.height * 0.4),
            p.minHeight || minPanelHeight
          );
        });

        // 更新面板组
        dockedGroups.forEach((g) => {
          // 宽度等分
          g.width = widthPerItem;
          // 保持高度不变，限制在合理范围内
          g.height = Math.max(
            Math.min(g.height, containerR.height * 0.4),
            g.minHeight || minPanelHeight
          );
        });
        break;
      }
    }
  }

  /**
   * 激活面板（提升到最前）
   */
  function activatePanel(panelId: string) {
    const panel = panels.value.get(panelId);
    if (!panel) return;

    panel.zIndex = ++maxZIndex.value;
  }

  /**
   * 获取所有面板列表
   */
  const panelList = computed(() => {
    return Array.from(panels.value.values()).sort((a, b) => a.zIndex - b.zIndex);
  });

  /**
   * 调整面板大小
   */
  function resizePanel(panelId: string, width: number, height: number) {
    const panel = panels.value.get(panelId);
    if (!panel) return;

    panel.width = Math.max(width, panel.minWidth || minPanelWidth);
    panel.height = Math.max(height, panel.minHeight || minPanelHeight);
  }

  // ========== 面板组管理功能 ==========

  /**
   * 添加面板组
   */
  function addPanelGroup(config: PanelConfig): PanelGroup {
    const groupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const tabId = config.id;

    const group: PanelGroup = {
      id: groupId,
      tabs: [{
        id: tabId,
        title: config.title,
        icon: config.icon,
        closable: config.closable,
        content: config.content,
      }],
      activeTabId: tabId,
      width: config.width || minPanelWidth,
      height: config.height || minPanelHeight,
      minWidth: config.minWidth || minPanelWidth,
      minHeight: config.minHeight || minPanelHeight,
      x: 100,
      y: 100,
      zIndex: ++maxZIndex.value,
      state: 'floating',
      position: config.defaultPosition || 'float',
      resizable: config.resizable,
      dockedPanels: [],
    };

    // 如果有默认位置，则自动停靠
    if (config.defaultPosition && config.defaultPosition !== 'float') {
      group.state = 'docked';
    }

    // 先添加到列表中
    panelGroups.value.set(groupId, group);

    // 更新停靠布局
    if (group.state === 'docked' && group.position !== 'float' && group.position !== 'center') {
      updateDockedPanelsByPosition(group.position);
    }

    return group;
  }

  /**
   * 移除面板组
   */
  function removePanelGroup(groupId: string) {
    const group = panelGroups.value.get(groupId);
    if (!group) return;

    // 记录面板组原来的位置和状态
    const oldPosition = group.position;
    const wasDockedState = group.state === 'docked';

    panelGroups.value.delete(groupId);

    // 如果移除的是停靠面板组，更新该位置的其他面板布局
    if (wasDockedState && oldPosition !== 'float' && oldPosition !== 'center') {
      updateDockedPanelsByPosition(oldPosition);
    }
  }

  /**
   * 获取面板组
   */
  function getPanelGroup(groupId: string): PanelGroup | undefined {
    return panelGroups.value.get(groupId);
  }

  /**
   * 激活面板组
   */
  function activatePanelGroup(groupId: string) {
    const group = panelGroups.value.get(groupId);
    if (!group) return;
    group.zIndex = ++maxZIndex.value;
  }

  /**
   * 设置激活的标签页
   */
  function setActiveTab(groupId: string, tabId: string) {
    const group = panelGroups.value.get(groupId);
    if (!group) return;
    
    const tab = group.tabs.find(t => t.id === tabId);
    if (tab) {
      group.activeTabId = tabId;
    }
  }

  /**
   * 关闭标签页
   */
  function closeTab(groupId: string, tabId: string) {
    const group = panelGroups.value.get(groupId);
    if (!group) return;

    const tabIndex = group.tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return;

    // 移除标签页
    group.tabs.splice(tabIndex, 1);

    // 如果是当前激活的标签页，激活下一个
    if (group.activeTabId === tabId && group.tabs.length > 0) {
      const newIndex = Math.min(tabIndex, group.tabs.length - 1);
      group.activeTabId = group.tabs[newIndex].id;
    }

    // 如果没有标签页了，移除整个面板组
    if (group.tabs.length === 0) {
      removePanelGroup(groupId);
    }
  }

  /**
   * 开始拖拽面板组
   */
  function startDragGroup(groupId: string, clientX: number, clientY: number) {
    const group = panelGroups.value.get(groupId);
    if (!group) return;

    group.zIndex = ++maxZIndex.value;

    if (group.state === 'docked') {
      group.state = 'floating';
      group.position = 'float';
    }

    group.state = 'dragging';

    dragInfo.value = {
      panelId: groupId,
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      currentY: clientY,
      offsetX: clientX - group.x,
      offsetY: clientY - group.y,
    };

    updateContainerRect();
  }

  /**
   * 开始拖拽标签页
   */
  function startDragTab(groupId: string, tabId: string, clientX: number, clientY: number) {
    const group = panelGroups.value.get(groupId);
    if (!group) return;

    const tab = group.tabs.find(t => t.id === tabId);
    if (!tab) return;

    tabDragInfo.value = {
      groupId,
      tabId,
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      currentY: clientY,
      offsetX: 0,
      offsetY: 0,
    };

    // 如果面板组只有一个标签，就拖动整个面板组
    if (group.tabs.length === 1) {
      startDragGroup(groupId, clientX, clientY);
    }
  }

  /**
   * 拖拽标签页中
   */
  function onDragTab(clientX: number, clientY: number) {
    if (!tabDragInfo.value) return;

    tabDragInfo.value.currentX = clientX;
    tabDragInfo.value.currentY = clientY;

    // 检测是否悬停在其他面板组上
    detectTabHover(clientX, clientY);
  }

  /**
   * 检测标签页悬停
   */
  function detectTabHover(clientX: number, clientY: number) {
    hoveredGroup.value = null;

    for (const [id] of panelGroups.value) {
      if (id === tabDragInfo.value?.groupId) continue;

      // 检测鼠标是否在面板组的标签栏区域内
      const element = document.querySelector(`[data-panel-group-id="${id}"]`);
      if (!element) continue;

      const rect = element.getBoundingClientRect();
      const tabsHeaderHeight = 36; // 标签栏高度

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

  /**
   * 结束拖拽标签页
   */
  function endDragTab() {
    if (!tabDragInfo.value) return;

    const { groupId, tabId } = tabDragInfo.value;
    const sourceGroup = panelGroups.value.get(groupId);
    
    if (!sourceGroup) {
      tabDragInfo.value = null;
      return;
    }

    // 如果悬停在其他面板组上，执行合并
    if (hoveredGroup.value && hoveredGroup.value !== groupId) {
      mergeTabToGroup(groupId, tabId, hoveredGroup.value);
    } else if (sourceGroup.tabs.length > 1) {
      // 如果源面板组有多个标签，将标签拆分成新面板组
      splitTabToNewGroup(groupId, tabId, tabDragInfo.value.currentX, tabDragInfo.value.currentY);
    }

    tabDragInfo.value = null;
    hoveredGroup.value = null;
  }

  /**
   * 合并标签页到面板组
   */
  function mergeTabToGroup(sourceGroupId: string, tabId: string, targetGroupId: string) {
    const sourceGroup = panelGroups.value.get(sourceGroupId);
    const targetGroup = panelGroups.value.get(targetGroupId);
    
    if (!sourceGroup || !targetGroup) return;

    const tabIndex = sourceGroup.tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return;

    const tab = sourceGroup.tabs[tabIndex];

    // 从源面板组移除标签
    sourceGroup.tabs.splice(tabIndex, 1);

    // 添加到目标面板组
    targetGroup.tabs.push(tab);
    targetGroup.activeTabId = tabId;

    // 如果源面板组没有标签了，移除它
    if (sourceGroup.tabs.length === 0) {
      removePanelGroup(sourceGroupId);
    } else if (sourceGroup.activeTabId === tabId) {
      // 如果移除的是激活的标签，激活另一个
      sourceGroup.activeTabId = sourceGroup.tabs[Math.min(tabIndex, sourceGroup.tabs.length - 1)].id;
    }
  }

  /**
   * 拆分标签页成新面板组
   */
  function splitTabToNewGroup(sourceGroupId: string, tabId: string, x: number, y: number) {
    const sourceGroup = panelGroups.value.get(sourceGroupId);
    if (!sourceGroup) return;

    const tabIndex = sourceGroup.tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return;

    const tab = sourceGroup.tabs[tabIndex];

    // 从源面板组移除标签
    sourceGroup.tabs.splice(tabIndex, 1);

    // 创建新面板组
    const newGroupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newGroup: PanelGroup = {
      id: newGroupId,
      tabs: [tab],
      activeTabId: tab.id,
      width: sourceGroup.width,
      height: sourceGroup.height,
      minWidth: sourceGroup.minWidth,
      minHeight: sourceGroup.minHeight,
      x: x - 100,
      y: y - 20,
      zIndex: ++maxZIndex.value,
      state: 'floating',
      position: 'float',
      resizable: sourceGroup.resizable,
      dockedPanels: [],
    };

    panelGroups.value.set(newGroupId, newGroup);

    // 如果源面板组的激活标签是被拆分的，更新激活标签
    if (sourceGroup.activeTabId === tabId) {
      sourceGroup.activeTabId = sourceGroup.tabs[Math.min(tabIndex, sourceGroup.tabs.length - 1)].id;
    }
  }

  /**
   * 分离面板组
   */
  function detachPanelGroup(groupId: string) {
    const group = panelGroups.value.get(groupId);
    if (!group) return;

    group.state = 'floating';
    group.position = 'float';

    if (containerRect.value) {
      const rect = containerRect.value;
      group.x = rect.left + (rect.width - group.width) / 2;
      group.y = rect.top + (rect.height - group.height) / 2;
    }
  }

  /**
   * 调整面板组大小
   */
  function resizePanelGroup(groupId: string, width: number, height: number) {
    const group = panelGroups.value.get(groupId);
    if (!group) return;

    group.width = Math.max(width, group.minWidth || minPanelWidth);
    group.height = Math.max(height, group.minHeight || minPanelHeight);
  }

  /**
   * 获取所有面板组列表
   */
  const panelGroupList = computed(() => {
    return Array.from(panelGroups.value.values()).sort((a, b) => a.zIndex - b.zIndex);
  });

  const manager = {
    // 状态（只读）
    panels: readonly(panels),
    panelList,
    panelGroups: readonly(panelGroups),
    panelGroupList,
    dragInfo: readonly(dragInfo),
    tabDragInfo: readonly(tabDragInfo),
    hoveredZone: readonly(hoveredZone),
    hoveredGroup: readonly(hoveredGroup),
    containerRect: readonly(containerRect),
    
    // 吸附计算器状态
    snapLines: snapCalculator.snapLines,
    isSnapping: snapCalculator.isSnapping,

    // 面板方法
    registerContainer,
    updateContainerRect,
    addPanel,
    removePanel,
    getPanel,
    startDrag,
    onDrag,
    endDrag,
    activatePanel,
    resizePanel,
    updateDockedPanelsByPosition, // 暴露布局更新方法

    // 面板组方法
    addPanelGroup,
    removePanelGroup,
    getPanelGroup,
    activatePanelGroup,
    setActiveTab,
    closeTab,
    startDragGroup,
    startDragTab,
    onDragTab,
    endDragTab,
    mergeTabToGroup,
    splitTabToNewGroup,
    detachPanelGroup,
    resizePanelGroup,
  };

  // 提供给子组件
  provide(DOCK_MANAGER_KEY, manager);

  return manager;
}

/**
 * 注入停靠管理器
 */
export function injectDockManager() {
  const manager = inject<ReturnType<typeof useDockManager>>(DOCK_MANAGER_KEY);
  if (!manager) {
    throw new Error('DockManager not provided. Use useDockManager() in parent component.');
  }
  return manager;
}
