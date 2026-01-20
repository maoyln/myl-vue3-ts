<template>
  <div 
    ref="containerRef"
    class="dock-layout-container-v2"
    :class="[
      `position-${container.position}`,
      `state-${containerState}`,
      { 'is-dragging': isDragging, 'is-float': container.position === 'float' }
    ]"
    :style="containerStyle"
    :data-container-id="container.id"
    @mousedown="handleContainerMouseDown"
  >
    <!-- 拖拽手柄（仅悬浮时显示） -->
    <div
      v-if="container.position === 'float'"
      class="container-drag-handle"
      @mousedown.stop="startContainerDrag"
    >
      <span class="drag-icon">⋮⋮</span>
    </div>

    <!-- 面板组容器列表 -->
    <template v-for="(group, groupIndex) in container.groups" :key="group.id">
      <PanelGroupContainerV2
        :config="group"
        :container-direction="containerDirection"
        :show-group-resize-handle="false"
        @panel-drag-start="handlePanelDragStart"
        @panel-resize-start="handlePanelResizeStart"
        @group-resize="handleGroupResize(groupIndex, $event)"
        @panel-ratio-change="handlePanelRatioChange"
        @panel-close="handlePanelClose"
        @panel-merge="handlePanelMerge"
        @tab-drag="handleTabDrag"
      />
      
      <!-- 分组间调整手柄（放在容器层） -->
      <div
        v-if="groupIndex < container.groups.length - 1"
        class="group-resize-handle"
        :class="containerDirection"
        @mousedown.stop="startResizeGroupRatio($event, groupIndex)"
      >
        <div class="handle-line"></div>
      </div>
    </template>

    <!-- 容器调整手柄 -->
    <template v-if="container.resizable && containerState === 'docked'">
      <div
        v-if="container.position === 'left'"
        class="container-resize-handle handle-right"
        @mousedown.stop="startContainerResize($event, 'right')"
      ></div>
      <div
        v-if="container.position === 'right'"
        class="container-resize-handle handle-left"
        @mousedown.stop="startContainerResize($event, 'left')"
      ></div>
      <div
        v-if="container.position === 'top'"
        class="container-resize-handle handle-bottom"
        @mousedown.stop="startContainerResize($event, 'bottom')"
      ></div>
      <div
        v-if="container.position === 'bottom'"
        class="container-resize-handle handle-top"
        @mousedown.stop="startContainerResize($event, 'top')"
      ></div>
    </template>

    <!-- 悬浮时的调整手柄 -->
    <template v-if="container.resizable && container.position === 'float'">
      <div class="container-resize-handle handle-right" @mousedown.stop="startContainerResize($event, 'right')"></div>
      <div class="container-resize-handle handle-bottom" @mousedown.stop="startContainerResize($event, 'bottom')"></div>
      <div class="container-resize-handle handle-corner" @mousedown.stop="startContainerResize($event, 'corner')"></div>
    </template>

    <!-- 热区预览 -->
    <div
      v-if="showHotZone"
      class="hot-zone-preview"
      :style="hotZoneStyle"
    >
      <span class="hot-zone-label">{{ hotZoneLabel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { DockLayoutContainer, PanelGroupV2, LayoutDirection } from './typesV2';
import PanelGroupContainerV2 from './PanelGroupContainerV2.vue';

interface Props {
  container: DockLayoutContainer;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'container-drag': [event: MouseEvent];
  'container-resize': [width: number, height: number];
  'container-dock': [position: string];
  'panel-drag-start': [panel: PanelGroupV2, event: MouseEvent];
  'panel-close': [panelId: string];
  'panel-merge': [sourcePanelId: string, targetPanelId: string];
  'group-ratio-change': [groupId: string, newRatio: number];
  'panel-ratio-change': [panelId: string, newRatio: number];
  'tab-drag': [event: any];
}>();

// ========== 状态 ==========

const containerRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const isResizing = ref(false);
const showHotZone = ref(false);
const hotZoneStyle = ref({});
const hotZoneLabel = ref('');

const containerState = computed(() => {
  return props.container.position === 'float' ? 'floating' : 'docked';
});

// ========== 样式计算 ==========

// 容器方向（决定内部分组如何排列）
const containerDirection = computed<LayoutDirection>(() => {
  // 左右停靠：分组纵向排列
  if (props.container.position === 'left' || props.container.position === 'right') {
    return 'vertical';
  }
  // 上下停靠：分组横向排列
  if (props.container.position === 'top' || props.container.position === 'bottom') {
    return 'horizontal';
  }
  // 悬浮：可以是任意方向，默认纵向
  return 'vertical';
});

// 容器样式
const containerStyle = computed(() => {
  const { position, width, height, x, y, zIndex } = props.container;

  if (position === 'float') {
    // 悬浮布局
    const flexDir = containerDirection.value === 'horizontal' ? 'row' : 'column';
    return {
      position: 'fixed' as const,
      left: `${x || 100}px`,
      top: `${y || 100}px`,
      width: `${width}px`,
      height: `${height}px`,
      zIndex: zIndex || 1000,
      display: 'flex',
      flexDirection: flexDir
    };
  }

  // 停靠布局
  const flexDir = containerDirection.value === 'horizontal' ? 'row' : 'column';
  const baseStyle: any = {
    position: 'absolute' as const,
    display: 'flex',
    flexDirection: flexDir
  };

  switch (position) {
    case 'left':
      return {
        ...baseStyle,
        left: '0',
        top: '0',
        width: `${width}px`,
        height: '100%'
      };
    case 'right':
      return {
        ...baseStyle,
        right: '0',
        top: '0',
        width: `${width}px`,
        height: '100%'
      };
    case 'top':
      return {
        ...baseStyle,
        left: '0',
        top: '0',
        width: '100%',
        height: `${height}px`
      };
    case 'bottom':
      return {
        ...baseStyle,
        left: '0',
        bottom: '0',
        width: '100%',
        height: `${height}px`
      };
    default:
      return baseStyle;
  }
});

// ========== 容器拖拽 ==========

function startContainerDrag(event: MouseEvent) {
  if (props.container.position !== 'float') return;
  
  event.preventDefault();
  isDragging.value = true;

  const startX = event.clientX;
  const startY = event.clientY;
  const startPosX = props.container.x || 0;
  const startPosY = props.container.y || 0;

  const onMouseMove = (e: MouseEvent) => {
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    props.container.x = startPosX + deltaX;
    props.container.y = startPosY + deltaY;
    
    emit('container-drag', e);
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    isDragging.value = false;
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

// ========== 容器调整大小 ==========

function startContainerResize(event: MouseEvent, direction: string) {
  event.preventDefault();
  isResizing.value = true;

  const startX = event.clientX;
  const startY = event.clientY;
  const startWidth = props.container.width;
  const startHeight = props.container.height;

  const onMouseMove = (e: MouseEvent) => {
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    let newWidth = startWidth;
    let newHeight = startHeight;

    if (direction === 'right' || direction === 'corner') {
      newWidth = Math.max(props.container.minWidth, startWidth + deltaX);
    }
    if (direction === 'left') {
      newWidth = Math.max(props.container.minWidth, startWidth - deltaX);
    }
    if (direction === 'bottom' || direction === 'corner') {
      newHeight = Math.max(props.container.minHeight, startHeight + deltaY);
    }
    if (direction === 'top') {
      newHeight = Math.max(props.container.minHeight, startHeight - deltaY);
    }

    props.container.width = newWidth;
    props.container.height = newHeight;
    
    emit('container-resize', newWidth, newHeight);
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    isResizing.value = false;
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

// ========== 分组占比调整 ==========

function startResizeGroupRatio(event: MouseEvent, groupIndex: number) {
  event.preventDefault();
  
  if (groupIndex >= props.container.groups.length - 1) return;
  
  const currentGroup = props.container.groups[groupIndex];
  const nextGroup = props.container.groups[groupIndex + 1];
  
  const startPos = containerDirection.value === 'horizontal' ? event.clientX : event.clientY;
  const startRatio1 = currentGroup.groupRatio;
  const startRatio2 = nextGroup.groupRatio;
  const totalRatio = startRatio1 + startRatio2;
  
  // 获取容器尺寸
  const containerSize = containerDirection.value === 'horizontal' 
    ? props.container.width
    : props.container.height;

  const onMouseMove = (e: MouseEvent) => {
    const currentPos = containerDirection.value === 'horizontal' ? e.clientX : e.clientY;
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
    
    emit('group-ratio-change', currentGroup.id, newRatio1);
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

function handleGroupResize(groupIndex: number, newRatio: number) {
  if (groupIndex >= props.container.groups.length - 1) return;
  
  // 这里需要实现分组间占比调整逻辑
  // 与 PanelGroupContainer 中的面板占比调整类似
  emit('group-ratio-change', props.container.groups[groupIndex].id, newRatio);
}

// ========== 事件处理 ==========

function handleContainerMouseDown(_event: MouseEvent) {
  // 点击容器时置顶（如果是悬浮状态）
  if (props.container.position === 'float') {
    // 触发置顶逻辑
  }
}

function handlePanelDragStart(panel: PanelGroupV2, event: MouseEvent) {
  emit('panel-drag-start', panel, event);
}

function handlePanelResizeStart(_panel: PanelGroupV2, _event: MouseEvent) {
  // 处理面板调整大小
}

function handlePanelRatioChange(panelId: string, newRatio: number) {
  emit('panel-ratio-change', panelId, newRatio);
}

function handlePanelClose(panelId: string) {
  emit('panel-close', panelId);
}

function handlePanelMerge(sourcePanelId: string, targetPanelId: string) {
  emit('panel-merge', sourcePanelId, targetPanelId);
}

function handleTabDrag(event: any) {
  emit('tab-drag', event);
}

// ========== 归一化分组占比 ==========

function normalizeGroupRatios() {
  const total = props.container.groups.reduce((sum, g) => sum + g.groupRatio, 0);
  
  if (total > 0 && Math.abs(total - 1) > 0.01) {
    props.container.groups.forEach(g => {
      g.groupRatio = g.groupRatio / total;
    });
  }
}

watch(() => props.container.groups.length, () => {
  normalizeGroupRatios();
});

onMounted(() => {
  normalizeGroupRatios();
});
</script>

<style scoped>
.dock-layout-container-v2 {
  /* display 和 flexDirection 由 containerStyle 动态设置 */
  background: transparent;
  box-sizing: border-box;
  overflow: hidden;
}

/* 确保所有子元素都能正确 flex 布局 */
.dock-layout-container-v2 > * {
  box-sizing: border-box;
}

/* 调试边框（调试时取消注释）*/
/* .dock-layout-container-v2 {
  outline: 2px solid red;
  outline-offset: -2px;
} */

/* ========== 停靠状态样式 ========== */

.dock-layout-container-v2.state-docked {
  border: 1px solid #1e1e1e;
}

.dock-layout-container-v2.position-left {
  border-right: 2px solid #2d2d30;
  border-left: none;
  border-top: none;
  border-bottom: none;
}

.dock-layout-container-v2.position-right {
  border-left: 2px solid #2d2d30;
  border-right: none;
  border-top: none;
  border-bottom: none;
}

.dock-layout-container-v2.position-top {
  border-bottom: 2px solid #2d2d30;
  border-top: none;
  border-left: none;
  border-right: none;
}

.dock-layout-container-v2.position-bottom {
  border-top: 2px solid #2d2d30;
  border-bottom: none;
  border-left: none;
  border-right: none;
}

/* ========== 悬浮状态样式 ========== */

.dock-layout-container-v2.is-float {
  border: 1px solid #3e3e42;
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  background: #252526;
}

.dock-layout-container-v2.is-float.is-dragging {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6);
  opacity: 0.9;
}

/* ========== 拖拽手柄 ========== */

.container-drag-handle {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 32px;
  background: #2d2d30;
  border-bottom: 1px solid #3e3e42;
  cursor: move;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  user-select: none;
}

.drag-icon {
  color: #cccccc;
  font-size: 16px;
  letter-spacing: 2px;
}

.container-drag-handle:hover {
  background: #373738;
}

/* ========== 容器调整手柄 ========== */

.container-resize-handle {
  position: absolute;
  background: transparent;
  z-index: 102;
}

.container-resize-handle:hover {
  background: rgba(74, 144, 226, 0.3);
}

/* 停靠时的调整手柄 */
.container-resize-handle.handle-right {
  top: 0;
  bottom: 0;
  right: -4px;
  width: 8px;
  cursor: ew-resize;
}

.container-resize-handle.handle-left {
  top: 0;
  bottom: 0;
  left: -4px;
  width: 8px;
  cursor: ew-resize;
}

.container-resize-handle.handle-bottom {
  left: 0;
  right: 0;
  bottom: -4px;
  height: 8px;
  cursor: ns-resize;
}

.container-resize-handle.handle-top {
  left: 0;
  right: 0;
  top: -4px;
  height: 8px;
  cursor: ns-resize;
}

/* 悬浮时的调整手柄 */
.is-float .container-resize-handle.handle-corner {
  right: 0;
  bottom: 0;
  width: 16px;
  height: 16px;
  cursor: nwse-resize;
  background: linear-gradient(135deg, transparent 50%, #4A90E2 50%);
}

/* ========== 分组间调整手柄 ========== */

.group-resize-handle {
  flex-shrink: 0;
  background: transparent;
  z-index: 101;
  transition: background 0.2s;
  position: relative;
}

.group-resize-handle:hover {
  background: rgba(74, 144, 226, 0.3);
}

.group-resize-handle.horizontal {
  width: 8px;
  height: 100%;
  cursor: ew-resize;
}

.group-resize-handle.vertical {
  width: 100%;
  height: 8px;
  cursor: ns-resize;
}

.group-resize-handle .handle-line {
  position: absolute;
  background: #2E5C8A;
  opacity: 0;
  transition: opacity 0.2s;
}

.group-resize-handle:hover .handle-line {
  opacity: 0.8;
}

.group-resize-handle.horizontal .handle-line {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 3px;
  height: 60px;
}

.group-resize-handle.vertical .handle-line {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 3px;
}

/* ========== 热区预览 ========== */

.hot-zone-preview {
  position: absolute;
  background: rgba(74, 144, 226, 0.15);
  border: 2px dashed #4A90E2;
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
  }
  50% {
    background: rgba(74, 144, 226, 0.25);
  }
}

.hot-zone-label {
  background: rgba(74, 144, 226, 0.9);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
}
</style>
