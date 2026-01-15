<template>
  <div
    :data-panel-group-id="group.id"
    class="dockable-panel-group"
    :class="[
      `panel-${group.state}`,
      `panel-position-${group.position}`,
      { 'is-dragging-tab': isDraggingTab }
    ]"
    :style="panelStyle"
    @mousedown="handlePanelClick"
  >
    <!-- 标签栏 -->
    <div class="panel-tabs-header">
      <!-- 标签页列表 -->
      <div 
        ref="tabsContainerRef"
        class="panel-tabs-container"
        @mousedown.stop="handleTabsMouseDown"
      >
        <div
          v-for="tab in group.tabs"
          :key="tab.id"
          :data-tab-id="tab.id"
          class="panel-tab"
          :class="{ 'is-active': tab.id === group.activeTabId }"
          @mousedown.stop="handleTabMouseDown($event, tab)"
        >
          <span v-if="tab.icon" class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-title">{{ tab.title }}</span>
          <button
            v-if="tab.closable !== false && group.tabs.length > 1"
            class="tab-close-btn"
            @click.stop="handleTabClose(tab.id)"
            title="关闭标签"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- 右侧操作按钮 -->
      <div class="panel-actions">
        <button
          v-if="group.state === 'docked'"
          class="panel-action-btn"
          @click.stop="handleDetach"
          title="分离"
        >
          ⬜
        </button>
        <button
          v-if="group.tabs.length === 1 && group.tabs[0].closable !== false"
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
      <slot 
        :group="group" 
        :activeTab="activeTab"
      >
        <div class="panel-placeholder">
          <p><strong>面板组:</strong> {{ group.id }}</p>
          <p><strong>标签数:</strong> {{ group.tabs.length }}</p>
          <p><strong>当前标签:</strong> {{ activeTab?.title }}</p>
          <p><strong>状态:</strong> {{ group.state }}</p>
          <p><strong>位置:</strong> {{ group.position }}</p>
        </div>
      </slot>
    </div>

    <!-- 调整大小手柄 -->
    <template v-if="group.resizable !== false">
      <!-- 浮动状态：右、下、右下 -->
      <template v-if="group.state === 'floating'">
        <div class="resize-handle resize-e" @mousedown.stop="handleResizeStart($event, 'e')"></div>
        <div class="resize-handle resize-s" @mousedown.stop="handleResizeStart($event, 's')"></div>
        <div class="resize-handle resize-se" @mousedown.stop="handleResizeStart($event, 'se')"></div>
      </template>
      <!-- 停靠状态：根据位置显示对应的调整手柄 -->
      <template v-else-if="group.state === 'docked'">
        <div v-if="group.position === 'left'" class="resize-handle resize-e" @mousedown.stop="handleResizeStart($event, 'e')"></div>
        <div v-if="group.position === 'right'" class="resize-handle resize-w" @mousedown.stop="handleResizeStart($event, 'w')"></div>
        <div v-if="group.position === 'top'" class="resize-handle resize-s" @mousedown.stop="handleResizeStart($event, 's')"></div>
        <div v-if="group.position === 'bottom'" class="resize-handle resize-n" @mousedown.stop="handleResizeStart($event, 'n')"></div>
      </template>
    </template>

    <!-- 合并预览指示器 -->
    <div 
      v-if="showMergeIndicator" 
      class="merge-indicator"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { injectDockManager } from './useDockManager';
import type { PanelGroup, TabItem } from './types';

interface Props {
  group: PanelGroup;
}

const props = defineProps<Props>();

const manager = injectDockManager();

// 状态
const isDraggingTab = ref(false);
const tabsContainerRef = ref<HTMLElement | null>(null);
const dragStartPos = ref({ x: 0, y: 0 });
const dragThreshold = 5; // 拖拽阈值（像素）
const hasDragged = ref(false);

// 合并指示器状态
const showMergeIndicator = computed(() => {
  return manager.hoveredGroup?.value === props.group.id;
});

// 当前激活的标签
const activeTab = computed(() => {
  return props.group.tabs.find(tab => tab.id === props.group.activeTabId);
});

// 计算标签页总宽度并自动调整面板宽度
const minTabWidth = 120; // 标签页最小宽度
const tabPadding = 24; // 标签页左右内边距总和
const iconWidth = 20; // 图标宽度
const closeButtonWidth = 16; // 关闭按钮宽度
const tabGap = 0; // 标签页之间的间隙

