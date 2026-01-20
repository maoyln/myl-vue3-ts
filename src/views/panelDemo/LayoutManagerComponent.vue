<template>
  <div 
    ref="containerRef"
    class="layout-manager"
  >
    <!-- 停靠容器（三级分层结构） -->
    <div
      v-if="layoutConfig.dockContainerConfig"
      class="dock-container"
      :class="`dock-${layoutConfig.dockContainerConfig.dockPosition}`"
      :style="getDockContainerStyle()"
      :data-dock-position="layoutConfig.dockContainerConfig.dockPosition"
    >
      <!-- 第二级：分组 -->
      <div
        v-for="(group, groupIndex) in layoutConfig.dockContainerConfig.groupList"
        :key="group.groupId"
        class="dock-group"
        :style="getDockGroupStyle(group)"
      >
        <!-- 第三级：面板 -->
        <div
          v-for="(panel, panelIndex) in group.panelList"
          :key="panel.panelId"
          class="dock-panel"
          :style="getDockPanelStyle(panel)"
        >
          <PanelContainer
            :tabs="[panel.tabItem]"
            :active-tab-id="panel.tabItem.id"
            @update:active-tab-id="handleDockTabChange(panel.panelId, $event)"
            @tab-close="handleDockTabClose(panel.panelId, $event)"
          />
          
          <!-- 面板调整手柄 -->
          <div
            v-if="panelIndex < group.panelList.length - 1"
            class="panel-resize-handle"
            :class="isVerticalDock ? 'horizontal' : 'vertical'"
            @mousedown.stop="startResizePanelRatio($event, group.groupId, panel.panelId)"
          >
            <div class="handle-line"></div>
          </div>
        </div>

        <!-- 分组调整手柄 -->
        <div
          v-if="groupIndex < layoutConfig.dockContainerConfig.groupList.length - 1"
          class="group-resize-handle"
          :class="isVerticalDock ? 'vertical' : 'horizontal'"
          @mousedown.stop="startResizeGroupRatio($event, group.groupId)"
        >
          <div class="handle-line"></div>
        </div>
      </div>
    </div>

    <!-- 悬浮面板（fixed定位 + 拖拽） -->
    <div
      v-for="(panelGroup, index) in layoutConfig.floatPanelGroupList"
      :key="panelGroup.id"
      class="float-panel"
      :class="{ 'is-top-most': isTopMost(panelGroup) }"
      :style="getFloatPanelStyle(panelGroup)"
      :data-panel-group-id="panelGroup.id"
      @mousedown="bringToFront(index)"
    >
      <!-- 拖拽手柄（透明覆盖层） -->
      <div
        class="drag-handle"
        @mousedown="startDrag($event, index)"
      ></div>

      <!-- 层级控制按钮 -->
      <div class="layer-controls">
        <button
          class="layer-btn"
          title="置于顶层"
          @click.stop="bringToFront(index)"
        >
          ⬆
        </button>
        <button
          class="layer-btn"
          title="前移一层"
          @click.stop="adjustZIndex(panelGroup.id, 'forward')"
        >
          ↑
        </button>
        <button
          class="layer-btn"
          title="后移一层"
          @click.stop="adjustZIndex(panelGroup.id, 'backward')"
        >
          ↓
        </button>
        <span class="layer-index" title="当前层级">{{ panelGroup.zIndex }}</span>
      </div>

      <!-- 面板内容 -->
      <PanelContainer
        :tabs="panelGroup.tabs"
        :active-tab-id="panelGroup.activeTabId"
        :is-floating="true"
        @update:active-tab-id="handleFloatTabChange(index, $event)"
        @tab-close="handleFloatTabClose(index, $event)"
        @tab-drag-start="handleTabDragStart(panelGroup.id, $event)"
      />

      <!-- 调整大小手柄 -->
      <div v-if="panelGroup.resizable" class="resize-handles">
        <div class="resize-right" @mousedown.stop="startResize($event, index, 'right')"></div>
        <div class="resize-bottom" @mousedown.stop="startResize($event, index, 'bottom')"></div>
        <div class="resize-corner" @mousedown.stop="startResize($event, index, 'corner')"></div>
      </div>
    </div>

    <!-- 热区预览（拖拽时显示） -->
    <div
      v-if="showHotZonePreview && hotZonePreviewStyle"
      class="hot-zone-preview"
      :style="hotZonePreviewStyle"
    >
      <div class="preview-label">{{ getZoneLabel(hoveredZone) }}</div>
    </div>

    <!-- 调试信息面板 -->
    <div v-if="showDebugInfo" class="debug-panel">
      <h3>布局管理器调试信息</h3>
      <div class="debug-info">
        <p><strong>停靠位置:</strong> {{ layoutConfig.dockContainerConfig?.dockPosition || 'N/A' }}</p>
        <p><strong>停靠分组数:</strong> {{ layoutConfig.dockContainerConfig?.groupList.length || 0 }}</p>
        <p><strong>悬浮面板数:</strong> {{ layoutConfig.floatPanelGroupList.length }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { LayoutManagerConfig, DockGroup, DockPanel, PanelGroup, DockZone } from './types';
import PanelContainer from './PanelContainer.vue';
import { usePanelManager } from './usePanelManager';

interface Props {
  config: LayoutManagerConfig;
  showDebugInfo?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showDebugInfo: false
});

