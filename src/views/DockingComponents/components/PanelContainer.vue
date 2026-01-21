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
                    :class="{ 'active': activePosition === `before-${index}` }"
                    :data-drop-zone="`before-${index}`"
                ></div>

                <!-- PanelGroup 组件 -->
                <PanelGroup :group="group" :direction="direction" />

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
        <div v-else class="dock-layout-item" :style="layoutDirectionStyle">
            <div v-for="item in container" :key="item.id" class="float-item">
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
                    <PanelGroup :group="group" :direction="direction" />

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

const props = defineProps<{
    direction: 'row' | 'column';
    container: any;
}>();

const layoutDirectionStyle = computed(() => {
    return props.direction === 'row' ? 'flex-direction: row;' : 'flex-direction: column;';
});

// 容器引用
const containerRef = ref<HTMLElement | null>(null);

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

// 使用热区 hooks
const dropZone = useDropZone(containerRef, {
    type: 'panelContainer',
    id: props.container.id || 'container',
    data: props.container,
    allowedPositions: allowedPositions.value as any,
    dropZoneClass: 'drop-zone-container', // 指定热区 class，避免查找到 PanelGroup 内的热区
    onEnter: (position, dragInfo) => {
        console.log(' 进入 PanelGroup 之间热区 (Container)', position, dragInfo);
    },
    onLeave: () => {
        console.log(' 离开 PanelGroup 之间热区 (Container)');
    },
    onDrop: (position, dragInfo) => {
        console.log(' Panel 插入到 PanelGroup 之间 (Container)', position, dragInfo);
        // TODO: 解析 position (如 'after-2') 确定插入位置
    }
});

const { shouldShowDropZone, activePosition } = dropZone;

// 监听 container 或 allowedPositions 变化，重新初始化热区
watch([() => props.container, allowedPositions], () => {
    console.log(' PanelContainer 数据或 allowedPositions 变化，重新初始化');
    nextTick(() => {
        dropZone.initDropZones();
    });
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
    border: 1px solid #000;
    height: 100%;
    width: 100%;
}

.float-item {
    display: flex;
    flex-direction: inherit;
}

/* 热区基础样式 - PanelGroup 之间的插入热区 */
.drop-zone-container {
    background: rgba(103, 194, 58, 0.5);
    border-radius: 3px;
    pointer-events: auto; /* 确保热区能接收鼠标事件 */
    transition: all 0.15s;
    flex-shrink: 0;
    position: relative;
    z-index: 999; /* PanelContainer 的热区优先级较低，在 PanelGroup 热区之下 */
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

</style>