// 监听标签数量变化，自动调整面板宽度
function adjustPanelWidth() {
  if (!props.group.tabs || props.group.tabs.length === 0) return;
  
  // 计算所有标签页需要的总宽度
  let totalTabsWidth = 0;
  props.group.tabs.forEach(tab => {
    // 基础宽度：内边距 + 图标 + 文字 + 关闭按钮
    let tabWidth = tabPadding;
    if (tab.icon) tabWidth += iconWidth;
    if (tab.closable !== false && props.group.tabs.length > 1) {
      tabWidth += closeButtonWidth;
    }
    // 文字宽度估算（每个字符约8px）
    const titleWidth = (tab.title?.length || 0) * 8;
    tabWidth += titleWidth;
    
    // 应用最小宽度
    tabWidth = Math.max(tabWidth, minTabWidth);
    totalTabsWidth += tabWidth;
  });
  
  // 加上操作按钮区域的宽度（约80px）
  const actionsWidth = 80;
  const requiredWidth = totalTabsWidth + actionsWidth;
  
  // 如果需要的宽度大于当前宽度，自动扩展
  if (requiredWidth > props.group.width) {
    const newWidth = Math.min(requiredWidth, 800); // 最大800px
    manager.resizePanelGroup?.(props.group.id, newWidth, props.group.height);
  }
}

// 监听标签页变化
watch(() => props.group.tabs.length, () => {
  adjustPanelWidth();
}, { immediate: true });

// 面板样式
const panelStyle = computed(() => {
  const g = props.group;
  
  if (g.state === 'docked') {
    // 停靠状态：使用相对定位，宽高由flex布局控制
    // 根据位置决定使用哪个维度的固定尺寸
    const style: any = {
      zIndex: g.zIndex,
      flex: '0 0 auto',
    };

    // 左右停靠：固定宽度，高度自适应（由flex容器平分）
    if (g.position === 'left' || g.position === 'right') {
      style.width = `${g.width}px`;
      style.height = `${g.height}px`; // 由布局管理器计算的高度
    }
    // 上下停靠：固定高度，宽度自适应（由flex容器平分）
    else if (g.position === 'top' || g.position === 'bottom') {
      style.width = `${g.width}px`; // 由布局管理器计算的宽度
      style.height = `${g.height}px`;
    }

    return style;
  } else {
    return {
      position: 'fixed' as const,
      left: `${g.x}px`,
      top: `${g.y}px`,
      width: `${g.width}px`,
      height: `${g.height}px`,
      zIndex: g.zIndex,
    };
  }
});

// 点击面板（激活）
function handlePanelClick() {
  manager.activatePanelGroup?.(props.group.id);
}

// 标签页容器按下（拖动整个面板）
function handleTabsMouseDown(e: MouseEvent) {
  // 如果点击的是标签页本身，则不触发
  const target = e.target as HTMLElement;
  if (target.closest('.panel-tab')) {
    return;
  }
  
  e.preventDefault();
  
  // 拖动整个面板组
  manager.startDragGroup?.(props.group.id, e.clientX, e.clientY);
}

// 标签页按下（准备拖动单个标签）
function handleTabMouseDown(e: MouseEvent, tab: TabItem) {
  e.stopPropagation();
  
  // 记录起始位置
  dragStartPos.value = { x: e.clientX, y: e.clientY };
  hasDragged.value = false;
  
  // 监听鼠标移动
  const handleMouseMove = (moveEvent: MouseEvent) => {
    const deltaX = Math.abs(moveEvent.clientX - dragStartPos.value.x);
    const deltaY = Math.abs(moveEvent.clientY - dragStartPos.value.y);
    
    // 超过阈值才开始拖拽
    if (deltaX > dragThreshold || deltaY > dragThreshold) {
      if (!hasDragged.value) {
        hasDragged.value = true;
        isDraggingTab.value = true;
        
        // 启动标签页拖拽
        manager.startDragTab?.(props.group.id, tab.id, moveEvent.clientX, moveEvent.clientY);
      }
    }
  };
  
  // 监听鼠标释放
  const handleMouseUp = (upEvent: MouseEvent) => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    if (!hasDragged.value) {
      // 如果没有拖拽，就是点击，切换标签
      handleTabClick(tab.id);
    }
    
    isDraggingTab.value = false;
  };
  
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
}

// 点击标签页（切换激活）
function handleTabClick(tabId: string) {
  manager.setActiveTab?.(props.group.id, tabId);
}

// 关闭标签页
function handleTabClose(tabId: string) {
  manager.closeTab?.(props.group.id, tabId);
}

// 分离面板
function handleDetach() {
  const group = props.group;
  const oldPosition = group.position;

  // 获取面板组当前的实际位置和尺寸（用于转换到浮动状态）
  const groupElement = document.querySelector(`[data-panel-group-id="${group.id}"]`);
  if (groupElement) {
    const rect = groupElement.getBoundingClientRect();
    group.x = rect.left;
    group.y = rect.top;
    group.width = rect.width;
    group.height = rect.height;
  }

  group.state = 'floating';
  group.position = 'float';

  // 更新原位置的其他停靠面板布局
  if (oldPosition !== 'float' && oldPosition !== 'center') {
    setTimeout(() => {
      manager.updateDockedPanelsByPosition(oldPosition);
    }, 0);
  }
}

