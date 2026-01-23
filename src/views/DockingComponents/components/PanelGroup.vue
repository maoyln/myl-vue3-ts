<!-- 这是一组面板的容器-存在布局方式 -->
<template>
    <div 
        ref="panelGroupRef"
        class="panel-group" 
        :class="{ 'is-resizing': isResizing }"
        :style="groupStyle"
    >
        <!-- 动态渲染 Panel 和热区 -->
        <template v-for="(panel, index) in group.panels" :key="panel.id">
            <!-- 第一个 Panel 前的热区 -->
            <!-- v-show="index === 0 && shouldShowDropZone" -->
            <div 
                v-show="index === 0 && shouldShowDropZone"
                class="drop-zone"
                :class="{ 'active': activePosition === `before-${index}` }"
                :data-drop-zone="`before-${index}`"
            ></div>

            <!-- Panel 组件 -->
            <Panel 
                :panel="panel" 
                :containerKey="containerKey"
                :direction="direction"
                :isLast="index === group.panels.length - 1"
            />

            <!-- 每个 Panel 后的热区（也是下一个 Panel 之间的热区）-->
             <!-- v-show="shouldShowDropZone" -->
            <div
                v-show="shouldShowDropZone"
                class="drop-zone"
                :class="{ 'active': activePosition === `after-${index}` }"
                :data-drop-zone="`after-${index}`"
            ></div>
        </template>

        <!-- 调整大小信息 -->
        <div v-if="isResizing" class="resize-info">
            {{ Math.round(size.width) }} × {{ Math.round(size.height) }}
        </div>

        <!-- 调整手柄 -->
        <template v-for="handle in resizeHandles" :key="handle.position">
            <div :class="handle.class" :style="{ cursor: handle.cursor }" @mousedown="handle.onMouseDown" />
        </template>
    </div>
</template>

<script setup lang="ts">
import Panel from './Panel.vue';
import { computed, ref, watch, nextTick } from 'vue';
import { useDropZone } from '../useDropZone';
import { useDragDrop } from '../useDragDrop';
import { useDragContext } from '../useDragContext';
import { useResize } from '../useResize';
import { useDockStore } from '../useDockStore';

const props = defineProps<{
    direction: 'row' | 'column';
    group: any;
    containerKey?: string; // 容器位置：'left' | 'right' | 'top' | 'bottom' | 'float'
}>();

const store = useDockStore();

// 组合样式（包含布局方向和尺寸）
// 规则：
// - left/right: 只使用 width，height 为 100%
// - top/bottom: 只使用 height，width 为 100%
// - float: 宽高都使用
const groupStyle = computed(() => {
    const style: Record<string, string> = {
        'flex-direction': props.direction === 'row' ? 'column' : 'row'
    };
    
    const position = props.containerKey || 'float';
    
    // 根据停靠位置应用尺寸约束
    switch (position) {
        case 'left':
        case 'right':
            // 左右侧：只使用宽度，高度 100%
            if (props.group.width) {
                style.width = `${props.group.width}px`;
            }
            style.height = '100%';
            break;
        case 'top':
        case 'bottom':
            // 上下侧：只使用高度，宽度 100%
            style.width = '100%';
            if (props.group.height) {
                style.height = `${props.group.height}px`;
            }
            break;
        case 'float':
        default:
            // 浮动窗体：宽高都使用
            if (props.group.width) {
                style.width = `${props.group.width}px`;
            }
            if (props.group.height) {
                style.height = `${props.group.height}px`;
            }
            break;
    }
    
    return Object.entries(style).map(([key, value]) => `${key}: ${value}`).join('; ');
});

// PanelGroup 引用
const panelGroupRef = ref<HTMLElement | null>(null);

// 使用拖拽处理 hooks
const dragDrop = useDragDrop();
const dragContext = useDragContext();

// 动态生成允许的热区位置
const allowedPositions = computed(() => {
    const positions: string[] = [];
    if (props.group.panels && props.group.panels.length > 0) {
        // 第一个前面
        positions.push('before-0');
        // 每个后面
        for (let i = 0; i < props.group.panels.length; i++) {
            positions.push(`after-${i}`);
        }
    }
    return positions;
});

const dropZone = useDropZone(panelGroupRef, {
    type: 'panelGroup',
    id: props.group.id,
    data: props.group,
    allowedPositions: allowedPositions as any,
    dropZoneClass: 'drop-zone',
    onEnter: (position) => {
        dragDrop.registerDropZone({
            scenario: 'panelGroup',
            position,
            targetId: props.group.id,
            targetData: props.group,
        });
    },
    onLeave: () => {
        // 只有在拖拽未结束时才清除，避免在释放时清除
        if (dragContext.getCurrentDrag().value) {
            dragDrop.clearDropZone();
        }
    },
});

const { shouldShowDropZone, activePosition } = dropZone;

// 监听 panels 变化，确保热区在数据更新后重新初始化
watch(() => props.group.panels, () => {
    // 只在拖拽时重新初始化，避免不必要的性能开销
    if (dragContext.getCurrentDrag().value) {
        nextTick(() => {
            dropZone.initDropZones();
        });
    }
}, { deep: true });

