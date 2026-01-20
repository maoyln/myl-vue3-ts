<template>
  <div 
    ref="managerRef"
    class="dock-manager-v2"
    @mousemove="handleGlobalMouseMove"
    @mouseup="handleGlobalMouseUp"
  >
    <!-- 所有布局容器 -->
    <DockLayoutContainerV2
      v-for="container in config.containers"
      :key="container.id"
      :container="container"
      @container-drag="handleContainerDrag"
      @container-resize="(w: number, h: number) => handleContainerResize(container.id, { width: w, height: h })"
      @container-dock="handleContainerDock(container.id, $event)"
      @panel-drag-start="handlePanelDragStart"
      @panel-close="handlePanelClose"
      @panel-merge="handlePanelMerge"
      @group-ratio-change="handleGroupRatioChange"
      @panel-ratio-change="handlePanelRatioChange"
      @tab-drag="handleTabDrag"
    />

    <!-- 全局热区预览 -->
    <div
      v-if="showGlobalHotZone"
      class="global-hot-zone"
      :style="globalHotZoneStyle"
    >
      <div class="hot-zone-content">
        <span class="hot-zone-icon">{{ getHotZoneIcon() }}</span>
        <span class="hot-zone-text">{{ getHotZoneText() }}</span>
      </div>
    </div>

    <!-- 拖拽Ghost -->
    <div
      v-if="dragGhost.show"
      class="drag-ghost"
      :style="dragGhostStyle"
    >
      <span class="ghost-title">{{ dragGhost.title }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import type { 
  DockLayoutConfig, 
  DockLayoutContainer,
  PanelGroupV2,
  DockZone,
  DragInfo 
} from './typesV2';
import DockLayoutContainerV2 from './DockLayoutContainerV2.vue';

interface Props {
  config: DockLayoutConfig;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'config-change': [config: DockLayoutConfig];
  'panel-dock': [panelId: string, targetId: string];
  'panel-undock': [panelId: string];
}>();

// ========== 状态 ==========
// 注意：DockManager 的 provide 应该在父组件（如 Berthing02V2）中完成

const managerRef = ref<HTMLElement | null>(null);
const dragInfo = ref<DragInfo | null>(null);
const showGlobalHotZone = ref(false);
const globalHotZoneStyle = ref({});
const currentHotZone = ref<DockZone | null>(null);

const dragGhost = reactive({
  show: false,
  title: '',
  x: 0,
  y: 0,
  width: 200,
  height: 100
});

// ========== 拖拽 Ghost 样式 ==========

const dragGhostStyle = computed(() => ({
  left: `${dragGhost.x}px`,
  top: `${dragGhost.y}px`,
  width: `${dragGhost.width}px`,
  height: `${dragGhost.height}px`
}));

// ========== 面板拖拽 ==========

function handlePanelDragStart(panel: PanelGroupV2, event: MouseEvent) {
  event.preventDefault();

  // 初始化拖拽信息
  dragInfo.value = {
    type: 'panel',
    sourceId: panel.id,
    startX: event.clientX,
    startY: event.clientY,
    currentX: event.clientX,
    currentY: event.clientY,
    offsetX: 0,
    offsetY: 0
  };

  // 显示拖拽 Ghost
  dragGhost.show = true;
  dragGhost.title = panel.tabs[0]?.title || 'Panel';
  dragGhost.x = event.clientX - 100;
  dragGhost.y = event.clientY - 20;
  dragGhost.width = panel.width;
  dragGhost.height = panel.height;
}

function handleGlobalMouseMove(event: MouseEvent) {
  if (!dragInfo.value) return;

  dragInfo.value.currentX = event.clientX;
  dragInfo.value.currentY = event.clientY;

  // 更新 Ghost 位置
  if (dragGhost.show) {
    dragGhost.x = event.clientX - 100;
    dragGhost.y = event.clientY - 20;
  }

  // 检测热区
  detectHotZone(event.clientX, event.clientY);
}

function handleGlobalMouseUp(event: MouseEvent) {
  if (!dragInfo.value) return;

  // 如果有热区，执行停靠/合并操作
  if (currentHotZone.value) {
    performDockOrMerge(dragInfo.value.sourceId, currentHotZone.value);
  }

  // 清理状态
  dragInfo.value = null;
  dragGhost.show = false;
  showGlobalHotZone.value = false;
  currentHotZone.value = null;
}

// ========== 热区检测 ==========

function detectHotZone(mouseX: number, mouseY: number) {
  if (!managerRef.value) return;

  const hotZoneSize = props.config.config.hotZoneSize || 80;
  const rect = managerRef.value.getBoundingClientRect();

  // 检测边缘热区
  if (mouseX < rect.left + hotZoneSize) {
    showHotZone('left', rect.left, rect.top, hotZoneSize, rect.height);
    return;
  }
  if (mouseX > rect.right - hotZoneSize) {
    showHotZone('right', rect.right - hotZoneSize, rect.top, hotZoneSize, rect.height);
    return;
  }
  if (mouseY < rect.top + hotZoneSize) {
    showHotZone('top', rect.left, rect.top, rect.width, hotZoneSize);
    return;
  }
  if (mouseY > rect.bottom - hotZoneSize) {
    showHotZone('bottom', rect.left, rect.bottom - hotZoneSize, rect.width, hotZoneSize);
    return;
  }

  // 检测容器热区
  for (const container of props.config.containers) {
    if (container.position === 'float') continue;
    
    const containerEl = document.querySelector(`[data-container-id="${container.id}"]`);
    if (containerEl) {
      const containerRect = containerEl.getBoundingClientRect();
      if (isPointInRect(mouseX, mouseY, containerRect)) {
        showContainerHotZone(container, containerRect);
        return;
      }
    }
  }

  // 没有热区
  hideHotZone();
}

function showHotZone(position: string, left: number, top: number, width: number, height: number) {
  showGlobalHotZone.value = true;
  
  globalHotZoneStyle.value = {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`
  };

  currentHotZone.value = {
    type: 'edge',
    position: position as any,
    rect: new DOMRect(left, top, width, height)
  };
}

function showContainerHotZone(container: DockLayoutContainer, rect: DOMRect) {
  showGlobalHotZone.value = true;
  
  globalHotZoneStyle.value = {
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`
  };

  currentHotZone.value = {
    type: 'container',
    position: container.position as any,
    targetId: container.id,
    rect: rect
  };
}

function hideHotZone() {
  showGlobalHotZone.value = false;
  currentHotZone.value = null;
}

function isPointInRect(x: number, y: number, rect: DOMRect): boolean {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

// ========== 停靠/合并操作 ==========

function performDockOrMerge(panelId: string, hotZone: DockZone) {
  if (hotZone.type === 'edge') {
    // 创建新的停靠容器
    createDockContainer(panelId, hotZone.position);
  } else if (hotZone.type === 'container' && hotZone.targetId) {
    // 合并到现有容器
    mergeToContainer(panelId, hotZone.targetId);
  }

  emit('config-change', props.config);
}

function createDockContainer(panelId: string, position: any) {
  // 找到面板
  let panel: PanelGroupV2 | null = null;
  for (const container of props.config.containers) {
    for (const group of container.groups) {
      const foundPanel = group.panels.find(p => p.id === panelId);
      if (foundPanel) {
        panel = foundPanel;
        // 从原位置移除
        group.panels = group.panels.filter(p => p.id !== panelId);
        break;
      }
    }
    if (panel) break;
  }

  if (!panel) return;

  // 创建新容器
  const newContainer: DockLayoutContainer = {
    id: `container_${Date.now()}`,
    position: position,
    width: position === 'left' || position === 'right' ? 300 : 600,
    height: position === 'top' || position === 'bottom' ? 200 : 400,
    resizable: true,
    minWidth: 200,
    minHeight: 150,
    groups: [
      {
        id: `group_${Date.now()}`,
        groupRatio: 1,
        direction: 'vertical',
        resizable: true,
        minRatio: 0.1,
        panels: [panel]
      }
    ]
  };

  props.config.containers.push(newContainer);
}

function mergeToContainer(panelId: string, targetContainerId: string) {
  // 找到面板和目标容器
  let panel: PanelGroupV2 | null = null;
  const targetContainer = props.config.containers.find(c => c.id === targetContainerId);
  
  if (!targetContainer || targetContainer.groups.length === 0) return;

  for (const container of props.config.containers) {
    for (const group of container.groups) {
      const foundPanel = group.panels.find(p => p.id === panelId);
      if (foundPanel) {
        panel = foundPanel;
        // 从原位置移除
        group.panels = group.panels.filter(p => p.id !== panelId);
        break;
      }
    }
    if (panel) break;
  }

  if (!panel) return;

  // 添加到目标容器的第一个分组
  targetContainer.groups[0].panels.push(panel);
}

// ========== 热区文本 ==========

function getHotZoneIcon(): string {
  if (!currentHotZone.value) return '';
  
  const icons: Record<string, string> = {
    left: '←',
    right: '→',
    top: '↑',
    bottom: '↓',
    container: '⊕'
  };

  return icons[currentHotZone.value.position] || icons.container;
}

function getHotZoneText(): string {
  if (!currentHotZone.value) return '';
  
  if (currentHotZone.value.type === 'edge') {
    const texts: Record<string, string> = {
      left: '停靠到左侧',
      right: '停靠到右侧',
      top: '停靠到顶部',
      bottom: '停靠到底部'
    };
    return texts[currentHotZone.value.position] || '';
  }

  return '合并到此容器';
}

// ========== 事件处理 ==========

function handleContainerDrag(_event: MouseEvent) {
  // 容器拖拽
}

function handleContainerResize(_containerId: string, _size: { width: number; height: number }) {
  emit('config-change', props.config);
}

function handleContainerDock(containerId: string, position: string) {
  const container = props.config.containers.find(c => c.id === containerId);
  if (container) {
    container.position = position as any;
    emit('config-change', props.config);
  }
}

function handlePanelClose(panelId: string) {
  // 从所有容器中移除面板
  for (const container of props.config.containers) {
    for (const group of container.groups) {
      group.panels = group.panels.filter(p => p.id !== panelId);
    }
    // 清理空分组
    container.groups = container.groups.filter(g => g.panels.length > 0);
  }
  
  // 清理空容器
  props.config.containers = props.config.containers.filter(c => c.groups.length > 0);
  
  emit('config-change', props.config);
}

function handlePanelMerge(_sourcePanelId: string, _targetPanelId: string) {
  // 实现面板合并逻辑
  emit('config-change', props.config);
}

function handleGroupRatioChange(_groupId: string, _newRatio: number) {
  emit('config-change', props.config);
}

function handlePanelRatioChange(_panelId: string, _newRatio: number) {
  emit('config-change', props.config);
}

function handleTabDrag(_event: any) {
  // 处理标签拖拽
}
</script>

<style scoped>
.dock-manager-v2 {
  position: relative;
  width: 100%;
  height: 100%;
  background: #1e1e1e;
  overflow: hidden;
}

/* ========== 全局热区 ========== */

.global-hot-zone {
  position: fixed;
  background: rgba(74, 144, 226, 0.15);
  border: 3px dashed #4A90E2;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 9999;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    background: rgba(74, 144, 226, 0.15);
    border-color: rgba(74, 144, 226, 0.6);
  }
  50% {
    background: rgba(74, 144, 226, 0.25);
    border-color: rgba(74, 144, 226, 1);
  }
}

.hot-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: rgba(74, 144, 226, 0.9);
  color: white;
  padding: 16px 32px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.hot-zone-icon {
  font-size: 32px;
  font-weight: bold;
}

.hot-zone-text {
  font-size: 16px;
  font-weight: 600;
}

/* ========== 拖拽 Ghost ========== */

.drag-ghost {
  position: fixed;
  background: rgba(45, 45, 48, 0.9);
  border: 2px solid #4A90E2;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 10000;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  opacity: 0.8;
}

.ghost-title {
  color: #cccccc;
  font-size: 14px;
  font-weight: 600;
  padding: 8px;
}
</style>
