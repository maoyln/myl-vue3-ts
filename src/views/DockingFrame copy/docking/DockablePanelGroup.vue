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
      <div
        ref="tabsContainerRef"
        class="panel-tabs-container"
        :class="{ 'has-hover-zone': showHoverZone }"
        @mousedown.stop="handleTabsMouseDown"
      >
        <div
          v-for="(tab, index) in group.tabs"
          :key="tab.id"
          :data-tab-id="tab.id"
          class="panel-tab"
          :class="{
            'is-active': tab.id === group.activeTabId,
            'is-hot-zone': isTabHotZone(index)
          }"
          @mousedown.stop="handleTabMouseDown($event, tab)"
        >
          <div
            v-if="showInsertIndicator(index)"
            class="insert-indicator"
          ></div>

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

        <div
          v-if="showInsertIndicator(group.tabs.length)"
          class="insert-indicator insert-indicator-end"
        ></div>
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
      <slot :group="group" :activeTab="activeTab">
        <div class="panel-placeholder">
          <p><strong>面板组:</strong> {{ group.id }}</p>
          <p><strong>标签数:</strong> {{ group.tabs.length }}</p>
          <p><strong>当前标签:</strong> {{ activeTab?.title }}</p>
        </div>
      </slot>
    </div>

    <!-- 调整大小手柄 -->
    <template v-if="group.resizable !== false">
      <template v-if="group.state === 'floating'">
        <div class="resize-handle resize-e" @mousedown.stop="handleResizeStart($event, 'e')"></div>
        <div class="resize-handle resize-s" @mousedown.stop="handleResizeStart($event, 's')"></div>
        <div class="resize-handle resize-se" @mousedown.stop="handleResizeStart($event, 'se')"></div>
      </template>
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
    >
      <span class="merge-indicator-text">拖到这里合并标签页</span>
    </div>
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

const isDraggingTab = ref(false);
const tabsContainerRef = ref<HTMLElement | null>(null);
const dragStartPos = ref({ x: 0, y: 0 });
const dragThreshold = 5;
const hasDragged = ref(false);

const showMergeIndicator = computed(() => {
  const tabDragInfo = manager.tabDragInfo?.value;
  if (!tabDragInfo) return false;
  if (manager.hoveredGroup?.value !== props.group.id) return false;
  if (tabDragInfo.groupId === props.group.id) return false;
  const sourceGroup = manager.getPanelGroup(tabDragInfo.groupId);
  if (sourceGroup && sourceGroup.tabs.length === 1) return false;
  return true;
});

function showInsertIndicator(index: number): boolean {
  const tabDragInfo = manager.tabDragInfo?.value;
  if (!tabDragInfo) return false;
  if (tabDragInfo.hoveredGroupId !== props.group.id) return false;
  if (tabDragInfo.insertIndex === undefined) return false;
  return tabDragInfo.insertIndex === index;
}

const showHoverZone = computed(() => {
  const tabDragInfo = manager.tabDragInfo?.value;
  if (!tabDragInfo) return false;
  return tabDragInfo.hoveredGroupId === props.group.id;
});

function isTabHotZone(index: number): boolean {
  const tabDragInfo = manager.tabDragInfo?.value;
  if (!tabDragInfo) return false;
  if (tabDragInfo.hoveredGroupId !== props.group.id) return false;
  if (tabDragInfo.groupId === props.group.id) {
    const sourceTabIndex = props.group.tabs.findIndex(t => t.id === tabDragInfo.tabId);
    if (index === sourceTabIndex || index === sourceTabIndex - 1 || index === sourceTabIndex + 1) {
      return false;
    }
  }
  return true;
}

const activeTab = computed(() => {
  return props.group.tabs.find(tab => tab.id === props.group.activeTabId);
});

