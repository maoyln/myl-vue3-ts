<!-- 这是一个基础的面板组件面板中可以有多个tabs，每个tabs可以有多个内容 -->
<template>
    <div 
        ref="panelRef"
        class="panel"
        :class="{ 'is-resizing': isResizing }"
        :style="panelStyle"
    >

        <!-- Tabs 组件（如果有 tabs） -->
        <Tabs
            v-if="panel.tabs && panel.tabs.length > 0"
            :tabs="panel.tabs"
            :default-active-id="panel.tabs?.[0]?.id"
            :closable="true"
            :panel-id="panel.id"
            :panel-data="panel"
            @tab-change="handleTabChange"
        />

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
import { ref, computed } from 'vue';
import { useResize } from '../useResize';
import { useDockStore } from '../useDockStore';
import { useDragContext } from '../useDragContext';
import Tabs from './Tabs.vue';

const props = defineProps<{
    panel: any;
    containerKey?: string; // 容器位置：'left' | 'right' | 'top' | 'bottom' | 'float'
    direction?: 'row' | 'column'; // PanelGroup 的布局方向
    isLast?: boolean; // 是否是最后一个 panel（需要填满剩余空间）
}>();

const store = useDockStore();

// 面板引用
const panelRef = ref<HTMLElement | null>(null);

// 计算 Panel 的样式
// 规则：
// - left/right + row direction: 只使用 height，width 为 100%，最后一个 flex: 1
// - top/bottom + column direction: 只使用 width，height 为 100%，最后一个 flex: 1
// - float: 宽高都使用
const panelStyle = computed(() => {
    const style: Record<string, string> = {};
    const position = props.containerKey || 'float';
    const dir = props.direction || 'row';
    
    // 如果是最后一个 panel，需要填满剩余空间
    if (props.isLast) {
        style.flex = '1';
        style.minWidth = '0';
        style.minHeight = '0';
    } else {
        style.flexShrink = '0';
        style.flexGrow = '0';
    }
    
    // 根据停靠位置和布局方向应用尺寸约束
    if (position === 'float') {
        // 浮动窗体：宽高都使用
        if (props.panel.width) {
            style.width = `${props.panel.width}px`;
        }
        if (props.panel.height) {
            style.height = `${props.panel.height}px`;
        }
    } else if ((position === 'left' || position === 'right') && dir === 'row') {
        // 左右侧 + row 布局：只使用高度，宽度 100%
        style.width = '100%';
        if (!props.isLast && props.panel.height) {
            // 非最后一个 panel 使用指定高度
            style.height = `${props.panel.height}px`;
        }
        // 最后一个 panel 的高度由 flex: 1 自动填满
    } else if ((position === 'top' || position === 'bottom') && dir === 'column') {
        // 上下侧 + column 布局：只使用宽度，高度 100%
        if (!props.isLast && props.panel.width) {
            // 非最后一个 panel 使用指定宽度
            style.width = `${props.panel.width}px`;
        }
        style.height = '100%';
        // 最后一个 panel 的宽度由 flex: 1 自动填满
    } else {
        // 默认：宽高都 100%
        style.width = '100%';
        style.height = '100%';
    }
    
    return Object.entries(style).map(([key, value]) => `${key}: ${value}`).join('; ');
});

// 根据停靠位置和布局方向计算允许的调整手柄
// 规则：
// - left/right + row: 只允许 s（下侧手柄，调整高度）
// - top/bottom + column: 只允许 e（右侧手柄，调整宽度）
// - float: 只允许 w, s（左侧、下侧手柄）
const allowedHandles = computed<Array<'n' | 's' | 'e' | 'w'>>(() => {
    const position = props.containerKey || 'float';
    const dir = props.direction || 'row';
    
    if (position === 'float') {
        // 悬浮状态：只允许左侧和下侧手柄
        return ['w', 's'];
    } else if ((position === 'left' || position === 'right') && dir === 'row') {
        // 左右侧 + row 布局：只允许下侧手柄（调整高度）
        return ['s'];
    } else if ((position === 'top' || position === 'bottom') && dir === 'column') {
        // 上下侧 + column 布局：只允许右侧手柄（调整宽度）
        return ['e'];
    }
    
    return [];
});

