<template>
  <div class="layout-manager">
    <!-- 停靠容器（三级分层结构） -->
    <div
      v-if="layoutConfig.dockContainerConfig"
      class="dock-container"
      :class="`dock-${layoutConfig.dockContainerConfig.dockPosition}`"
      :style="getDockContainerStyle()"
    >
      <!-- 第二级：分组 -->
      <div
        v-for="group in layoutConfig.dockContainerConfig.groupList"
        :key="group.groupId"
        class="dock-group"
        :style="getDockGroupStyle(group)"
      >
        <!-- 第三级：面板 -->
        <div
          v-for="panel in group.panelList"
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
        </div>
      </div>
    </div>

    <!-- 悬浮面板（fixed定位 + 拖拽） -->
    <div
      v-for="(panelGroup, index) in layoutConfig.floatPanelGroupList"
      :key="panelGroup.id"
      class="float-panel"
      :style="getFloatPanelStyle(panelGroup)"
      @mousedown="bringToFront(index)"
    >
      <!-- 拖拽手柄（透明覆盖层） -->
      <div
        class="drag-handle"
        @mousedown="startDrag($event, index)"
      ></div>

      <!-- 面板内容 -->
      <PanelContainer
        :tabs="panelGroup.tabs"
        :active-tab-id="panelGroup.activeTabId"
        @update:active-tab-id="handleFloatTabChange(index, $event)"
        @tab-close="handleFloatTabClose(index, $event)"
      />

      <!-- 调整大小手柄 -->
      <div v-if="panelGroup.resizable" class="resize-handles">
        <div class="resize-right" @mousedown.stop="startResize($event, index, 'right')"></div>
        <div class="resize-bottom" @mousedown.stop="startResize($event, index, 'bottom')"></div>
        <div class="resize-corner" @mousedown.stop="startResize($event, index, 'corner')"></div>
      </div>
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
import { ref } from 'vue';
import type { LayoutManagerConfig, DockGroup, DockPanel, PanelGroup } from './types';
import PanelContainer from './PanelContainer.vue';

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
    display: 'flex'
  };
};

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

  const onMouseMove = (e: MouseEvent) => {
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    layoutConfig.value.floatPanelGroupList[index] = {
      ...panelGroup,
      x: startPosX + deltaX,
      y: startPosY + deltaY
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
  const currentMax = Math.max(...layoutConfig.value.floatPanelGroupList.map(p => p.zIndex));
  if (layoutConfig.value.floatPanelGroupList[index].zIndex < currentMax) {
    layoutConfig.value.floatPanelGroupList[index] = {
      ...layoutConfig.value.floatPanelGroupList[index],
      zIndex: currentMax + 1
    };
  }
};

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
</style>
