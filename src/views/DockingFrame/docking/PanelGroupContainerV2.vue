<template>
  <div 
    class="panel-group-container-v2"
    :class="[`direction-${config.direction}`, { 'is-resizing': isResizing }]"
    :style="groupContainerStyle"
    :data-group-container-id="config.id"
    :data-group-id="config.id"
  >
    <!-- 面板列表 -->
    <div
      v-for="(panel, panelIndex) in config.panels"
      :key="panel.id"
      class="panel-wrapper"
      :style="getPanelStyle(panel)"
    >
      <!-- 第三级：DockablePanelGroup -->
      <DockablePanelGroup
        :group="panel"
        :panel-ratio="panel.panelRatio"
        :container-direction="containerDirection"
        @drag-start="handlePanelDragStart(panel, $event)"
        @resize-start="handlePanelResizeStart(panel, $event)"
        @tab-drag="handleTabDrag"
        @close="handlePanelClose(panel.id)"
        @merge="handlePanelMerge"
      />

      <!-- 面板间调整手柄 -->
      <div
        v-if="panelIndex < config.panels.length - 1"
        class="panel-resize-handle"
        :class="config.direction"
        @mousedown.stop="startResizePanelRatio($event, panelIndex)"
      >
        <div class="handle-line"></div>
      </div>
    </div>

    <!-- 合并指示器 -->
    <div
      v-if="showMergeIndicator"
      class="merge-indicator"
      :style="mergeIndicatorStyle"
    >
      <span>合并到此分组</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { PanelGroupContainer, PanelGroupV2, LayoutDirection } from './typesV2';
import DockablePanelGroup from './DockablePanelGroup.vue';

interface Props {
  config: PanelGroupContainer;
  containerDirection: LayoutDirection;  // 所在容器的方向
  showGroupResizeHandle?: boolean;  // 是否显示分组调整手柄（已废弃，现在由容器层处理）
}

const props = withDefaults(defineProps<Props>(), {
  showGroupResizeHandle: false
});

const emit = defineEmits<{
  'panel-drag-start': [panel: PanelGroupV2, event: MouseEvent];
  'panel-resize-start': [panel: PanelGroupV2, event: MouseEvent];
  'group-resize': [newRatio: number];
  'panel-ratio-change': [panelId: string, newRatio: number];
  'panel-close': [panelId: string];
  'panel-merge': [sourcePanelId: string, targetPanelId: string];
  'tab-drag': [event: any];
}>();

// ========== 状态 ==========

const isResizing = ref(false);
const showMergeIndicator = ref(false);
const mergeIndicatorStyle = ref({});

// ========== 样式计算 ==========

// 分组容器样式
const groupContainerStyle = computed(() => {
  const direction = props.config.direction === 'horizontal' ? 'row' : 'column';
  return {
    flex: `0 0 ${props.config.groupRatio * 100}%`,
    display: 'flex',
    flexDirection: direction as 'row' | 'column',
    position: 'relative' as const,
    overflow: 'hidden'
  };
});

// 面板样式
const getPanelStyle = (panel: PanelGroupV2) => {
  const ratio = panel.panelRatio || 1 / props.config.panels.length;
  return {
    flex: `0 0 ${ratio * 100}%`,
    position: 'relative' as const,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
    minWidth: '100px',
    minHeight: '100px'
  };
};


// ========== 面板占比调整 ==========

