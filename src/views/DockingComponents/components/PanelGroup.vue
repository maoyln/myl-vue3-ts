<!-- 这是一组面板的容器-存在布局方式 -->
<template>
    <div 
        ref="panelGroupRef"
        class="panel-group" 
        :style="layoutDirectionStyle"
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
            <Panel :panel="panel" />

            <!-- 每个 Panel 后的热区（也是下一个 Panel 之间的热区）-->
             <!-- v-show="shouldShowDropZone" -->
            <div 
                v-show="shouldShowDropZone"
                class="drop-zone"
                :class="{ 'active': activePosition === `after-${index}` }"
                :data-drop-zone="`after-${index}`"
            ></div>
        </template>
    </div>
</template>

<script setup lang="ts">
import Panel from './Panel.vue';
import { computed, ref, watch, nextTick } from 'vue';
import { useDropZone } from '../useDropZone';

const props = defineProps<{
    direction: 'row' | 'column';
    group: any;
}>();

const layoutDirectionStyle = computed(() => {
    return props.direction === 'row' ? 'flex-direction: column;' : 'flex-direction: row;';
});

// PanelGroup 引用
const panelGroupRef = ref<HTMLElement | null>(null);

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

// 使用热区 hooks
const dropZone = useDropZone(panelGroupRef, {
    type: 'panelGroup',
    id: props.group.id,
    data: props.group,
    allowedPositions: allowedPositions.value as any,
    dropZoneClass: 'drop-zone', // 指定热区 class，避免查找到其他层级的热区
    onEnter: (position, dragInfo) => {
        console.log('进入 Panel 之间热区', position, dragInfo);
    },
    onLeave: (position) => {
        console.log('离开 Panel 之间热区', position);
    },
    onDrop: (position, dragInfo) => {
        console.log(' Panel 插入到', props.group.id, position, dragInfo);
        // TODO: 解析 position (如 'after-2') 确定插入位置，调用 store 重新排列
        // 例如：after-2 表示插入到 index=2 的 panel 后面，即 newIndex=3
    }
});

const { shouldShowDropZone, activePosition } = dropZone;

// 监听 panels 变化或 allowedPositions 变化，重新初始化热区
watch([() => props.group.panels, allowedPositions], () => {
    console.log(' PanelGroup panels 或 allowedPositions 变化，重新初始化');
    nextTick(() => {
        dropZone.initDropZones();
    });
}, { deep: true });
</script>

<style scoped>

.panel-group {
    display: flex;
    border: 1px solid blue;
    position: relative;
    width: 100%;
    height: 100%;
    transition: all 0.2s;
}

/* 热区基础样式 - Panel 之间的插入热区 */
.drop-zone {
    background: rgba(64, 158, 255, 0.5);
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