const panelStyle = computed(() => {
  const g = props.group;

  if (g.state === 'docked') {
    const style: any = {
      zIndex: g.zIndex,
      flex: '0 0 auto',
    };

    if (g.position === 'left' || g.position === 'right') {
      style.width = `${g.width}px`;
      style.height = `${g.height}px`;
    } else if (g.position === 'top' || g.position === 'bottom') {
      style.width = `${g.width}px`;
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

function handlePanelClick() {
  manager.activatePanelGroup(props.group.id);
}

function handleTabsMouseDown(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (target.closest('.panel-tab')) {
    return;
  }

  e.preventDefault();
  manager.startDragGroup(props.group.id, e.clientX, e.clientY);
}

function handleTabMouseDown(e: MouseEvent, tab: TabItem) {
  e.stopPropagation();

  dragStartPos.value = { x: e.clientX, y: e.clientY };
  hasDragged.value = false;

  const handleMouseMove = (moveEvent: MouseEvent) => {
    const deltaX = Math.abs(moveEvent.clientX - dragStartPos.value.x);
    const deltaY = Math.abs(moveEvent.clientY - dragStartPos.value.y);

    if (deltaX > dragThreshold || deltaY > dragThreshold) {
      if (!hasDragged.value) {
        hasDragged.value = true;
        isDraggingTab.value = true;
        manager.startDragTab(props.group.id, tab.id, moveEvent.clientX, moveEvent.clientY);
      }
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    if (!hasDragged.value) {
      handleTabClick(tab.id);
    }

    isDraggingTab.value = false;
  };

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
}

function handleTabClick(tabId: string) {
  manager.setActiveTab(props.group.id, tabId);
}

function handleTabClose(tabId: string) {
  manager.closeTab(props.group.id, tabId);
}

function handleDetach() {
  const group = props.group;
  const oldPosition = group.position;

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

  if (oldPosition !== 'float') {
    setTimeout(() => {
      manager.updateDockedLayout(oldPosition);
    }, 0);
  }
}

function handleClose() {
  manager.removePanelGroup(props.group.id);
}

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

  manager.resizePanelGroup(props.group.id, newWidth, newHeight);
}

function handleResizeEnd() {
  resizing.value = false;
  document.removeEventListener('mousemove', handleResizeMove);
  document.removeEventListener('mouseup', handleResizeEnd);

  const group = props.group;
  if (group.state === 'docked' && group.position !== 'float') {
    manager.updateDockedLayout(group.position);
  }
}
</script>

<style scoped>
.dockable-panel-group {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: box-shadow 0.2s;
  position: relative;
}

.panel-floating {
  border-radius: 6px;
  border: 1px solid #E5E6EB;
}

/* .panel-floating:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
} */

.panel-dragging {
  opacity: 0.8;
  cursor: grabbing !important;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
}

.panel-docked {
  border-radius: 0;
  box-shadow: none;
}

.panel-tabs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #E5E6EB;
  border-bottom: 1px solid #555;
  user-select: none;
  min-height: 36px;
}

.panel-tabs-container {
  display: flex;
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: #555 transparent;
  cursor: grab;
  padding: 0 4px;
  position: relative;
}

.panel-tabs-container.has-hover-zone {
  background: rgba(74, 144, 226, 0.05);
}

.panel-tabs-container::-webkit-scrollbar {
  height: 3px;
}

.panel-tabs-container::-webkit-scrollbar-thumb {
  background-color: #555;
  border-radius: 3px;
}

.panel-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  min-width: 120px;
  max-width: 200px;
  background-color: rgba(255, 255, 255, 0.03);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  white-space: nowrap;
  flex-shrink: 0;
}

.panel-tab.is-hot-zone {
  background-color: rgba(74, 144, 226, 0.1);
  border-color: rgba(74, 144, 226, 0.3);
}

.insert-indicator {
  position: absolute;
  left: -2px;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, #4A90E2 0%, #6AB0F3 50%, #4A90E2 100%);
  box-shadow: 0 0 8px rgba(74, 144, 226, 0.8);
  z-index: 100;
  animation: insertPulse 0.6s ease-in-out infinite alternate;
}

.insert-indicator-end {
  position: relative;
  width: 3px;
  min-height: 36px;
  background: linear-gradient(to bottom, #4A90E2 0%, #6AB0F3 50%, #4A90E2 100%);
  box-shadow: 0 0 8px rgba(74, 144, 226, 0.8);
  z-index: 100;
  animation: insertPulse 0.6s ease-in-out infinite alternate;
  flex-shrink: 0;
  align-self: stretch;
  margin-left: 2px;
}

@keyframes insertPulse {
  from {
    opacity: 0.6;
    box-shadow: 0 0 8px rgba(74, 144, 226, 0.8);
  }
  to {
    opacity: 1;
    box-shadow: 0 0 12px rgba(106, 176, 243, 1);
  }
}

.panel-tab:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: #005CE6;
}

.panel-tab.is-active {
  border-bottom: 2px solid #4A90E2;
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

.panel-content {
  flex: 1;
  overflow: auto;
  background: #ffffff;
}

.panel-placeholder {
  padding: 20px;
  text-align: center;
  font-size: 12px;
}

.panel-placeholder p {
  margin: 8px 0;
}

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

.merge-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 36px;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.merge-indicator-text {
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

.is-dragging-tab .panel-tabs-container {
  cursor: grabbing;
}
</style>
