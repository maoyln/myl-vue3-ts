/**
 * 停泊管理器 Composable
 * 核心逻辑：管理所有面板的状态、拖拽、吸附等功能
 */

import { ref, computed, provide, inject, readonly } from 'vue';
import type {
  PanelConfig,
  PanelInstance,
  DragInfo,
  DockPosition,
  DockZone,
  SnapResult,
  DockManagerConfig,
} from './types';

const DOCK_MANAGER_KEY = Symbol('DOCK_MANAGER');

export function useDockManager(config?: DockManagerConfig) {
  // 配置
  const snapThreshold = config?.snapThreshold ?? 30;
  const hotZoneSize = config?.hotZoneSize ?? 50;
  const minPanelWidth = config?.minPanelWidth ?? 200;
  const minPanelHeight = config?.minPanelHeight ?? 100;

  // 状态
  const panels = ref<Map<string, PanelInstance>>(new Map());
  const dragInfo = ref<DragInfo | null>(null);
  const hoveredZone = ref<DockZone | null>(null);
  const containerRect = ref<DOMRect | null>(null);
  const maxZIndex = ref(1000);

  // 容器引用
  let containerElement: HTMLElement | null = null;

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
      updateDockedPanelSize(panel);
    }

    panels.value.set(config.id, panel);
    return panel;
  }

  /**
   * 移除面板
   */
  function removePanel(panelId: string) {
    const panel = panels.value.get(panelId);
    if (!panel) return;

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

    // 如果面板是停靠状态，转换为浮动状态
    if (panel.state === 'docked') {
      panel.state = 'floating';
      panel.position = 'float';
      
      // 从父面板移除引用
      if (panel.dockedWith) {
        const parentPanel = panels.value.get(panel.dockedWith);
        if (parentPanel && parentPanel.dockedPanels) {
          parentPanel.dockedPanels = parentPanel.dockedPanels.filter(id => id !== panelId);
        }
        panel.dockedWith = undefined;
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

    const panel = panels.value.get(dragInfo.value.panelId);
    if (!panel) return;

    // 更新位置
    dragInfo.value.currentX = clientX;
    dragInfo.value.currentY = clientY;

    panel.x = clientX - dragInfo.value.offsetX;
    panel.y = clientY - dragInfo.value.offsetY;

    // 检测吸附
    const snapResult = detectSnap(panel, clientX, clientY);
    hoveredZone.value = snapResult.shouldSnap
      ? {
          position: snapResult.position!,
          rect: snapResult.targetRect!,
        }
      : null;
  }

  /**
   * 结束拖拽
   */
  function endDrag() {
    if (!dragInfo.value) return;

    const panel = panels.value.get(dragInfo.value.panelId);
    if (!panel) {
      dragInfo.value = null;
      hoveredZone.value = null;
      return;
    }

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

      updateDockedPanelSize(panel);
    } else {
      // 保持浮动状态
      panel.state = 'floating';
      panel.position = 'float';
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
      return {
        shouldSnap: true,
        position: 'left',
        targetRect: new DOMRect(
          containerR.left,
          containerR.top,
          defaultWidth,
          containerR.height
        ),
      };
    }

    // 右边缘
    if (containerR.right - mouseX < hotZoneSize) {
      return {
        shouldSnap: true,
        position: 'right',
        targetRect: new DOMRect(
          containerR.right - defaultWidth,
          containerR.top,
          defaultWidth,
          containerR.height
        ),
      };
    }

    // 顶边缘
    if (mouseY - containerR.top < hotZoneSize) {
      return {
        shouldSnap: true,
        position: 'top',
        targetRect: new DOMRect(
          containerR.left,
          containerR.top,
          containerR.width,
          defaultHeight
        ),
      };
    }

    // 底边缘
    if (containerR.bottom - mouseY < hotZoneSize) {
      return {
        shouldSnap: true,
        position: 'bottom',
        targetRect: new DOMRect(
          containerR.left,
          containerR.bottom - defaultHeight,
          containerR.width,
          defaultHeight
        ),
      };
    }

    return { shouldSnap: false };
  }

  /**
   * 检测面板吸附（已停靠面板周围）
   * 注意：面板可以吸附在已停靠面板的同一侧，而不是在面板上方
   */
  function detectPanelSnap(
    draggedPanel: PanelInstance,
    mouseX: number,
    mouseY: number
  ): SnapResult {
    // 遍历所有已停靠的面板
    for (const [id, panel] of panels.value) {
      if (id === draggedPanel.id || panel.state !== 'docked') continue;

      const panelElement = document.querySelector(`[data-panel-id="${id}"]`);
      if (!panelElement) continue;

      const rect = panelElement.getBoundingClientRect();

      // 根据面板的停靠位置，检测是否可以吸附在同一侧
      if (panel.position === 'left' || panel.position === 'right') {
        // 左右停靠面板：检测上下是否可以吸附
        if (
          mouseX > rect.left - snapThreshold &&
          mouseX < rect.right + snapThreshold
        ) {
          // 检测是否在面板上方
          if (Math.abs(mouseY - rect.top) < snapThreshold) {
            return {
              shouldSnap: true,
              position: panel.position, // 吸附到同一侧
              targetPanelId: id,
              targetRect: new DOMRect(
                rect.left,
                rect.top - 150,
                rect.width,
                150
              ),
            };
          }
          // 检测是否在面板下方
          if (Math.abs(mouseY - rect.bottom) < snapThreshold) {
            return {
              shouldSnap: true,
              position: panel.position,
              targetPanelId: id,
              targetRect: new DOMRect(
                rect.left,
                rect.bottom,
                rect.width,
                150
              ),
            };
          }
        }
      } else if (panel.position === 'top' || panel.position === 'bottom') {
        // 上下停靠面板：检测左右是否可以吸附
        if (
          mouseY > rect.top - snapThreshold &&
          mouseY < rect.bottom + snapThreshold
        ) {
          // 检测是否在面板左侧
          if (Math.abs(mouseX - rect.left) < snapThreshold) {
            return {
              shouldSnap: true,
              position: panel.position,
              targetPanelId: id,
              targetRect: new DOMRect(
                rect.left - 200,
                rect.top,
                200,
                rect.height
              ),
            };
          }
          // 检测是否在面板右侧
          if (Math.abs(mouseX - rect.right) < snapThreshold) {
            return {
              shouldSnap: true,
              position: panel.position,
              targetPanelId: id,
              targetRect: new DOMRect(
                rect.right,
                rect.top,
                200,
                rect.height
              ),
            };
          }
        }
      }
    }

    return { shouldSnap: false };
  }

  /**
   * 更新停靠面板尺寸
   * 注意：停靠面板使用 flex 布局，不需要设置 x, y 坐标
   */
  function updateDockedPanelSize(panel: PanelInstance) {
    if (!containerRect.value) return;

    const containerR = containerRect.value;

    switch (panel.position) {
      case 'left':
      case 'right':
        // 左右停靠：限制宽度，高度自动填充
        panel.width = Math.max(
          Math.min(panel.width, containerR.width * 0.4),
          panel.minWidth || minPanelWidth
        );
        break;
      case 'top':
      case 'bottom':
        // 上下停靠：限制高度，宽度自动填充
        panel.height = Math.max(
          Math.min(panel.height, containerR.height * 0.4),
          panel.minHeight || minPanelHeight
        );
        break;
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

  const manager = {
    // 状态（只读）
    panels: readonly(panels),
    panelList,
    dragInfo: readonly(dragInfo),
    hoveredZone: readonly(hoveredZone),
    containerRect: readonly(containerRect),

    // 方法
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
