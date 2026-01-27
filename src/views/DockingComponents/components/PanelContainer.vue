<!-- 容器布局壳子 -->
<template>
    <div ref="containerRef" class="dock-layout">
        <!-- 单个容器 -->
        <div v-if="!Array.isArray(container)" class="dock-layout-item" :style="layoutDirectionStyle">
            <!-- 动态渲染 PanelGroup 和热区 -->
            <template v-for="(group, index) in container.groups" :key="group.id">
                <!-- 第一个 PanelGroup 前的热区 -->
                 <!-- v-show="index === 0 && shouldShowDropZone" -->
                <div 
                    v-show="index === 0 && shouldShowDropZone"
                    class="drop-zone-container"
                    :class="{ 
                        'active': activePosition === `before-${index}`,
                        'is-first': true
                    }"
                    :data-drop-zone="`before-${index}`"
                ></div>

                <!-- PanelGroup 组件 -->
                <PanelGroup :group="group" :direction="direction" :containerKey="containerKey" />

                <!-- 每个 PanelGroup 后的热区 -->
                <!-- v-show="shouldShowDropZone" -->
                <div
                    v-show="shouldShowDropZone"
                    class="drop-zone-container"
                    :class="{ 'active': activePosition === `after-${index}` }"
                    :data-drop-zone="`after-${index}`"
                ></div>
            </template>
        </div>

        <!-- 多个容器（浮动窗体）-->
        <div v-else class="dock-layout-float">
            <div 
                v-for="item in container" 
                :key="item.id" 
                class="float-item"
                :style="getFloatItemStyle(item)"
            >
                <!-- 动态渲染 PanelGroup 和热区 -->
                <template v-for="(group, index) in item.groups" :key="group.id">
                    <!-- 第一个 PanelGroup 前的热区 -->
                     <!-- v-show="index === 0 && shouldShowDropZone" -->
                    <div 
                        v-show="index === 0 && shouldShowDropZone"
                        class="drop-zone-container"
                        :class="{ 'active': activePosition === `${item.id}-before-${index}` }"
                        :data-drop-zone="`${item.id}-before-${index}`"
                    ></div>
                    <!-- PanelGroup 组件 -->
                    <PanelGroup :group="group" :direction="direction" containerKey="float" />

                    <!-- 每个 PanelGroup 后的热区 -->
                     <!-- v-show="shouldShowDropZone" -->
                    <div 
                        v-show="shouldShowDropZone"
                        class="drop-zone-container"
                        :class="{ 'active': activePosition === `${item.id}-after-${index}` }"
                        :data-drop-zone="`${item.id}-after-${index}`"
                    ></div>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import PanelGroup from './PanelGroup.vue';
import { useDropZone } from '../useDropZone';
import { useDragDrop } from '../useDragDrop';
import { useDragContext } from '../useDragContext';

const props = defineProps<{
    direction: 'row' | 'column';
    container: any;
    containerKey?: string; // 新增：用于标识是哪个容器（left/right/top/bottom）
}>();

const layoutDirectionStyle = computed(() => {
    return props.direction === 'row' ? 'flex-direction: row;' : 'flex-direction: column;';
});

// 计算浮动窗体的样式
// 浮动窗体使用第一个 group 的宽高（如果存在）
const getFloatItemStyle = (item: any) => {
    const styles: any = {
        position: 'absolute',
        left: `${item.x || 0}px`,
        top: `${item.y || 0}px`,
    };
    
    // 浮动窗体：宽高都由内容撑开（通过 PanelGroup 的尺寸）
    // 如果有 groups，使用第一个 group 的宽高
    if (item.groups && item.groups.length > 0) {
        const firstGroup = item.groups[0];
        if (firstGroup.width) {
            styles.width = `${firstGroup.width}px`;
        }
        if (firstGroup.height) {
            styles.height = `${firstGroup.height}px`;
        }
    }
    
    return styles;
};

// 容器引用
const containerRef = ref<HTMLElement | null>(null);

// 使用拖拽处理 hooks
const dragDrop = useDragDrop();
const dragContext = useDragContext();