const emit = defineEmits<{
  'config-change': [config: LayoutManagerConfig];
  'tab-change': [groupId: string, tabId: string];
  'tab-close': [groupId: string, tabId: string];
}>();

const layoutConfig = ref<LayoutManagerConfig>(props.config);
const containerRef = ref<HTMLElement | null>(null);

// 使用面板管理器
const panelManager = usePanelManager({
  hotZoneSize: props.config.dockManagerConfig.hotZoneSize,
  minPanelWidth: props.config.dockManagerConfig.minPanelWidth,
  minPanelHeight: props.config.dockManagerConfig.minPanelHeight
});

// 监听配置变化
watch(() => props.config, (newConfig) => {
  layoutConfig.value = newConfig;
  panelManager.layoutConfig.value = newConfig;
}, { deep: true });

// 初始化
onMounted(() => {
  if (containerRef.value) {
    panelManager.registerContainer(containerRef.value);
    panelManager.layoutConfig.value = layoutConfig.value;
  }
});

onUnmounted(() => {
  panelManager.unregisterContainer();
});

// 热区相关
const hoveredZone = ref<DockZone>('none');
const showHotZonePreview = computed(() => hoveredZone.value !== 'none');
const hotZonePreviewStyle = computed(() => {
  return panelManager.getHotZonePreviewRect(hoveredZone.value);
});

// 拖拽状态
const isDragging = ref(false);

// ========== 停靠容器样式计算 ==========

const getDockContainerStyle = () => {
  if (!layoutConfig.value.dockContainerConfig) return {};
  
  const { containerSize, dockPosition } = layoutConfig.value.dockContainerConfig;
  const isVertical = dockPosition === 'left' || dockPosition === 'right';

  const baseStyle: any = {
    width: `${containerSize.width}px`,
    height: `${containerSize.height}px`,
    display: 'flex',
    flexDirection: isVertical ? 'row' : 'column'
  };

  const positions = {
    left: { left: '0', top: '0' },
    right: { right: '0', top: '0' },
    top: { top: '0', left: '0' },
    bottom: { bottom: '0', left: '0' }
  };

  return {
    ...baseStyle,
    position: 'absolute' as const,
    ...positions[dockPosition]
  };
};

const getDockGroupStyle = (group: DockGroup) => {
  if (!layoutConfig.value.dockContainerConfig) return {};
  
  const isVertical = layoutConfig.value.dockContainerConfig.dockPosition === 'left' || 
                     layoutConfig.value.dockContainerConfig.dockPosition === 'right';
  
  return {
    flex: `0 0 ${group.groupRatio * 100}%`,
    display: 'flex',
    flexDirection: isVertical ? 'column' : 'row',
    overflow: 'hidden'
  } as any;
};