// 根据停靠位置计算允许的调整手柄
// 规则：不需要 sw, nw, ne（左下、左上、右上）
// 浮动窗体不需要 w, n（左侧、上侧）
const allowedHandles = computed<Array<'n' | 's' | 'e' | 'w' | 'se'>>(() => {
    const position = props.containerKey || 'float';
    
    switch (position) {
        case 'left':   // 左侧：只允许右侧和右下角手柄（宽度调整）
            return ['e'];
        case 'right':  // 右侧：只允许左侧手柄（宽度调整）
            return ['w'];
        case 'top':    // 上侧：只允许下侧手柄（高度调整）
            return ['s'];
        case 'bottom': // 下侧：只允许上侧手柄（高度调整）
            return ['n'];
        case 'float':  // 浮动窗体：只允许右侧、下侧、右下角
            return ['e', 's', 'se'];
        default:
            return [];
    }
});

// 使用调整大小 hooks
const { isResizing, size, getHandles } = useResize(panelGroupRef, {
    id: props.group.id,
    type: 'panelGroup',
    minWidth: 100,
    minHeight: 100,
    allowedHandles,
    // 只有浮动窗体才允许改变位置（left/top）
    allowPositionChange: props.containerKey === 'float',
    onSizeChange: (width, height) => {
        const position = props.containerKey || 'float';
        
        // 根据停靠位置，只更新相应的尺寸
        switch (position) {
            case 'left':
            case 'right':
                // 左右侧：只更新宽度，保持原有高度
                store.resizePanelGroup(props.group.id, width, props.group.height);
                break;
            case 'top':
            case 'bottom':
                // 上下侧：只更新高度，保持原有宽度
                store.resizePanelGroup(props.group.id, props.group.width, height);
                break;
            case 'float':
            default:
                // 浮动窗体：宽高都更新
                store.resizePanelGroup(props.group.id, width, height);
                break;
        }
    }
});

// 调整手柄配置
const resizeHandles = computed(() => getHandles());
</script>

<style scoped>

.panel-group {
    display: flex;
    border: 1px solid blue;
    position: relative;
    /* 基础尺寸：默认 100%，但会被 groupStyle 覆盖 */
    width: 100%;
    height: 100%;
    transition: all 0.2s;
    /* 确保内容能够正确撑开 */
    min-width: 0;
    min-height: 0;
    flex-shrink: 0; /* 防止被压缩 */
    /* 确保最后一个 panel 能够填满剩余空间 */
    /* overflow: hidden; */
}

.panel-group.is-resizing {
    user-select: none;
    transition: none;
}

/* 调整大小信息 */
.resize-info {
    position: absolute;
    top: 5px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 10px;
    color: #666;
    background: rgba(255, 255, 255, 0.9);
    padding: 2px 5px;
    border-radius: 3px;
    pointer-events: none;
    z-index: 10001;
}

/* 调整手柄基础样式 */
.resize-handle {
    position: absolute;
    background: transparent;
    z-index: 1000;
}

/* 边缘手柄（上下左右） */
.resize-handle-n {
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    cursor: n-resize;
}

.resize-handle-n:hover {
    background: rgba(64, 158, 255, 0.3);
}

.resize-handle-s {
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    cursor: s-resize;
}

.resize-handle-s:hover {
    background: rgba(64, 158, 255, 0.3);
}

.resize-handle-e {
    top: 0;
    right: 0;
    bottom: 0;
    width: 4px;
    cursor: e-resize;
}

.resize-handle-e:hover {
    background: rgba(64, 158, 255, 0.3);
}

.resize-handle-w {
    top: 0;
    left: 0;
    bottom: 0;
    width: 4px;
    cursor: w-resize;
}

.resize-handle-w:hover {
    background: rgba(64, 158, 255, 0.3);
}

/* 角落手柄 - 只保留右下角 */
.resize-handle-se {
    bottom: 0;
    right: 0;
    width: 12px;
    height: 12px;
    cursor: se-resize;
    background: linear-gradient(-45deg, transparent 0%, transparent 30%, #409eff 30%, #409eff 40%, transparent 40%, transparent 70%, #409eff 70%, #409eff 80%, transparent 80%);
}

.resize-handle-se:hover {
    background: linear-gradient(-45deg, transparent 0%, transparent 30%, #66b1ff 30%, #66b1ff 40%, transparent 40%, transparent 70%, #66b1ff 70%, #66b1ff 80%, transparent 80%);
}

/* 热区基础样式 - Panel 之间的插入热区 */
.drop-zone {
    background: rgba(255, 255, 255, 0);
    border-radius: 3px;
    pointer-events: auto; /* 确保热区能接收鼠标事件 */
    transition: all 0.15s;
    flex-shrink: 0;
    position: relative;
    z-index: 1000; /* PanelGroup 的热区优先级更高，在 PanelContainer 热区之上 */
}

/* 垂直布局（column）- 热区是水平线 */
.panel-group[style*="flex-direction: column"] .drop-zone {
    width: 100%;
    height: 6px;
    margin: -3px 0;
}

/* 水平布局（row）- 热区是垂直线 */
.panel-group[style*="flex-direction: row"] .drop-zone {
    height: 100%;
    width: 6px;
    margin: 0 -3px;
}

/* 激活状态 */
.drop-zone.active {
    background: rgba(3, 124, 245, 0.5);
    box-shadow: 0 0 8px rgba(64, 158, 255, 0.6);
}

/* 垂直布局激活时 */
.panel-group[style*="flex-direction: column"] .drop-zone.active {
    height: 12px;
    margin: -6px 0;
}

/* 水平布局激活时 */
.panel-group[style*="flex-direction: row"] .drop-zone.active {
    width: 12px;
    margin: 0 -6px;
}
</style>