function startResizePanelRatio(event: MouseEvent, panelIndex: number) {
  event.preventDefault();
  
  if (panelIndex >= props.config.panels.length - 1) return;
  
  const currentPanel = props.config.panels[panelIndex];
  const nextPanel = props.config.panels[panelIndex + 1];
  
  const startPos = props.config.direction === 'horizontal' ? event.clientX : event.clientY;
  const startRatio1 = currentPanel.panelRatio || 1 / props.config.panels.length;
  const startRatio2 = nextPanel.panelRatio || 1 / props.config.panels.length;
  const totalRatio = startRatio1 + startRatio2;
  
  // 获取分组容器尺寸
  const target = event.currentTarget as HTMLElement;
  const containerElement = target?.closest('.panel-group-container-v2') as HTMLElement;
  if (!containerElement) return;
  
  const containerSize = props.config.direction === 'horizontal' 
    ? containerElement.offsetWidth 
    : containerElement.offsetHeight;

  isResizing.value = true;

  const onMouseMove = (e: MouseEvent) => {
    const currentPos = props.config.direction === 'horizontal' ? e.clientX : e.clientY;
    const delta = currentPos - startPos;
    const deltaRatio = delta / containerSize;
    
    let newRatio1 = startRatio1 + deltaRatio;
    let newRatio2 = startRatio2 - deltaRatio;
    
    // 限制最小占比
    const minRatio = props.config.minRatio || 0.1;
    newRatio1 = Math.max(minRatio, Math.min(totalRatio - minRatio, newRatio1));
    newRatio2 = totalRatio - newRatio1;
    
    // 更新占比
    currentPanel.panelRatio = newRatio1;
    nextPanel.panelRatio = newRatio2;
    
    emit('panel-ratio-change', currentPanel.id, newRatio1);
    emit('panel-ratio-change', nextPanel.id, newRatio2);
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    isResizing.value = false;
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}


// ========== 事件处理 ==========

function handlePanelDragStart(panel: PanelGroupV2, event: MouseEvent) {
  emit('panel-drag-start', panel, event);
}

function handlePanelResizeStart(panel: PanelGroupV2, event: MouseEvent) {
  emit('panel-resize-start', panel, event);
}

function handleTabDrag(event: any) {
  emit('tab-drag', event);
}

function handlePanelClose(panelId: string) {
  emit('panel-close', panelId);
}

function handlePanelMerge(data: any) {
  emit('panel-merge', data.source, data.target);
}

// ========== 归一化占比 ==========

function normalizePanelRatios() {
  const total = props.config.panels.reduce((sum, p) => sum + (p.panelRatio || 0), 0);
  
  if (total > 0 && Math.abs(total - 1) > 0.01) {
    props.config.panels.forEach(p => {
      if (p.panelRatio) {
        p.panelRatio = p.panelRatio / total;
      }
    });
  }
}

// 监听面板列表变化，归一化占比
watch(() => props.config.panels.length, () => {
  normalizePanelRatios();
});

onMounted(() => {
  normalizePanelRatios();
});
</script>

<style scoped>
.panel-group-container-v2 {
  background: transparent;
  box-sizing: border-box;
  position: relative;
  /* display 和 flexDirection 由 groupContainerStyle 动态设置 */
}

/* 确保面板包装器也能正确布局 */
.panel-group-container-v2 > .panel-wrapper {
  box-sizing: border-box;
}

/* 调试边框（调试时取消注释）*/
/* .panel-group-container-v2 {
  outline: 2px solid green;
  outline-offset: -2px;
}

.panel-wrapper {
  outline: 1px solid blue;
  outline-offset: -1px;
} */

.panel-wrapper {
  position: relative;
  /* flex 由父元素控制 */
  overflow: hidden;
  box-sizing: border-box;
}

/* ========== 面板调整手柄 ========== */

.panel-resize-handle {
  position: absolute;
  background: transparent;
  z-index: 100;
  transition: background 0.2s;
}

.panel-resize-handle:hover {
  background: rgba(74, 144, 226, 0.2);
}

.panel-resize-handle.horizontal {
  top: 0;
  bottom: 0;
  right: -3px;
  width: 6px;
  cursor: ew-resize;
}

.panel-resize-handle.vertical {
  left: 0;
  right: 0;
  bottom: -3px;
  height: 6px;
  cursor: ns-resize;
}

.handle-line {
  position: absolute;
  background: #4A90E2;
  opacity: 0;
  transition: opacity 0.2s;
}

.panel-resize-handle:hover .handle-line {
  opacity: 0.6;
}

.panel-resize-handle.horizontal .handle-line {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 2px;
  height: 40px;
}

.panel-resize-handle.vertical .handle-line {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 2px;
}


/* ========== 合并指示器 ========== */

.merge-indicator {
  position: absolute;
  inset: 0;
  background: rgba(74, 144, 226, 0.1);
  border: 2px dashed #4A90E2;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 1000;
}

.merge-indicator span {
  background: rgba(74, 144, 226, 0.9);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
}

/* ========== 调整状态 ========== */

.panel-group-container-v2.is-resizing {
  user-select: none;
  cursor: inherit;
}
</style>