const getDockPanelStyle = (panel: DockPanel) => {
  return {
    flex: `0 0 ${panel.panelRatio * 100}%`,
    overflow: 'hidden',
    display: 'flex',
    position: 'relative' as const
  };
};

const isVerticalDock = computed(() => {
  if (!layoutConfig.value.dockContainerConfig) return false;
  return layoutConfig.value.dockContainerConfig.dockPosition === 'left' || 
         layoutConfig.value.dockContainerConfig.dockPosition === 'right';
});

// ========== 悬浮面板样式计算 ==========

const getFloatPanelStyle = (panelGroup: PanelGroup) => {
  return {
    position: 'fixed' as const,
    left: `${panelGroup.x}px`,
    top: `${panelGroup.y}px`,
    width: `${panelGroup.width}px`,
    height: `${panelGroup.height}px`,
    zIndex: panelGroup.zIndex
  };
};

// ========== 悬浮面板拖拽 ==========

const startDrag = (event: MouseEvent, index: number) => {
  event.preventDefault();
  
  const panelGroup = layoutConfig.value.floatPanelGroupList[index];
  const startX = event.clientX;
  const startY = event.clientY;
  const startPosX = panelGroup.x;
  const startPosY = panelGroup.y;

  isDragging.value = true;

  const onMouseMove = (e: MouseEvent) => {
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    layoutConfig.value.floatPanelGroupList[index] = {
      ...panelGroup,
      x: startPosX + deltaX,
      y: startPosY + deltaY
    };

    // 检测热区
    hoveredZone.value = panelManager.detectDockZone(e.clientX, e.clientY);
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    
    isDragging.value = false;
    
    // TODO: 如果有热区，执行停靠操作
    if (hoveredZone.value !== 'none') {
      console.log('停靠到:', hoveredZone.value);
      // 这里可以实现停靠逻辑
    }
    
    hoveredZone.value = 'none';
    emit('config-change', layoutConfig.value);
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};

// ========== 悬浮面板调整大小 ==========

const startResize = (event: MouseEvent, index: number, direction: 'right' | 'bottom' | 'corner') => {
  event.preventDefault();
  
  const panelGroup = layoutConfig.value.floatPanelGroupList[index];
  const startX = event.clientX;
  const startY = event.clientY;
  const startWidth = panelGroup.width;
  const startHeight = panelGroup.height;

  const onMouseMove = (e: MouseEvent) => {
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    let newWidth = startWidth;
    let newHeight = startHeight;

    if (direction === 'right' || direction === 'corner') {
      newWidth = Math.max(200, startWidth + deltaX);
    }
    
    if (direction === 'bottom' || direction === 'corner') {
      newHeight = Math.max(150, startHeight + deltaY);
    }

    layoutConfig.value.floatPanelGroupList[index] = {
      ...panelGroup,
      width: newWidth,
      height: newHeight
    };
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    emit('config-change', layoutConfig.value);
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};

// ========== 悬浮面板层级管理 ==========

const bringToFront = (index: number) => {
  const panelGroup = layoutConfig.value.floatPanelGroupList[index];
  panelManager.bringToFront(panelGroup.id);
  emit('config-change', layoutConfig.value);
};

const adjustZIndex = (groupId: string, direction: 'forward' | 'backward') => {
  panelManager.adjustZIndex(groupId, direction);
  emit('config-change', layoutConfig.value);
};

const isTopMost = (panelGroup: PanelGroup) => {
  const maxZ = Math.max(...layoutConfig.value.floatPanelGroupList.map(p => p.zIndex));
  return panelGroup.zIndex === maxZ;
};

// ========== 占比调整 ==========

function startResizeGroupRatio(event: MouseEvent, groupId: string) {
  event.preventDefault();
  
  if (!layoutConfig.value.dockContainerConfig) return;
  
  const groups = layoutConfig.value.dockContainerConfig.groupList;
  const groupIndex = groups.findIndex(g => g.groupId === groupId);
  if (groupIndex === -1 || groupIndex >= groups.length - 1) return;
  
  const currentGroup = groups[groupIndex];
  const nextGroup = groups[groupIndex + 1];
  
  const startPos = isVerticalDock.value ? event.clientX : event.clientY;
  const startRatio1 = currentGroup.groupRatio;
  const startRatio2 = nextGroup.groupRatio;
  const totalRatio = startRatio1 + startRatio2;
  
  const containerSize = isVerticalDock.value 
    ? layoutConfig.value.dockContainerConfig.containerSize.width
    : layoutConfig.value.dockContainerConfig.containerSize.height;

  const onMouseMove = (e: MouseEvent) => {
    const currentPos = isVerticalDock.value ? e.clientX : e.clientY;
    const delta = currentPos - startPos;
    const deltaRatio = delta / containerSize;
    
    let newRatio1 = startRatio1 + deltaRatio;
    let newRatio2 = startRatio2 - deltaRatio;
    
    // 限制最小占比
    const minRatio = 0.1;
    newRatio1 = Math.max(minRatio, Math.min(totalRatio - minRatio, newRatio1));
    newRatio2 = totalRatio - newRatio1;
    
    currentGroup.groupRatio = newRatio1;
    nextGroup.groupRatio = newRatio2;
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    emit('config-change', layoutConfig.value);
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

function startResizePanelRatio(event: MouseEvent, groupId: string, panelId: string) {
  event.preventDefault();
  
  if (!layoutConfig.value.dockContainerConfig) return;
  
  const group = layoutConfig.value.dockContainerConfig.groupList.find(g => g.groupId === groupId);
  if (!group) return;
  
  const panelIndex = group.panelList.findIndex(p => p.panelId === panelId);
  if (panelIndex === -1 || panelIndex >= group.panelList.length - 1) return;
  
  const currentPanel = group.panelList[panelIndex];
  const nextPanel = group.panelList[panelIndex + 1];
  
  const startPos = isVerticalDock.value ? event.clientY : event.clientX;
  const startRatio1 = currentPanel.panelRatio;
  const startRatio2 = nextPanel.panelRatio;
  const totalRatio = startRatio1 + startRatio2;
  
  // 获取分组实际尺寸
  const groupElement = document.querySelector(`[data-group-id="${groupId}"]`) as HTMLElement;
  if (!groupElement) return;
  
  const groupSize = isVerticalDock.value ? groupElement.offsetHeight : groupElement.offsetWidth;

  const onMouseMove = (e: MouseEvent) => {
    const currentPos = isVerticalDock.value ? e.clientY : e.clientX;
    const delta = currentPos - startPos;
    const deltaRatio = delta / groupSize;
    
    let newRatio1 = startRatio1 + deltaRatio;
    let newRatio2 = startRatio2 - deltaRatio;
    
    // 限制最小占比
    const minRatio = 0.1;
    newRatio1 = Math.max(minRatio, Math.min(totalRatio - minRatio, newRatio1));
    newRatio2 = totalRatio - newRatio1;
    
    currentPanel.panelRatio = newRatio1;
    nextPanel.panelRatio = newRatio2;
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    emit('config-change', layoutConfig.value);
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

// ========== 热区相关 ==========

function getZoneLabel(zone: DockZone): string {
  const labels: Record<DockZone, string> = {
    left: '← 左侧停靠',
    right: '右侧停靠 →',
    top: '↑ 顶部停靠',
    bottom: '↓ 底部停靠',
    center: '⊕ 合并到面板',
    none: ''
  };
  return labels[zone];
}

// ========== 事件处理 ==========

const handleDockTabChange = (panelId: string, tabId: string) => {
  emit('tab-change', panelId, tabId);
};

const handleDockTabClose = (panelId: string, tabId: string) => {
  emit('tab-close', panelId, tabId);
};

const handleFloatTabChange = (index: number, tabId: string) => {
  layoutConfig.value.floatPanelGroupList[index] = {
    ...layoutConfig.value.floatPanelGroupList[index],
    activeTabId: tabId
  };
  emit('tab-change', layoutConfig.value.floatPanelGroupList[index].id, tabId);
};

const handleFloatTabClose = (index: number, tabId: string) => {
  const panelGroup = layoutConfig.value.floatPanelGroupList[index];
  const newTabs = panelGroup.tabs.filter(t => t.id !== tabId);
  
  if (newTabs.length === 0) {
    // 删除整个悬浮面板
    layoutConfig.value.floatPanelGroupList.splice(index, 1);
  } else {
    // 更新标签页列表
    const newActiveTabId = tabId === panelGroup.activeTabId ? newTabs[0].id : panelGroup.activeTabId;
    layoutConfig.value.floatPanelGroupList[index] = {
      ...panelGroup,
      tabs: newTabs,
      activeTabId: newActiveTabId
    };
  }
  
  emit('tab-close', panelGroup.id, tabId);
  emit('config-change', layoutConfig.value);
};

// ========== 标签页拖拽 ==========

const handleTabDragStart = (groupId: string, event: { tabId: string, event: MouseEvent }) => {
  const { tabId, event: mouseEvent } = event;
  
  // 开始拖拽标签页
  panelManager.startDragTab(groupId, tabId, mouseEvent.clientX, mouseEvent.clientY);
  
  const onMouseMove = (e: MouseEvent) => {
    panelManager.onDragTab(e.clientX, e.clientY);
    
    // 如果拖出一定距离，拆分为新面板
    const distanceX = Math.abs(e.clientX - mouseEvent.clientX);
    const distanceY = Math.abs(e.clientY - mouseEvent.clientY);
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    
    if (distance > 50 && !panelManager.tabDragInfo.value?.hoveredGroupId) {
      // 拆分为新面板
      const newPanelId = panelManager.splitTabToNewPanel(groupId, tabId, e.clientX - 100, e.clientY - 20);
      
      if (newPanelId) {
        // 清除拖拽状态，开始拖动新面板
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        panelManager.endDragTab();
        
        // 找到新面板的索引并开始拖动
        const newIndex = layoutConfig.value.floatPanelGroupList.findIndex(g => g.id === newPanelId);
        if (newIndex !== -1) {
          startDrag(e, newIndex);
        }
      }
    }
  };
  
  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    
    panelManager.endDragTab();
    emit('config-change', layoutConfig.value);
  };
  
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};
</script>

<style scoped>
.layout-manager {
  position: relative;
  width: 100%;
  height: 100%;
  background: #ffffff;
  overflow: hidden;
}

/* ========== 停靠容器样式 ========== */

.dock-container {
  background: transparent;
  border: 1px solid #E5E6EB;
  box-sizing: border-box;
}

.dock-container.dock-left {
  border-right: 1px solid #E5E6EB;
  border-left: none;
  border-top: none;
  border-bottom: none;
}

.dock-container.dock-right {
  border-left: 1px solid #E5E6EB;
  border-right: none;
  border-top: none;
  border-bottom: none;
}

.dock-container.dock-top {
  border-bottom: 1px solid #E5E6EB;
  border-top: none;
  border-left: none;
  border-right: none;
}

.dock-container.dock-bottom {
  border-top: 1px solid #E5E6EB;
  border-bottom: none;
  border-left: none;
  border-right: none;
}

.dock-group {
  background: transparent;
  box-sizing: border-box;
}

.dock-panel {
  box-sizing: border-box;
  position: relative;
}

/* ========== 占比调整手柄 ========== */

.panel-resize-handle,
.group-resize-handle {
  position: absolute;
  background: transparent;
  z-index: 100;
  transition: background 0.2s;
}

.panel-resize-handle:hover,
.group-resize-handle:hover {
  background: rgba(74, 144, 226, 0.2);
}

.panel-resize-handle.horizontal,
.group-resize-handle.horizontal {
  left: 0;
  right: 0;
  bottom: -3px;
  height: 6px;
  cursor: ns-resize;
}

.panel-resize-handle.vertical,
.group-resize-handle.vertical {
  top: 0;
  bottom: 0;
  right: -3px;
  width: 6px;
  cursor: ew-resize;
}

.handle-line {
  position: absolute;
  background: #4A90E2;
  opacity: 0;
  transition: opacity 0.2s;
}

.panel-resize-handle:hover .handle-line,
.group-resize-handle:hover .handle-line {
  opacity: 0.6;
}

.panel-resize-handle.horizontal .handle-line,
.group-resize-handle.horizontal .handle-line {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 2px;
}

.panel-resize-handle.vertical .handle-line,
.group-resize-handle.vertical .handle-line {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 2px;
  height: 40px;
}

/* ========== 悬浮面板样式 ========== */

.float-panel {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid #E5E6EB;
  border-radius: 6px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  box-sizing: border-box;
}

.float-panel:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

/* 拖拽手柄（透明覆盖层） */
.drag-handle {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
  cursor: move;
  z-index: 10;
  background: transparent;
}

/* 调整大小手柄 */
.resize-handles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.resize-right,
.resize-bottom,
.resize-corner {
  position: absolute;
  pointer-events: auto;
}

.resize-right {
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: ew-resize;
}

.resize-right:hover {
  background: rgba(74, 144, 226, 0.3);
}

.resize-bottom {
  left: 0;
  right: 0;
  bottom: 0;
  height: 4px;
  cursor: ns-resize;
}

.resize-bottom:hover {
  background: rgba(74, 144, 226, 0.3);
}

.resize-corner {
  right: 0;
  bottom: 0;
  width: 12px;
  height: 12px;
  cursor: nwse-resize;
  background: linear-gradient(135deg, transparent 50%, #4A90E2 50%);
}

/* ========== 调试面板样式 ========== */

.debug-panel {
  position: fixed;
  top: 10px;
  left: 10px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #4A90E2;
  border-radius: 4px;
  color: #000000;
  font-size: 12px;
  z-index: 9999;
  max-width: 300px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.debug-panel h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #4A90E2;
}

.debug-info p {
  margin: 4px 0;
}

.debug-info strong {
  color: #000;
}

/* ========== 层级控制按钮 ========== */

.layer-controls {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 20;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 8px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  opacity: 0;
  transition: opacity 0.2s;
}

.float-panel:hover .layer-controls {
  opacity: 1;
}

.layer-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  background: #ffffff;
  border: 1px solid #E5E6EB;
  border-radius: 3px;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.layer-btn:hover {
  background: #4A90E2;
  border-color: #4A90E2;
  color: #ffffff;
}

.layer-index {
  font-size: 11px;
  color: #999;
  margin-left: 4px;
  padding: 2px 6px;
  background: #f5f5f5;
  border-radius: 3px;
  min-width: 24px;
  text-align: center;
}

.float-panel.is-top-most .layer-controls {
  background: rgba(74, 144, 226, 0.1);
  border: 1px solid rgba(74, 144, 226, 0.3);
}

.float-panel.is-top-most .layer-index {
  background: #4A90E2;
  color: #ffffff;
  font-weight: 600;
}

/* ========== 热区预览 ========== */

.hot-zone-preview {
  position: absolute;
  background: rgba(74, 144, 226, 0.2);
  border: 2px dashed #4A90E2;
  border-radius: 8px;
  pointer-events: none;
  z-index: 9998;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    background: rgba(74, 144, 226, 0.2);
  }
  50% {
    background: rgba(74, 144, 226, 0.3);
  }
}

.preview-label {
  font-size: 18px;
  font-weight: 600;
  color: #4A90E2;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.9);
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