// 动态生成允许的热区位置
const allowedPositions = computed(() => {
    const positions: string[] = [];
    
    if (Array.isArray(props.container)) {
        // 浮动窗体
        props.container.forEach(item => {
            if (item.groups && item.groups.length > 0) {
                positions.push(`${item.id}-before-0`);
                for (let i = 0; i < item.groups.length; i++) {
                    positions.push(`${item.id}-after-${i}`);
                }
            }
        });
    } else if (props.container.groups) {
        // 单个容器
        if (props.container.groups.length > 0) {
            positions.push('before-0');
            for (let i = 0; i < props.container.groups.length; i++) {
                positions.push(`after-${i}`);
            }
        }
    }
    
    return positions;
});

const dropZone = useDropZone(containerRef, {
    type: 'panelContainer',
    id: props.container.id || 'container',
    data: props.container,
    allowedPositions: allowedPositions as any,
    dropZoneClass: 'drop-zone-container',
    onEnter: (position) => {
        dragDrop.registerDropZone({
            scenario: 'panelContainer',
            position,
            targetId: props.container.id || 'container',
            targetData: {
                containerKey: props.containerKey || props.container.position || 'left',
                direction: props.direction,
            },
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

// 监听 container 变化，确保热区在数据更新后重新初始化
watch(() => props.container, () => {
    // 只在拖拽时重新初始化，避免不必要的性能开销
    if (dragContext.getCurrentDrag().value) {
        nextTick(() => {
            dropZone.initDropZones();
        });
    }
}, { deep: true });
</script>

<style scoped>

.dock-layout {
    width: 100%;
    height: 100%;
}

.dock-layout-item {
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
    height: 100%;
    width: 100%;
    /* 确保容器能够正确显示内容 */
    min-width: 0;
    min-height: 0;
}

/* 浮动窗体容器 */
.dock-layout-float {
    position: relative;
    width: 100%;
    height: 100%;
}

/* 单个浮动窗体 */
.float-item {
    display: flex;
    flex-direction: inherit;
    position: absolute;
    box-sizing: border-box;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    border-radius: 4px;
}

/* 热区基础样式 - PanelGroup 之间的插入热区 */
.drop-zone-container {
    background: rgba(255, 255, 255, 0);
    border-radius: 3px;
    pointer-events: auto;
    transition: all 0.15s;
    position: relative;
    z-index: 100; /* 优先级最低 */
}

/* 水平布局（row）- 热区是垂直线 */
.dock-layout-item[style*="flex-direction: row"] .drop-zone-container {
    width: 8px;
    height: 100%;
    margin: 0 -4px;
}

/* 垂直布局（column）- 热区是水平线 */
.dock-layout-item[style*="flex-direction: column"] .drop-zone-container {
    height: 8px;
    width: 100%;
    margin: -4px 0;
}

/* 激活状态 */
.drop-zone-container.active {
    background: rgba(103, 194, 58, 0.5);
    box-shadow: 0 0 10px rgba(103, 194, 58, 0.6);
    z-index: 1001; /* 激活时优先级最低 */
}

/* 水平布局激活时 */
.dock-layout-item[style*="flex-direction: row"] .drop-zone-container.active {
    width: 16px;
    margin: 0 -8px;
}

/* 垂直布局激活时 */
.dock-layout-item[style*="flex-direction: column"] .drop-zone-container.active {
    height: 16px;
    margin: -8px 0;
}

/* 第一个 PanelGroup 前的热区 - 避免与 PanelGroup 的最后一个热区重叠 */
/* 水平布局（row）- 热区是垂直线，向左偏移（向上移动，远离 PanelGroup 的最后一个热区） */
.dock-layout-item[style*="flex-direction: row"] .drop-zone-container.is-first {
    transform: translateX(0);
}

/* 垂直布局（column）- 热区是水平线，向上偏移（向左移动，远离 PanelGroup 的最后一个热区） */
.dock-layout-item[style*="flex-direction: column"] .drop-zone-container.is-first {
    transform: translateY(0);
}

/* 第一个 PanelGroup 前的热区激活时 */
.dock-layout-item[style*="flex-direction: row"] .drop-zone-container.is-first.active {
    transform: translateX(0);
}

.dock-layout-item[style*="flex-direction: column"] .drop-zone-container.is-first.active {
    transform: translateY(0);
}

</style>