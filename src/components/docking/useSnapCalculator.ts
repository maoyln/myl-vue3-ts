/**
 * 吸附计算工具类
 * 核心功能：封装所有吸附相关的计算逻辑
 */

import { ref, computed } from 'vue';
import type { PanelInstance } from './types';

export interface ElementRect {
  x: number;
  y: number;
  width: number;
  height: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
}

export type SnapType =
  | 'none'
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'centerX'
  | 'centerY';

export interface SnapLine {
  type: 'horizontal' | 'vertical';
  position: number;
  start: number;
  end: number;
}

export interface SnapCalculatorConfig {
  snapThreshold?: number; // 吸附触发距离（像素）
  velocityThreshold?: number; // 速度阈值（px/s）
  enableVelocityDelay?: boolean; // 是否启用速度延迟
}

export function useSnapCalculator(config?: SnapCalculatorConfig) {
  // 配置
  const snapThreshold = config?.snapThreshold ?? 8;
  // const velocityThreshold = config?.velocityThreshold ?? 100;
  // const enableVelocityDelay = config?.enableVelocityDelay ?? false;

  // 状态
  const snapLines = ref<SnapLine[]>([]);
  const currentSnapType = ref<SnapType>('none');
  const isSnapping = ref(false);

  /**
   * 计算元素的完整位置信息
   */
  function getElementRect(panel: PanelInstance): ElementRect {
    return {
      x: panel.x,
      y: panel.y,
      width: panel.width,
      height: panel.height,
      left: panel.x,
      right: panel.x + panel.width,
      top: panel.y,
      bottom: panel.y + panel.height,
      centerX: panel.x + panel.width / 2,
      centerY: panel.y + panel.height / 2,
    };
  }

  /**
   * 判断两个矩形是否在吸附距离内
   */
  function isWithinSnapDistance(value1: number, value2: number): boolean {
    return Math.abs(value1 - value2) <= snapThreshold;
  }

  /**
   * 计算与其他面板的吸附
   */
  function calculatePanelSnap(
    draggedPanel: PanelInstance,
    otherPanels: PanelInstance[]
  ): {
    snapType: SnapType;
    adjustedX: number;
    adjustedY: number;
    snapLines: SnapLine[];
  } {
    const dragRect = getElementRect(draggedPanel);
    let snapType: SnapType = 'none';
    let adjustedX = draggedPanel.x;
    let adjustedY = draggedPanel.y;
    const lines: SnapLine[] = [];

    // 遍历所有其他面板
    for (const panel of otherPanels) {
      if (panel.id === draggedPanel.id) continue;

      const targetRect = getElementRect(panel);

      // 检测水平对齐
      // 左边缘对齐
      if (isWithinSnapDistance(dragRect.left, targetRect.left)) {
        adjustedX = targetRect.left;
        snapType = 'left';
        lines.push({
          type: 'vertical',
          position: targetRect.left,
          start: Math.min(dragRect.top, targetRect.top),
          end: Math.max(dragRect.bottom, targetRect.bottom),
        });
      }
      // 右边缘对齐
      else if (isWithinSnapDistance(dragRect.right, targetRect.right)) {
        adjustedX = targetRect.right - draggedPanel.width;
        snapType = 'right';
        lines.push({
          type: 'vertical',
          position: targetRect.right,
          start: Math.min(dragRect.top, targetRect.top),
          end: Math.max(dragRect.bottom, targetRect.bottom),
        });
      }
      // 水平中心对齐
      else if (isWithinSnapDistance(dragRect.centerX, targetRect.centerX)) {
        adjustedX = targetRect.centerX - draggedPanel.width / 2;
        snapType = 'centerX';
        lines.push({
          type: 'vertical',
          position: targetRect.centerX,
          start: Math.min(dragRect.top, targetRect.top),
          end: Math.max(dragRect.bottom, targetRect.bottom),
        });
      }
      // 左边缘对齐右边缘
      else if (isWithinSnapDistance(dragRect.left, targetRect.right)) {
        adjustedX = targetRect.right;
        snapType = 'left';
        lines.push({
          type: 'vertical',
          position: targetRect.right,
          start: Math.min(dragRect.top, targetRect.top),
          end: Math.max(dragRect.bottom, targetRect.bottom),
        });
      }
      // 右边缘对齐左边缘
      else if (isWithinSnapDistance(dragRect.right, targetRect.left)) {
        adjustedX = targetRect.left - draggedPanel.width;
        snapType = 'right';
        lines.push({
          type: 'vertical',
          position: targetRect.left,
          start: Math.min(dragRect.top, targetRect.top),
          end: Math.max(dragRect.bottom, targetRect.bottom),
        });
      }

      // 检测垂直对齐
      // 顶边缘对齐
      if (isWithinSnapDistance(dragRect.top, targetRect.top)) {
        adjustedY = targetRect.top;
        snapType = snapType === 'none' ? 'top' : snapType;
        lines.push({
          type: 'horizontal',
          position: targetRect.top,
          start: Math.min(dragRect.left, targetRect.left),
          end: Math.max(dragRect.right, targetRect.right),
        });
      }
      // 底边缘对齐
      else if (isWithinSnapDistance(dragRect.bottom, targetRect.bottom)) {
        adjustedY = targetRect.bottom - draggedPanel.height;
        snapType = snapType === 'none' ? 'bottom' : snapType;
        lines.push({
          type: 'horizontal',
          position: targetRect.bottom,
          start: Math.min(dragRect.left, targetRect.left),
          end: Math.max(dragRect.right, targetRect.right),
        });
      }
      // 垂直中心对齐
      else if (isWithinSnapDistance(dragRect.centerY, targetRect.centerY)) {
        adjustedY = targetRect.centerY - draggedPanel.height / 2;
        snapType = snapType === 'none' ? 'centerY' : snapType;
        lines.push({
          type: 'horizontal',
          position: targetRect.centerY,
          start: Math.min(dragRect.left, targetRect.left),
          end: Math.max(dragRect.right, targetRect.right),
        });
      }
      // 顶边缘对齐底边缘
      else if (isWithinSnapDistance(dragRect.top, targetRect.bottom)) {
        adjustedY = targetRect.bottom;
        snapType = snapType === 'none' ? 'top' : snapType;
        lines.push({
          type: 'horizontal',
          position: targetRect.bottom,
          start: Math.min(dragRect.left, targetRect.left),
          end: Math.max(dragRect.right, targetRect.right),
        });
      }
      // 底边缘对齐顶边缘
      else if (isWithinSnapDistance(dragRect.bottom, targetRect.top)) {
        adjustedY = targetRect.top - draggedPanel.height;
        snapType = snapType === 'none' ? 'bottom' : snapType;
        lines.push({
          type: 'horizontal',
          position: targetRect.top,
          start: Math.min(dragRect.left, targetRect.left),
          end: Math.max(dragRect.right, targetRect.right),
        });
      }
    }

    return {
      snapType,
      adjustedX,
      adjustedY,
      snapLines: lines,
    };
  }

  /**
   * 计算与容器边缘的吸附
   */
  function calculateContainerSnap(
    draggedPanel: PanelInstance,
    containerRect: DOMRect
  ): {
    snapType: SnapType;
    adjustedX: number;
    adjustedY: number;
    snapLines: SnapLine[];
  } {
    const dragRect = getElementRect(draggedPanel);
    let snapType: SnapType = 'none';
    let adjustedX = draggedPanel.x;
    let adjustedY = draggedPanel.y;
    const lines: SnapLine[] = [];

    // 左边缘
    if (isWithinSnapDistance(dragRect.left, containerRect.left)) {
      adjustedX = containerRect.left;
      snapType = 'left';
      lines.push({
        type: 'vertical',
        position: containerRect.left,
        start: containerRect.top,
        end: containerRect.bottom,
      });
    }
    // 右边缘
    else if (isWithinSnapDistance(dragRect.right, containerRect.right)) {
      adjustedX = containerRect.right - draggedPanel.width;
      snapType = 'right';
      lines.push({
        type: 'vertical',
        position: containerRect.right,
        start: containerRect.top,
        end: containerRect.bottom,
      });
    }

    // 顶边缘
    if (isWithinSnapDistance(dragRect.top, containerRect.top)) {
      adjustedY = containerRect.top;
      snapType = snapType === 'none' ? 'top' : snapType;
      lines.push({
        type: 'horizontal',
        position: containerRect.top,
        start: containerRect.left,
        end: containerRect.right,
      });
    }
    // 底边缘
    else if (isWithinSnapDistance(dragRect.bottom, containerRect.bottom)) {
      adjustedY = containerRect.bottom - draggedPanel.height;
      snapType = snapType === 'none' ? 'bottom' : snapType;
      lines.push({
        type: 'horizontal',
        position: containerRect.bottom,
        start: containerRect.left,
        end: containerRect.right,
      });
    }

    return {
      snapType,
      adjustedX,
      adjustedY,
      snapLines: lines,
    };
  }

  /**
   * 综合计算吸附（面板 + 容器）
   */
  function calculateSnap(
    draggedPanel: PanelInstance,
    otherPanels: PanelInstance[],
    containerRect: DOMRect | null,
    disableSnap: boolean = false
  ): {
    shouldSnap: boolean;
    adjustedX: number;
    adjustedY: number;
    snapType: SnapType;
  } {
    if (disableSnap || !containerRect) {
      return {
        shouldSnap: false,
        adjustedX: draggedPanel.x,
        adjustedY: draggedPanel.y,
        snapType: 'none',
      };
    }

    // 计算与其他面板的吸附
    const panelSnap = calculatePanelSnap(draggedPanel, otherPanels);

    // 计算与容器的吸附
    const containerSnap = calculateContainerSnap(draggedPanel, containerRect);

    // 优先面板吸附
    if (panelSnap.snapType !== 'none') {
      snapLines.value = panelSnap.snapLines;
      currentSnapType.value = panelSnap.snapType;
      isSnapping.value = true;
      return {
        shouldSnap: true,
        adjustedX: panelSnap.adjustedX,
        adjustedY: panelSnap.adjustedY,
        snapType: panelSnap.snapType,
      };
    }

    // 其次容器吸附
    if (containerSnap.snapType !== 'none') {
      snapLines.value = containerSnap.snapLines;
      currentSnapType.value = containerSnap.snapType;
      isSnapping.value = true;
      return {
        shouldSnap: true,
        adjustedX: containerSnap.adjustedX,
        adjustedY: containerSnap.adjustedY,
        snapType: containerSnap.snapType,
      };
    }

    // 无吸附
    snapLines.value = [];
    currentSnapType.value = 'none';
    isSnapping.value = false;
    return {
      shouldSnap: false,
      adjustedX: draggedPanel.x,
      adjustedY: draggedPanel.y,
      snapType: 'none',
    };
  }

  /**
   * 清除吸附状态
   */
  function clearSnap() {
    snapLines.value = [];
    currentSnapType.value = 'none';
    isSnapping.value = false;
  }

  return {
    // 状态
    snapLines: computed(() => snapLines.value),
    currentSnapType: computed(() => currentSnapType.value),
    isSnapping: computed(() => isSnapping.value),

    // 方法
    calculateSnap,
    clearSnap,
    getElementRect,
    isWithinSnapDistance,
  };
}
