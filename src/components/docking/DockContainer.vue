<template>
  <div 
    ref="containerRef" 
    class="dock-container"
    @mouseup="handleMouseUp"
    @mousemove="handleMouseMove"
  >
    <!-- 主内容区 -->
    <div class="dock-content">
      <slot></slot>
    </div>

    <!-- 热区指示器（拖拽时显示） -->
    <div 
      v-if="hoveredZone" 
      class="dock-zone-indicator"
      :style="getZoneIndicatorStyle(hoveredZone)"
    ></div>

    <!-- 渲染所有面板 -->
    <DockablePanel
      v-for="panel in panelList"
      :key="panel.id"
      :panel="panel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useDockManager } from './useDockManager';
import DockablePanel from './DockablePanel.vue';
import type { DockZone, DockManagerConfig } from './types';

interface Props {
  config?: DockManagerConfig;
}

const props = defineProps<Props>();

// 使用停靠管理器
const manager = useDockManager(props.config);
const { panelList, hoveredZone, dragInfo } = manager;

// 容器引用
const containerRef = ref<HTMLElement | null>(null);

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
}

// 全局鼠标移动
function handleMouseMove(e: MouseEvent) {
  if (dragInfo.value) {
    manager.onDrag(e.clientX, e.clientY);
  }
}

// 全局鼠标释放
function handleMouseUp() {
  if (dragInfo.value) {
    manager.endDrag();
  }
}

// 获取热区指示器样式
function getZoneIndicatorStyle(zone: DockZone) {
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

.dock-content {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
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
</style>