// 关闭面板
function handleClose() {
  manager.removePanelGroup?.(props.group.id);
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
  resizeStartWidth.value = props.group.width;
  resizeStartHeight.value = props.group.height;

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
  if (resizeDirection.value.includes('w')) {
    newWidth = resizeStartWidth.value - deltaX;
  }
  if (resizeDirection.value.includes('s')) {
    newHeight = resizeStartHeight.value + deltaY;
  }
  if (resizeDirection.value.includes('n')) {
    newHeight = resizeStartHeight.value - deltaY;
  }

  manager.resizePanelGroup?.(props.group.id, newWidth, newHeight);
}

function handleResizeEnd() {
  resizing.value = false;
  document.removeEventListener('mousemove', handleResizeMove);
  document.removeEventListener('mouseup', handleResizeEnd);

  // 如果是停靠面板组，调整大小后需要更新布局
  const group = props.group;
  if (group.state === 'docked' && group.position !== 'float' && group.position !== 'center') {
    manager.updateDockedPanelsByPosition(group.position);
  }
}
</script>

<style scoped>
.dockable-panel-group {
  background-color: #2d2d2d;
  border: 1px solid #3e3e3e;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: box-shadow 0.2s;
  position: relative;
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

/* 标签栏 */
.panel-tabs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #3e3e3e;
  border-bottom: 1px solid #555;
  user-select: none;
  min-height: 36px;
}

/* 标签页容器 */
.panel-tabs-container {
  display: flex;
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: #555 transparent;
  cursor: grab;
  padding: 0 4px;
}

.panel-tabs-container::-webkit-scrollbar {
  height: 3px;
}

.panel-tabs-container::-webkit-scrollbar-thumb {
  background-color: #555;
  border-radius: 3px;
}

/* 标签页 */
.panel-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  min-width: 120px; /* 增加最小宽度 */
  max-width: 200px;
  background-color: rgba(255, 255, 255, 0.03);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  color: #aaa;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  white-space: nowrap;
  flex-shrink: 0;
}

.panel-tab:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: #ddd;
}

.panel-tab.is-active {
  background-color: #2d2d2d;
  color: #fff;
  border-bottom: 2px solid #4A90E2;
}

.panel-tab.is-active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #4A90E2;
}

.tab-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.tab-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tab-close-btn {
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  background-color: transparent;
  color: #888;
  font-size: 12px;
  cursor: pointer;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  opacity: 0;
}

.panel-tab:hover .tab-close-btn {
  opacity: 1;
}

.tab-close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.tab-close-btn:active {
  background-color: rgba(255, 255, 255, 0.15);
}

/* 操作按钮 */
.panel-actions {
  display: flex;
  gap: 4px;
  padding: 0 8px;
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

.resize-e {
  right: 0;
  top: 0;
  width: 6px;
  height: 100%;
  cursor: ew-resize;
}

.resize-w {
  left: 0;
  top: 0;
  width: 6px;
  height: 100%;
  cursor: ew-resize;
}

.resize-s {
  bottom: 0;
  left: 0;
  width: 100%;
  height: 6px;
  cursor: ns-resize;
}

.resize-n {
  top: 0;
  left: 0;
  width: 100%;
  height: 6px;
  cursor: ns-resize;
}

.resize-se {
  right: 0;
  bottom: 0;
  width: 12px;
  height: 12px;
  cursor: nwse-resize;
}

/* 合并预览指示器 */
.merge-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 36px; /* 只覆盖标签栏区域 */
  border: 3px solid #4A90E2;
  border-bottom: none;
  background: linear-gradient(
    to bottom,
    rgba(74, 144, 226, 0.3) 0%,
    rgba(74, 144, 226, 0.15) 50%,
    rgba(74, 144, 226, 0.05) 100%
  );
  pointer-events: none;
  z-index: 1000;
  animation: pulse 0.6s ease-in-out infinite alternate;
  box-shadow: 
    inset 0 0 20px rgba(74, 144, 226, 0.3),
    0 0 20px rgba(74, 144, 226, 0.5);
}

.merge-indicator::before {
  content: '拖到这里合并标签页';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #4A90E2;
  font-size: 12px;
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  pointer-events: none;
}

@keyframes pulse {
  from {
    opacity: 0.6;
    border-color: #4A90E2;
  }
  to {
    opacity: 1;
    border-color: #6AB0F3;
  }
}

/* 拖拽标签页时 */
.is-dragging-tab .panel-tabs-container {
  cursor: grabbing;
}
</style>
