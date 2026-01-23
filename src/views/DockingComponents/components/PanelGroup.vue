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
import { computed, ref, watch, nextTick, inject, type Ref } from 'vue';
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

// 判断是否为悬浮状态
const isFloat = computed(() => props.containerKey === 'float');

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
        // float 状态下不注册热区
        if (isFloat.value) return;
        dragDrop.registerDropZone({
            scenario: 'panelGroup',
            position,
            targetId: props.group.id,
            targetData: props.group,
        });
    },
    onLeave: () => {
        // float 状态下不处理离开事件
        if (isFloat.value) return;
        // 只有在拖拽未结束时才清除，避免在释放时清除
        if (dragContext.getCurrentDrag().value) {
            dragDrop.clearDropZone();
        }
    },
});

const { shouldShowDropZone: baseShouldShowDropZone, activePosition } = dropZone;

// 在 float 状态下禁用热区显示
const shouldShowDropZone = computed(() => {
    return !isFloat.value && baseShouldShowDropZone.value;
});

// 监听 panels 变化，确保热区在数据更新后重新初始化（只在非悬浮状态下）
watch(() => props.group.panels, () => {
    // 只在拖拽时重新初始化，避免不必要的性能开销
    if (!isFloat.value && dropZone && dragContext.getCurrentDrag().value) {
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

// 获取 DockContainer 引用
const dockContainerRef = inject<Ref<HTMLElement | null>>('dockContainerRef', ref(null));

// 获取容器尺寸和其他区域的尺寸
const getContainerConstraints = () => {
    if (!dockContainerRef.value) {
        return {
            containerWidth: 0,
            containerHeight: 0,
            leftWidth: 0,
            rightWidth: 0,
            topHeight: 0,
            bottomHeight: 0,
            middleMinWidth: 0,
            middleMinHeight: 0,
            otherGroupsWidth: 0,
            otherGroupsHeight: 0
        };
    }

    const container = dockContainerRef.value;
    const middleEl = container.querySelector('.dock-middle') as HTMLElement;
    const contentEl = container.querySelector('.dock-content') as HTMLElement;

    // 从 store 中获取左右两侧的总宽度（实时更新）
    let leftWidth = 0;
    let rightWidth = 0;
    if (store.dockContainers.left) {
        store.dockContainers.left.groups.forEach(group => {
            leftWidth += group.width || 0;
        });
    }
    if (store.dockContainers.right) {
        store.dockContainers.right.groups.forEach(group => {
            rightWidth += group.width || 0;
        });
    }

    // 从 store 中获取上下两侧的总高度（实时更新）
    let topHeight = 0;
    let bottomHeight = 0;
    if (store.dockContainers.top) {
        store.dockContainers.top.groups.forEach(group => {
            topHeight += group.height || 0;
        });
    }
    if (store.dockContainers.bottom) {
        store.dockContainers.bottom.groups.forEach(group => {
            bottomHeight += group.height || 0;
        });
    }

    // 从 store 中获取当前区域其他 PanelGroup 的总尺寸（不包括当前 PanelGroup）
    const position = props.containerKey || 'float';
    let otherGroupsWidth = 0;
    let otherGroupsHeight = 0;
    
    if (position === 'left' && store.dockContainers.left) {
        store.dockContainers.left.groups.forEach(group => {
            if (group.id !== props.group.id) {
                otherGroupsWidth += group.width || 0;
            }
        });
    } else if (position === 'right' && store.dockContainers.right) {
        store.dockContainers.right.groups.forEach(group => {
            if (group.id !== props.group.id) {
                otherGroupsWidth += group.width || 0;
            }
        });
    } else if (position === 'top' && store.dockContainers.top) {
        store.dockContainers.top.groups.forEach(group => {
            if (group.id !== props.group.id) {
                otherGroupsHeight += group.height || 0;
            }
        });
    } else if (position === 'bottom' && store.dockContainers.bottom) {
        store.dockContainers.bottom.groups.forEach(group => {
            if (group.id !== props.group.id) {
                otherGroupsHeight += group.height || 0;
            }
        });
    }

    return {
        containerWidth: container.offsetWidth || 0,
        containerHeight: container.offsetHeight || 0,
        leftWidth,
        rightWidth,
        topHeight,
        bottomHeight,
        middleMinWidth: middleEl ? parseFloat(getComputedStyle(middleEl).minWidth) || 0 : 0,
        middleMinHeight: contentEl ? parseFloat(getComputedStyle(contentEl).minHeight) || 0 : 0,
        otherGroupsWidth,
        otherGroupsHeight
    };
};

// 计算实际的最大宽度限制
const computedMaxWidth = computed(() => {
    const position = props.containerKey || 'float';
    
    // 依赖 store 中的数据，确保实时更新
    if (position === 'left' || position === 'right') {
        // 访问左右两侧的 store 数据以建立响应式依赖
        const leftContainer = store.dockContainers.left;
        const rightContainer = store.dockContainers.right;
        if (!leftContainer && !rightContainer) return Infinity;
        
        const constraints = getContainerConstraints();
        if (constraints.containerWidth === 0) return Infinity;
        
        if (position === 'left') {
            // 左侧：最大宽度 = 容器总宽度 - 中间最小宽度 - 右侧宽度 - 左侧其他 PanelGroup 的宽度
            const maxWidth = constraints.containerWidth - constraints.middleMinWidth - constraints.rightWidth - constraints.otherGroupsWidth;
            return Math.max(100, maxWidth);
        } else {
            // 右侧：最大宽度 = 容器总宽度 - 中间最小宽度 - 左侧宽度 - 右侧其他 PanelGroup 的宽度
            const maxWidth = constraints.containerWidth - constraints.middleMinWidth - constraints.leftWidth - constraints.otherGroupsWidth;
            return Math.max(100, maxWidth);
        }
    }
    
    // float 状态：最大宽度不超过容器宽度
    if (position === 'float') {
        const constraints = getContainerConstraints();
        return constraints.containerWidth > 0 ? constraints.containerWidth : Infinity;
    }
    
    return Infinity;
});

// 计算实际的最大高度限制
const computedMaxHeight = computed(() => {
    const position = props.containerKey || 'float';
    
    // 依赖 store 中的数据，确保实时更新
    if (position === 'top' || position === 'bottom') {
        // 访问上下两侧的 store 数据以建立响应式依赖
        const topContainer = store.dockContainers.top;
        const bottomContainer = store.dockContainers.bottom;
        if (!topContainer && !bottomContainer) return Infinity;
        
        const constraints = getContainerConstraints();
        if (constraints.containerHeight === 0) return Infinity;
        
        if (position === 'top') {
            // 上侧：最大高度 = 容器总高度 - 中间最小高度 - 下侧高度 - 上侧其他 PanelGroup 的高度
            const maxHeight = constraints.containerHeight - constraints.middleMinHeight - constraints.bottomHeight - constraints.otherGroupsHeight;
            return Math.max(100, maxHeight);
        } else {
            // 下侧：最大高度 = 容器总高度 - 中间最小高度 - 上侧高度 - 下侧其他 PanelGroup 的高度
            const maxHeight = constraints.containerHeight - constraints.middleMinHeight - constraints.topHeight - constraints.otherGroupsHeight;
            return Math.max(100, maxHeight);
        }
    }
    
    // float 状态：最大高度不超过容器高度
    if (position === 'float') {
        const constraints = getContainerConstraints();
        return constraints.containerHeight > 0 ? constraints.containerHeight : Infinity;
    }
    
    return Infinity;
});

// 计算实际的最小宽度限制
const computedMinWidth = computed(() => {
    return 100;
});

// 计算实际的最小高度限制
const computedMinHeight = computed(() => {
    return 100;
});

// 使用调整大小 hooks
const { isResizing, size, getHandles } = useResize(panelGroupRef, {
    id: props.group.id,
    type: 'panelGroup',
    minWidth: computedMinWidth,
    minHeight: computedMinHeight,
    maxWidth: computedMaxWidth,
    maxHeight: computedMaxHeight,
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
    box-sizing: border-box;
    position: relative;
    /* 基础尺寸：默认 100%，但会被 groupStyle 覆盖 */
    width: 100%;
    height: 100%;
    transition: all 0.2s;
    /* 确保内容能够正确撑开 */
    min-width: 0;
    min-height: 0;
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