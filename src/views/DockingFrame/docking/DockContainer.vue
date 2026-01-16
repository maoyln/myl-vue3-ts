<template>
  <div
    ref="containerRef"
    class="dock-container"
    @mouseup="handleMouseUp"
    @mousemove="handleMouseMove"
  >
    <!-- Flex 布局容器 -->
    <div class="dock-layout">
      <!-- 顶部停靠区 -->
      <div v-if="topGroups.length > 0" class="dock-area dock-top">
        <DockablePanelGroup
          v-for="group in topGroups"
          :key="group.id"
          :group="group"
        >
          <template #default="{ activeTab }">
            <slot name="panel-group-content" :group="group" :activeTab="activeTab" />
          </template>
        </DockablePanelGroup>
      </div>

      <!-- 中间区域（左-中-右） -->
      <div class="dock-middle">
        <!-- 左侧停靠区 -->
        <div v-if="leftGroups.length > 0" class="dock-area dock-left">
          <DockablePanelGroup
            v-for="group in leftGroups"
            :key="group.id"
            :group="group"
          >
            <template #default="{ activeTab }">
              <slot name="panel-group-content" :group="group" :activeTab="activeTab" />
            </template>
          </DockablePanelGroup>
        </div>

        <!-- 主内容区 -->
        <div class="dock-content">
          <slot></slot>
        </div>

        <!-- 右侧停靠区 -->
        <div v-if="rightGroups.length > 0" class="dock-area dock-right">
          <DockablePanelGroup
            v-for="group in rightGroups"
            :key="group.id"
            :group="group"
          >
            <template #default="{ activeTab }">
              <slot name="panel-group-content" :group="group" :activeTab="activeTab" />
            </template>
          </DockablePanelGroup>
        </div>
      </div>

      <!-- 底部停靠区 -->
      <div v-if="bottomGroups.length > 0" class="dock-area dock-bottom">
        <DockablePanelGroup
          v-for="group in bottomGroups"
          :key="group.id"
          :group="group"
        >
          <template #default="{ activeTab }">
            <slot name="panel-group-content" :group="group" :activeTab="activeTab" />
          </template>
        </DockablePanelGroup>
      </div>
    </div>

    <!-- 浮动面板组 -->
    <DockablePanelGroup
      v-for="group in floatingGroups"
      :key="group.id"
      :group="group"
    >
      <template #default="{ activeTab }">
        <slot name="panel-group-content" :group="group" :activeTab="activeTab" />
      </template>
    </DockablePanelGroup>

    <!-- 热区指示器 -->
    <div
      v-if="hoveredZone"
      class="dock-zone-indicator"
      :style="getZoneIndicatorStyle(hoveredZone)"
    ></div>

    <!-- 标签拖拽预览 -->
    <div
      v-if="tabDragInfo && draggedTab && draggedGroup"
      class="panel-drag-preview"
      :style="getPanelPreviewStyle()"
    >
      <div class="preview-tabs-header">
        <div class="preview-tabs-container">
          <div class="preview-tab active">
            <span v-if="draggedTab.icon" class="tab-icon">{{ draggedTab.icon }}</span>
            <span class="tab-title">{{ draggedTab.title }}</span>
          </div>
        </div>
      </div>
      <div class="preview-content">
        <slot name="panel-group-content" :group="draggedGroup" :activeTab="draggedTab">
          <div class="preview-placeholder">
            <p><strong>{{ draggedTab.title }}</strong></p>
            <p>正在拖拽...</p>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useDockManager } from './useDockManager';
import DockablePanelGroup from './DockablePanelGroup.vue';
import type { DockManagerConfig } from './types';

interface Props {
  config?: DockManagerConfig;
}

const props = defineProps<Props>();

const manager = useDockManager(props.config);
const { panelGroupList, hoveredZone, dragInfo, tabDragInfo } = manager;

const containerRef = ref<HTMLElement | null>(null);

// 按位置分组
const topGroups = computed(() =>
  panelGroupList.value.filter(g => g.state === 'docked' && g.position === 'top')
);

const bottomGroups = computed(() =>
  panelGroupList.value.filter(g => g.state === 'docked' && g.position === 'bottom')
);

