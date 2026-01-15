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
    <div class="panel-header">
      <!-- 可拖拽的标题区域 -->
      <div 
        class="panel-title"
        @mousedown.stop="handleHeaderMouseDown"
      >
        <span class="panel-icon">📋</span>
        {{ panel.title }}
      </div>
      <!-- 按钮区域（不触发拖拽） -->
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

    <!-- 调整大小手柄 -->
    <template v-if="panel.resizable !== false">
      <!-- 浮动状态：右、下、右下 -->
      <template v-if="panel.state === 'floating'">
        <div class="resize-handle resize-e" @mousedown.stop="handleResizeStart($event, 'e')"></div>
        <div class="resize-handle resize-s" @mousedown.stop="handleResizeStart($event, 's')"></div>
        <div class="resize-handle resize-se" @mousedown.stop="handleResizeStart($event, 'se')"></div>
      </template>
      <!-- 停靠状态：根据位置显示对应的调整手柄 -->
      <template v-else-if="panel.state === 'docked'">
        <div v-if="panel.position === 'left'" class="resize-handle resize-e" @mousedown.stop="handleResizeStart($event, 'e')"></div>
        <div v-if="panel.position === 'right'" class="resize-handle resize-w" @mousedown.stop="handleResizeStart($event, 'w')"></div>
        <div v-if="panel.position === 'top'" class="resize-handle resize-s" @mousedown.stop="handleResizeStart($event, 's')"></div>
        <div v-if="panel.position === 'bottom'" class="resize-handle resize-n" @mousedown.stop="handleResizeStart($event, 'n')"></div>
      </template>
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
    // 停靠状态：使用相对定位，宽高由flex布局控制
    // 根据位置决定使用哪个维度的固定尺寸
    const style: any = {
      zIndex: p.zIndex,
      flex: '0 0 auto',
    };

    // 左右停靠：固定宽度，高度自适应（由flex容器平分）
    if (p.position === 'left' || p.position === 'right') {
      style.width = `${p.width}px`;
      style.height = `${p.height}px`; // 由布局管理器计算的高度
    }
    // 上下停靠：固定高度，宽度自适应（由flex容器平分）
    else if (p.position === 'top' || p.position === 'bottom') {
      style.width = `${p.width}px`; // 由布局管理器计算的宽度
      style.height = `${p.height}px`;
    }

    return style;
  } else {
    // 浮动或拖拽状态：使用固定定位
    return {
      position: 'fixed' as const,
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
  const oldPosition = panel.position;

  // 获取面板当前的实际位置和尺寸（用于转换到浮动状态）
  const panelElement = document.querySelector(`[data-panel-id="${panel.id}"]`);
  if (panelElement) {
    const rect = panelElement.getBoundingClientRect();
    panel.x = rect.left;
    panel.y = rect.top;
    panel.width = rect.width;
    panel.height = rect.height;
  }

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
  
  // 更新原位置的其他停靠面板布局
  if (oldPosition !== 'float' && oldPosition !== 'center') {
    setTimeout(() => {
      manager.updateDockedPanelsByPosition(oldPosition);
    }, 0);
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

  // 根据方向调整尺寸
  if (resizeDirection.value.includes('e')) {
    newWidth = resizeStartWidth.value + deltaX;
  }
  if (resizeDirection.value.includes('w')) {
    newWidth = resizeStartWidth.value - deltaX;
  }
  if (resizeDirection.value.includes('s')) {
    newHeight = resizeStartHeight.value + deltaY;
  }
  if (resizeDirection.value.includes('n')) {
    newHeight = resizeStartHeight.value - deltaY;
  }

  manager.resizePanel(props.panel.id, newWidth, newHeight);
}

function handleResizeEnd() {
  resizing.value = false;
  document.removeEventListener('mousemove', handleResizeMove);
  document.removeEventListener('mouseup', handleResizeEnd);

  // 如果是停靠面板，调整大小后需要更新布局
  const panel = props.panel;
  if (panel.state === 'docked' && panel.position !== 'float' && panel.position !== 'center') {
    // 对于左右停靠，用户调整的是宽度，不影响其他面板
    // 对于上下停靠，用户调整的是高度，不影响其他面板
    // 但我们需要确保尺寸在合理范围内
    manager.updateDockedPanelsByPosition(panel.position);
  }
}
</script>

<style scoped>
.dockable-panel {
  background-color: #2d2d2d;
  border: 1px solid #3e3e3e;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

/* 浮动面板样式 */
.panel-floating {
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.panel-floating:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

/* 拖拽状态 */
.panel-dragging {
  opacity: 0.8;
  cursor: grabbing !important;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
}

/* 停靠面板样式 */
.panel-docked {
  border-radius: 0;
  box-shadow: none;
}

/* 标题栏 */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #3e3e3e;
  border-bottom: 1px solid #555;
  user-select: none;
  gap: 8px;
}

/* 标题区域（可拖拽） */
.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e0e0e0;
  font-size: 13px;
  font-weight: 500;
  flex: 1;
  cursor: grab;
  padding: 4px;
  margin: -4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.panel-title:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.panel-title:active {
  cursor: grabbing;
  background-color: rgba(255, 255, 255, 0.08);
}

.panel-icon {
  font-size: 14px;
}

/* 按钮区域（不可拖拽） */
.panel-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
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
  position: relative;
  z-index: 1;
}

.panel-action-btn:hover {
  background-color: #555;
  color: #fff;
}

.panel-action-btn:active {
  background-color: #666;
  transform: scale(0.95);
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
  transition: background-color 0.2s;
}

.resize-handle:hover {
  background-color: rgba(66, 133, 244, 0.4);
}

/* 东（右） */
.resize-e {
  right: 0;
  top: 0;
  width: 6px;
  height: 100%;
  cursor: ew-resize;
}

/* 西（左） */
.resize-w {
  left: 0;
  top: 0;
  width: 6px;
  height: 100%;
  cursor: ew-resize;
}

/* 南（下） */
.resize-s {
  bottom: 0;
  left: 0;
  width: 100%;
  height: 6px;
  cursor: ns-resize;
}

/* 北（上） */
.resize-n {
  top: 0;
  left: 0;
  width: 100%;
  height: 6px;
  cursor: ns-resize;
}

/* 东南（右下角） */
.resize-se {
  right: 0;
  bottom: 0;
  width: 12px;
  height: 12px;
  cursor: nwse-resize;
}
</style>
