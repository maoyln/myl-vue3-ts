/**
 * 拖拽状态管理工具类
 * 核心功能：统一管理拖拽全流程的状态
 */

import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { PanelInstance } from './types';

export interface DragStateConfig {
  boundaryPadding?: number; // 边界内边距（确保面板至少部分可见）
  velocitySampleCount?: number; // 速度采样次数
}

export interface DragVelocity {
  vx: number; // 水平速度（px/s）
  vy: number; // 垂直速度（px/s）
  speed: number; // 总速度（px/s）
}

export function useDragState(config?: DragStateConfig) {
  // 配置
  const boundaryPadding = config?.boundaryPadding ?? 50;
  const velocitySampleCount = config?.velocitySampleCount ?? 5;

  // 状态
  const isDragging = ref(false);
  const draggedPanel = ref<PanelInstance | null>(null);
  const startPosition = ref({ x: 0, y: 0 });
  const currentPosition = ref({ x: 0, y: 0 });
  const offset = ref({ x: 0, y: 0 });
  const disableSnap = ref(false); // Alt 键禁用吸附
  const dragCancelled = ref(false);

  // 速度计算相关
  const positionHistory = ref<Array<{ x: number; y: number; time: number }>>([]);
  const velocity = ref<DragVelocity>({ vx: 0, vy: 0, speed: 0 });

  // 初始面板位置（用于取消拖拽）
  const initialPanelPosition = ref({ x: 0, y: 0 });

  /**
   * 开始拖拽
   */
  function startDrag(
    panel: PanelInstance,
    clientX: number,
    clientY: number
  ) {
    isDragging.value = true;
    draggedPanel.value = panel;
    dragCancelled.value = false;

    startPosition.value = { x: clientX, y: clientY };
    currentPosition.value = { x: clientX, y: clientY };
    offset.value = {
      x: clientX - panel.x,
      y: clientY - panel.y,
    };

    // 保存初始位置（用于取消拖拽）
    initialPanelPosition.value = { x: panel.x, y: panel.y };

    // 初始化速度历史
    positionHistory.value = [
      { x: clientX, y: clientY, time: Date.now() },
    ];
    velocity.value = { vx: 0, vy: 0, speed: 0 };
  }

  /**
   * 更新拖拽位置
   */
  function updateDrag(clientX: number, clientY: number) {
    if (!isDragging.value) return;

    currentPosition.value = { x: clientX, y: clientY };

    // 更新速度历史
    positionHistory.value.push({
      x: clientX,
      y: clientY,
      time: Date.now(),
    });

    // 保持最近的 N 个采样点
    if (positionHistory.value.length > velocitySampleCount) {
      positionHistory.value.shift();
    }

    // 计算速度
    calculateVelocity();
  }

  /**
   * 计算拖拽速度
   */
  function calculateVelocity() {
    if (positionHistory.value.length < 2) {
      velocity.value = { vx: 0, vy: 0, speed: 0 };
      return;
    }

    const first = positionHistory.value[0];
    const last = positionHistory.value[positionHistory.value.length - 1];

    const deltaTime = (last.time - first.time) / 1000; // 转换为秒
    if (deltaTime === 0) {
      velocity.value = { vx: 0, vy: 0, speed: 0 };
      return;
    }

    const vx = (last.x - first.x) / deltaTime;
    const vy = (last.y - first.y) / deltaTime;
    const speed = Math.sqrt(vx * vx + vy * vy);

    velocity.value = { vx, vy, speed };
  }

  /**
   * 结束拖拽
   */
  function endDrag() {
    isDragging.value = false;
    draggedPanel.value = null;
    positionHistory.value = [];
    velocity.value = { vx: 0, vy: 0, speed: 0 };
    dragCancelled.value = false;
  }

  /**
   * 取消拖拽（恢复初始位置）
   */
  function cancelDrag() {
    if (!isDragging.value || !draggedPanel.value) return;

    // 恢复初始位置
    draggedPanel.value.x = initialPanelPosition.value.x;
    draggedPanel.value.y = initialPanelPosition.value.y;

    dragCancelled.value = true;
    endDrag();
  }

  /**
   * 计算受边界约束的位置
   */
  function constrainToBoundary(
    x: number,
    y: number,
    width: number,
    height: number,
    containerRect: DOMRect
  ): { x: number; y: number } {
    // 确保面板至少有 boundaryPadding 像素在容器内
    const minX = containerRect.left - width + boundaryPadding;
    const maxX = containerRect.right - boundaryPadding;
    const minY = containerRect.top - height + boundaryPadding;
    const maxY = containerRect.bottom - boundaryPadding;

    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y)),
    };
  }

  /**
   * 获取当前计算的位置（考虑偏移）
   */
  const calculatedPosition = computed(() => {
    return {
      x: currentPosition.value.x - offset.value.x,
      y: currentPosition.value.y - offset.value.y,
    };
  });

  /**
   * 键盘事件处理
   */
  function handleKeyDown(e: KeyboardEvent) {
    // Esc 键取消拖拽
    if (e.key === 'Escape' && isDragging.value) {
      cancelDrag();
    }
    // Alt 键禁用吸附
    if (e.key === 'Alt') {
      disableSnap.value = true;
    }
  }

  function handleKeyUp(e: KeyboardEvent) {
    // 释放 Alt 键恢复吸附
    if (e.key === 'Alt') {
      disableSnap.value = false;
    }
  }

  /**
   * 应用失焦处理
   */
  function handleBlur() {
    if (isDragging.value) {
      cancelDrag();
    }
  }

  // 自动注册键盘和失焦事件
  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    window.removeEventListener('blur', handleBlur);
  });

  return {
    // 状态（只读）
    isDragging: computed(() => isDragging.value),
    draggedPanel: computed(() => draggedPanel.value),
    startPosition: computed(() => startPosition.value),
    currentPosition: computed(() => currentPosition.value),
    calculatedPosition,
    offset: computed(() => offset.value),
    velocity: computed(() => velocity.value),
    disableSnap: computed(() => disableSnap.value),
    dragCancelled: computed(() => dragCancelled.value),

    // 方法
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag,
    constrainToBoundary,
  };
}
