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
      <div v-if="topPanels.length > 0 || topPanelGroups.length > 0" class="dock-area dock-top">
        <DockablePanel
          v-for="panel in topPanels"
          :key="panel.id"
          :panel="panel"
        />
        <DockablePanelGroup
          v-for="group in topPanelGroups"
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
        <div v-if="leftPanels.length > 0 || leftPanelGroups.length > 0" class="dock-area dock-left">
          <DockablePanel
            v-for="panel in leftPanels"
            :key="panel.id"
            :panel="panel"
          />
          <DockablePanelGroup
            v-for="group in leftPanelGroups"
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
        <div v-if="rightPanels.length > 0 || rightPanelGroups.length > 0" class="dock-area dock-right">
          <DockablePanel
            v-for="panel in rightPanels"
            :key="panel.id"
            :panel="panel"
          />
          <DockablePanelGroup
            v-for="group in rightPanelGroups"
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
      <div v-if="bottomPanels.length > 0 || bottomPanelGroups.length > 0" class="dock-area dock-bottom">
        <DockablePanel
          v-for="panel in bottomPanels"
          :key="panel.id"
          :panel="panel"
        />
        <DockablePanelGroup
          v-for="group in bottomPanelGroups"
          :key="group.id"
          :group="group"
        >
          <template #default="{ activeTab }">
            <slot name="panel-group-content" :group="group" :activeTab="activeTab" />
          </template>
        </DockablePanelGroup>
      </div>
    </div>

    <!-- 浮动面板（fixed定位） -->
    <DockablePanel
      v-for="panel in floatingPanels"
      :key="panel.id"
      :panel="panel"
    />

    <!-- 浮动面板组（fixed定位） -->
    <DockablePanelGroup
      v-for="group in floatingPanelGroups"
      :key="group.id"
      :group="group"
    >
      <template #default="{ activeTab }">
        <slot name="panel-group-content" :group="group" :activeTab="activeTab">
          <!-- 默认内容 -->
        </slot>
      </template>
    </DockablePanelGroup>

    <!-- 热区指示器（拖拽时显示） -->
    <div 
      v-if="hoveredZone" 
      class="dock-zone-indicator"
      :style="getZoneIndicatorStyle(hoveredZone)"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useDockManager } from './useDockManager';
import DockablePanel from './DockablePanel.vue';
import DockablePanelGroup from './DockablePanelGroup.vue';
import type { DockManagerConfig } from './types';

interface Props {
  config?: DockManagerConfig;
}

const props = defineProps<Props>();

// 使用停靠管理器
const manager = useDockManager(props.config);
const { panelList, panelGroupList, hoveredZone, dragInfo, tabDragInfo } = manager;

// 容器引用
const containerRef = ref<HTMLElement | null>(null);

// 按位置分组面板
const topPanels = computed(() => 
  panelList.value.filter(p => p.state === 'docked' && p.position === 'top')
);

const bottomPanels = computed(() => 
  panelList.value.filter(p => p.state === 'docked' && p.position === 'bottom')
);

const leftPanels = computed(() => 
  panelList.value.filter(p => p.state === 'docked' && p.position === 'left')
);

const rightPanels = computed(() => 
  panelList.value.filter(p => p.state === 'docked' && p.position === 'right')
);

const floatingPanels = computed(() => 
  panelList.value.filter(p => p.state === 'floating' || p.state === 'dragging')
);

// 按位置分组面板组
const topPanelGroups = computed(() => 
  panelGroupList.value.filter(g => g.state === 'docked' && g.position === 'top')
);

const bottomPanelGroups = computed(() => 
  panelGroupList.value.filter(g => g.state === 'docked' && g.position === 'bottom')
);

const leftPanelGroups = computed(() => 
  panelGroupList.value.filter(g => g.state === 'docked' && g.position === 'left')
);

const rightPanelGroups = computed(() => 
  panelGroupList.value.filter(g => g.state === 'docked' && g.position === 'right')
);

const floatingPanelGroups = computed(() => 
  panelGroupList.value.filter(g => g.state === 'floating' || g.state === 'dragging')
);

// 组件挂载
onMounted(() => {
  if (containerRef.value) {
    manager.registerContainer(containerRef.value);
  }
  window.addEventListener('resize', handleResize);
});

// 组件卸载
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

// 窗口大小改变
function handleResize() {
  manager.updateContainerRect();
  
  // 更新所有停靠面板的布局
  const positions: Array<'left' | 'right' | 'top' | 'bottom'> = ['left', 'right', 'top', 'bottom'];
  positions.forEach(pos => {
    manager.updateDockedPanelsByPosition(pos);
  });
}

// 全局鼠标移动
function handleMouseMove(e: MouseEvent) {
  if (dragInfo.value) {
    manager.onDrag(e.clientX, e.clientY);
  }
  if (tabDragInfo.value) {
    manager.onDragTab?.(e.clientX, e.clientY);
  }
}

// 全局鼠标释放
function handleMouseUp() {
  if (dragInfo.value) {
    manager.endDrag();
  }
  if (tabDragInfo.value) {
    manager.endDragTab?.();
  }
}

// 获取热区指示器样式
function getZoneIndicatorStyle(zone: any) {
  const rect = zone.rect;
  return {
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
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

/* Flex 布局容器 */
.dock-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

/* 中间区域（水平布局） */
.dock-middle {
  display: flex;
  flex: 1;
  min-height: 0;
}

/* 停靠区域 */
.dock-area {
  display: flex;
  background-color: #2d2d2d;
  border: 1px solid #3e3e3e;
  overflow: hidden;
}

.dock-top,
.dock-bottom {
  flex-direction: row;
  /* 移除固定的min/max限制，由面板自身的尺寸控制 */
}

.dock-left,
.dock-right {
  flex-direction: column;
  /* 移除固定的min/max限制，由面板自身的尺寸控制 */
}

/* 主内容区 */
.dock-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-width: 0;
  min-height: 0;
}

/* 热区指示器 */
.dock-zone-indicator {
  position: fixed;
  background-color: rgba(66, 133, 244, 0.3);
  border: 2px solid rgba(66, 133, 244, 0.8);
  border-radius: 4px;
  pointer-events: none;
  z-index: 9999;
  transition: all 0.15s ease-out;
}
</style>