// 计算最小/最大尺寸（从 panel 对象获取，如果没有则使用默认值）
const baseMinWidth = computed(() => props.panel.minWidth || 50);
const baseMinHeight = computed(() => props.panel.minHeight || 50);
const baseMaxWidth = computed(() => props.panel.maxWidth || Infinity);
const baseMaxHeight = computed(() => props.panel.maxHeight || Infinity);

// 计算考虑相邻 panel 约束后的实际最小/最大尺寸
// 规则：调整当前 panel 时，相邻 panel 会反向变化，需要确保相邻 panel 不超出其边界
const effectiveMinWidth = computed(() => {
    const position = props.containerKey || 'float';
    const dir = props.direction || 'row';
    
    // 只有 column 布局才需要考虑相邻 panel 的宽度约束
    if ((position === 'top' || position === 'bottom') && dir === 'column') {
        const constraints = store.getAdjacentPanelConstraints(props.panel.id, dir);
        if (constraints) {
            // 当前 panel 减小 -> 相邻 panel 增大
            // 相邻 panel 最多能增大到 max，所以当前 panel 最多能减小：currentWidth - (nextMax - nextCurrent)
            // 但当前 panel 本身也有 minWidth 限制
            const currentWidth = props.panel.width || props.panel.originalWidth || 200;
            const minFromAdjacent = currentWidth - (constraints.max - constraints.current);
            // 取两者中的较大值（更严格的限制）
            return Math.max(baseMinWidth.value, minFromAdjacent);
        }
    }
    return baseMinWidth.value;
});

const effectiveMaxWidth = computed(() => {
    const position = props.containerKey || 'float';
    const dir = props.direction || 'row';
    
    // 只有 column 布局才需要考虑相邻 panel 的宽度约束
    if ((position === 'top' || position === 'bottom') && dir === 'column') {
        const constraints = store.getAdjacentPanelConstraints(props.panel.id, dir);
        if (constraints) {
            // 当前 panel 增大 -> 相邻 panel 减小
            // 相邻 panel 最多能减小到 min，所以当前 panel 最多能增大：currentWidth + (nextCurrent - nextMin)
            // 但当前 panel 本身也有 maxWidth 限制
            const currentWidth = props.panel.width || props.panel.originalWidth || 200;
            const maxFromAdjacent = currentWidth + (constraints.current - constraints.min);
            // 取两者中的较小值（更严格的限制）
            return Math.min(baseMaxWidth.value, maxFromAdjacent);
        }
    }
    return baseMaxWidth.value;
});

const effectiveMinHeight = computed(() => {
    const position = props.containerKey || 'float';
    const dir = props.direction || 'row';
    
    // 只有 row 布局才需要考虑相邻 panel 的高度约束
    if ((position === 'left' || position === 'right') && dir === 'row') {
        const constraints = store.getAdjacentPanelConstraints(props.panel.id, dir);
        if (constraints) {
            // 当前 panel 减小 -> 相邻 panel 增大
            // 相邻 panel 最多能增大到 max，所以当前 panel 最多能减小：currentHeight - (nextMax - nextCurrent)
            // 但当前 panel 本身也有 minHeight 限制
            const currentHeight = props.panel.height || props.panel.originalHeight || 150;
            const minFromAdjacent = currentHeight - (constraints.max - constraints.current);
            // 取两者中的较大值（更严格的限制）
            return Math.max(baseMinHeight.value, minFromAdjacent);
        }
    }
    return baseMinHeight.value;
});

const effectiveMaxHeight = computed(() => {
    const position = props.containerKey || 'float';
    const dir = props.direction || 'row';
    
    // 只有 row 布局才需要考虑相邻 panel 的高度约束
    if ((position === 'left' || position === 'right') && dir === 'row') {
        const constraints = store.getAdjacentPanelConstraints(props.panel.id, dir);
        if (constraints) {
            // 当前 panel 增大 -> 相邻 panel 减小
            // 相邻 panel 最多能减小到 min，所以当前 panel 最多能增大：currentHeight + (nextCurrent - nextMin)
            // 但当前 panel 本身也有 maxHeight 限制
            const currentHeight = props.panel.height || props.panel.originalHeight || 150;
            const maxFromAdjacent = currentHeight + (constraints.current - constraints.min);
            // 取两者中的较小值（更严格的限制）
            return Math.min(baseMaxHeight.value, maxFromAdjacent);
        }
    }
    return baseMaxHeight.value;
});

