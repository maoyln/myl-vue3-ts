<template>
  <div
    :data-panel-id="panel.id"
    class="dockable-panel"
    :class="[
      `panel-${panel.state}`,
      `panel-position-${panel.position}`
    ]"
    :style="panelStyle"
    @mousedown="handlePanelClick"
  >
    <!-- 标题栏 -->
    <div 
      class="panel-header"
      @mousedown.stop="handleHeaderMouseDown"
    >
      <div class="panel-title">
        <span class="panel-icon">📋</span>
        {{ panel.title }}
      </div>
      <div class="panel-actions">
        <button 
          v-if="panel.state === 'docked'"
          class="panel-action-btn"
          @click.stop="handleDetach"
          title="分离"
        >
          ⬜
        </button>
        <button 
          v-if="panel.closable !== false"
          class="panel-action-btn"
          @click.stop="handleClose"
          title="关闭"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="panel-content">
      <slot :panel="panel">
        <div class="panel-placeholder">
          <p>面板: {{ panel.title }}</p>
          <p>状态: {{ panel.state }}</p>
          <p>位置: {{ panel.position }}</p>
          <p v-if="panel.dockedWith">停靠在: {{ panel.dockedWith }}</p>
          <p v-if="panel.dockedPanels && panel.dockedPanels.length > 0">
            被停靠: {{ panel.dockedPanels.join(', ') }}
          </p>
        </div>
      </slot>
    </div>

    <!-- 调整大小手柄（仅浮动状态） -->
    <template v-if="panel.state === 'floating' && panel.resizable !== false">
      <div class="resize-handle resize-e" @mousedown.stop="handleResizeStart($event, 'e')"></div>
      <div class="resize-handle resize-s" @mousedown.stop="handleResizeStart($event, 's')"></div>
      <div class="resize-handle resize-se" @mousedown.stop="handleResizeStart($event, 'se')"></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { injectDockManager } from './useDockManager';
import type { PanelInstance } from './types';

interface Props {
  panel: PanelInstance;
}

const props = defineProps<Props>();

const manager = injectDockManager();

// 面板样式
const panelStyle = computed(() => {
  const p = props.panel;
  
  if (p.state === 'docked') {
    // 停靠状态：使用固定定位
    return {
      position: 'fixed',
      left: `${p.x}px`,
      top: `${p.y}px`,
      width: `${p.width}px`,
      height: `${p.height}px`,
      zIndex: p.zIndex,
    };
  } else {
    // 浮动或拖拽状态
    return {
      position: 'fixed',
      left: `${p.x}px`,
      top: `${p.y}px`,
      width: `${p.width}px`,
      height: `${p.height}px`,
      zIndex: p.zIndex,
    };
  }
});

// 点击面板（激活）
function handlePanelClick() {
  manager.activatePanel(props.panel.id);
}

// 标题栏按下（开始拖拽）
function handleHeaderMouseDown(e: MouseEvent) {
  e.preventDefault();
  manager.startDrag(props.panel.id, e.clientX, e.clientY);
}

// 分离面板
function handleDetach() {
  const panel = props.panel;
  panel.state = 'floating';
  panel.position = 'float';
  
  // 从父面板移除引用
  if (panel.dockedWith) {
    const parentPanel = manager.getPanel(panel.dockedWith);
    if (parentPanel && parentPanel.dockedPanels) {
      parentPanel.dockedPanels = parentPanel.dockedPanels.filter(id => id !== panel.id);
    }
    panel.dockedWith = undefined;
  }
  
  // 居中显示
  if (manager.containerRect.value) {
    const rect = manager.containerRect.value;
    panel.x = rect.left + (rect.width - panel.width) / 2;
    panel.y = rect.top + (rect.height - panel.height) / 2;
  }
}

// 关闭面板
function handleClose() {
  manager.removePanel(props.panel.id);
}

// 调整大小
const resizing = ref(false);
const resizeDirection = ref<string>('');
const resizeStartX = ref(0);
const resizeStartY = ref(0);
const resizeStartWidth = ref(0);
const resizeStartHeight = ref(0);

function handleResizeStart(e: MouseEvent, direction: string) {
  e.preventDefault();
  resizing.value = true;
  resizeDirection.value = direction;
  resizeStartX.value = e.clientX;
  resizeStartY.value = e.clientY;
  resizeStartWidth.value = props.panel.width;
  resizeStartHeight.value = props.panel.height;

  document.addEventListener('mousemove', handleResizeMove);
  document.addEventListener('mouseup', handleResizeEnd);
}

function handleResizeMove(e: MouseEvent) {
  if (!resizing.value) return;

  const deltaX = e.clientX - resizeStartX.value;
  const deltaY = e.clientY - resizeStartY.value;

  let newWidth = resizeStartWidth.value;
  let newHeight = resizeStartHeight.value;

  if (resizeDirection.value.includes('e')) {
    newWidth = resizeStartWidth.value + deltaX;
  }
  if (resizeDirection.value.includes('s')) {
    newHeight = resizeStartHeight.value + deltaY;
  }

  manager.resizePanel(props.panel.id, newWidth, newHeight);
}

function handleResizeEnd() {
  resizing.value = false;
  document.removeEventListener('mousemove', handleResizeMove);
  document.removeEventListener('mouseup', handleResizeEnd);
}
</script>

<style scoped>
.dockable-panel {
  background-color: #2d2d2d;
  border: 1px solid #3e3e3e;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: box-shadow 0.2s;
}

.dockable-panel:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.panel-dragging {
  opacity: 0.8;
  cursor: grabbing !important;
}

.panel-docked {
  border-radius: 0;
}

/* 标题栏 */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #3e3e3e;
  border-bottom: 1px solid #555;
  cursor: grab;
  user-select: none;
}

.panel-header:active {
  cursor: grabbing;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e0e0e0;
  font-size: 13px;
  font-weight: 500;
}

.panel-icon {
  font-size: 14px;
}

.panel-actions {
  display: flex;
  gap: 4px;
}

.panel-action-btn {
  width: 24px;
  height: 24px;
  border: none;
  background-color: transparent;
  color: #aaa;
  font-size: 14px;
  cursor: pointer;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s, color 0.2s;
}

.panel-action-btn:hover {
  background-color: #555;
  color: #fff;
}

/* 内容区 */
.panel-content {
  flex: 1;
  overflow: auto;
  padding: 12px;
  color: #e0e0e0;
  background-color: #252525;
}

.panel-placeholder {
  padding: 20px;
  text-align: center;
  color: #888;
  font-size: 12px;
}

.panel-placeholder p {
  margin: 8px 0;
}

/* 调整大小手柄 */
.resize-handle {
  position: absolute;
  background-color: transparent;
  z-index: 10;
}

.resize-e {
  right: 0;
  top: 0;
  width: 4px;
  height: 100%;
  cursor: ew-resize;
}

.resize-s {
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  cursor: ns-resize;
}

.resize-se {
  right: 0;
  bottom: 0;
  width: 12px;
  height: 12px;
  cursor: nwse-resize;
}

.resize-handle:hover {
  background-color: rgba(66, 133, 244, 0.3);
}
</style>