const leftGroups = computed(() =>
  panelGroupList.value.filter(g => g.state === 'docked' && g.position === 'left')
);

const rightGroups = computed(() =>
  panelGroupList.value.filter(g => g.state === 'docked' && g.position === 'right')
);

const floatingGroups = computed(() =>
  panelGroupList.value.filter(g => g.state === 'floating' || g.state === 'dragging')
);

// 获取被拖拽的标签
const draggedTab = computed(() => {
  if (!tabDragInfo.value) return null;
  const sourceGroup = manager.getPanelGroup(tabDragInfo.value.groupId);
  if (!sourceGroup) return null;
  return sourceGroup.tabs.find(t => t.id === tabDragInfo.value?.tabId);
});

// 被拖拽的面板组
const draggedGroup = computed(() => {
  if (!tabDragInfo.value) return null;
  return manager.getPanelGroup(tabDragInfo.value.groupId);
});

onMounted(() => {
  if (containerRef.value) {
    manager.registerContainer(containerRef.value);
  }
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

function handleResize() {
  manager.updateContainerRect();
  ['left', 'right', 'top', 'bottom'].forEach(pos => {
    manager.updateDockedLayout(pos as any);
  });
}

function handleMouseMove(e: MouseEvent) {
  if (dragInfo.value) {
    manager.onDrag(e.clientX, e.clientY);
  }
  if (tabDragInfo.value) {
    manager.onDragTab(e.clientX, e.clientY);
  }
}

function handleMouseUp() {
  if (dragInfo.value) {
    manager.endDrag();
  }
  if (tabDragInfo.value) {
    manager.endDragTab();
  }
}

// 热区指示器
function getZoneIndicatorStyle(zone: any) {
  const rect = zone.rect;
  return {
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  };
}

// 面板拖拽预览样式
function getPanelPreviewStyle() {
  if (!tabDragInfo.value || !draggedGroup.value) return {};
  const width = draggedGroup.value.width || 280;
  const height = draggedGroup.value.height || 300;
  return {
    left: `${tabDragInfo.value.currentX - 80}px`,
    top: `${tabDragInfo.value.currentY - 20}px`,
    width: `${width}px`,
    height: `${height}px`,
  };
}

// 暴露管理器给父组件
defineExpose({
  manager,
});
</script>

<style scoped>
.dock-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #1e1e1e;
}

.dock-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.dock-middle {
  display: flex;
  flex: 1;
  min-height: 0;
}

.dock-area {
  display: flex;
  background-color: #2d2d2d;
  border: 1px solid #3e3e3e;
  overflow: hidden;
}

.dock-top,
.dock-bottom {
  flex-direction: row;
}

.dock-left,
.dock-right {
  flex-direction: column;
}

.dock-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-width: 0;
  min-height: 0;
}

.dock-zone-indicator {
  position: fixed;
  background-color: rgba(66, 133, 244, 0.3);
  border: 2px solid rgba(66, 133, 244, 0.8);
  border-radius: 4px;
  pointer-events: none;
  z-index: 9999;
  transition: all 0.15s ease-out;
}

.panel-drag-preview {
  position: fixed;
  display: flex;
  flex-direction: column;
  background-color: #2d2d2d;
  border: 2px solid #4A90E2;
  border-radius: 6px;
  pointer-events: none;
  z-index: 10000;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
  opacity: 0.85;
  overflow: hidden;
}

.preview-tabs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #3e3e3e;
  border-bottom: 1px solid #555;
  min-height: 36px;
}

.preview-tabs-container {
  display: flex;
  flex: 1;
  padding: 0 4px;
}

.preview-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  min-width: 120px;
  background-color: #2d2d2d;
  color: #fff;
  font-size: 13px;
  white-space: nowrap;
  border-bottom: 2px solid #4A90E2;
}

.preview-tab .tab-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.preview-tab .tab-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-content {
  flex: 1;
  overflow: hidden;
  background-color: #252525;
  color: #e0e0e0;
}

.preview-placeholder {
  padding: 20px;
  text-align: center;
  color: #888;
  font-size: 12px;
}

.preview-placeholder p {
  margin: 8px 0;
}
</style>