// 使用调整大小 hooks（只有非最后一个 panel 才需要调整大小）
// 注意：传递 computed ref，让 useResize 支持响应式约束
const { isResizing, size, getHandles } = useResize(panelRef, {
    id: props.panel.id,
    type: 'panel',
    minWidth: effectiveMinWidth,
    minHeight: effectiveMinHeight,
    maxWidth: effectiveMaxWidth,
    maxHeight: effectiveMaxHeight,
    allowedHandles,
    // Panel 不允许改变位置（left/top）
    allowPositionChange: false,
    onSizeChange: (width, height) => {
        const position = props.containerKey || 'float';
        const dir = props.direction || 'row';
        
        // 根据停靠位置和布局方向，只更新相应的尺寸
        if (position === 'float') {
            // 浮动窗体：宽高都更新（不影响相邻 panel）
            store.resizePanel(props.panel.id, width, height);
        } else if ((position === 'left' || position === 'right') && dir === 'row') {
            // 左右侧 + row 布局：只更新高度，影响相邻 panel
            store.resizePanelWithAdjacent(
                props.panel.id,
                props.panel.width || props.panel.originalWidth || 200,
                height,
                dir
            );
        } else if ((position === 'top' || position === 'bottom') && dir === 'column') {
            // 上下侧 + column 布局：只更新宽度，影响相邻 panel
            store.resizePanelWithAdjacent(
                props.panel.id,
                width,
                props.panel.height || props.panel.originalHeight || 150,
                dir
            );
        }
    }
});

// 监听拖拽状态，拖拽 tab 或 panel 时隐藏 resize-handle
const dragContext = useDragContext();
const isDraggingTabOrPanel = computed(() => {
    const currentDrag = dragContext.getCurrentDrag().value;
    return currentDrag && (currentDrag.type === 'tab' || currentDrag.type === 'panel');
});

// 调整手柄配置（只有非最后一个 panel 才显示手柄，且拖拽 tab 或 panel 时隐藏）
const resizeHandles = computed(() => {
    // 最后一个 panel 不需要调整大小手柄（它会自动填满剩余空间）
    if (props.isLast) {
        return [];
    }
    // 拖拽 tab 或 panel 时隐藏 resize-handle
    if (isDraggingTabOrPanel.value) {
        return [];
    }
    return getHandles();
});

// Tab 切换处理
const handleTabChange = (tabId: string) => {
    console.log('Tab 切换:', tabId);
    // 可以在这里添加额外的逻辑，比如保存当前激活的 tab
};
</script>

<style scoped>
.panel {
    outline: 1px solid #ccc;
    background: #fff;
    user-select: none;
    position: relative;
    z-index: 250; /* 确保 Panel 在 PanelGroup 之上，但低于 Tabs */
    transition: box-shadow 0.2s, outline-color 0.2s, opacity 0.2s;
    /* 性能优化 */
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    /* overflow: hidden; */
}

.panel-name {
    padding: 8px 12px;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    border-bottom: 1px solid #eee;
    flex-shrink: 0;
}

.panel.is-dragging {
    opacity: 0.8;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    transition: none;
    pointer-events: none;
}

.panel.is-resizing {
    user-select: none;
    transition: none;
}

/* 拖拽信息 */
.drag-info {
    position: absolute;
    bottom: 5px;
    right: 5px;
    font-size: 10px;
    color: #666;
    background: rgba(255, 255, 255, 0.9);
    padding: 2px 5px;
    border-radius: 3px;
    pointer-events: none;
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
    z-index: 4001; /* 确保调整信息在调整手柄之上 */
}

/* 调整手柄基础样式 */
.resize-handle {
    position: absolute;
    background: transparent;
    z-index: 4000; /* 确保调整手柄在所有热区之上（高于 Tabs 热区的 3002） */
    pointer-events: auto; /* 确保能接收鼠标事件 */
}

/* 边缘手柄 */
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

</style>