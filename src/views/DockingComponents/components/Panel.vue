<!-- 这是一个基础的面板组件面板中可以有多个tabs，每个tabs可以有多个内容 -->
<template>
    <div 
        ref="panelRef"
        class="panel"
        :class="{ 'is-dragging': isDragging }"
    >
        {{ panel.name }}
        
        <!-- 拖拽信息 -->
        <div class="drag-info" v-if="isDragging">
            Position: ({{ Math.round(position.x) }}, {{ Math.round(position.y) }})
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDrag } from '../useDrag';

const props = defineProps<{
    panel: any;
}>();

// 面板引用
const panelRef = ref<HTMLElement | null>(null);

// 使用拖拽 hooks
const { position, isDragging } = useDrag(panelRef, {
    id: props.panel.id,
    type: 'panel',
    data: props.panel,
    onDragStart: () => {
        console.log('拖拽开始', props.panel.name);
    },
    onDragging: () => {
        // 可以在这里处理拖拽中的逻辑
    },
    onDragEnd: () => {
        console.log('拖拽结束', props.panel.name);
    }
});

</script>

<style scoped>
.panel {
    width: 40px;
    height: 80px;
    border: 1px solid #ccc;
    margin: 10px;
    padding: 10px;
    background: #fff;
    cursor: move;
    user-select: none;
    position: relative;
    transition: box-shadow 0.2s, border-color 0.2s, opacity 0.2s;
    /* 性能优化 */
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
}

.panel:hover {
    border-color: #409eff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.panel.is-dragging {
    opacity: 0.8;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    z-index: 1001; /* 在所有热区之上 */
    /* 拖拽时移除过渡效果，直接响应 */
    transition: none;
    /* 关键：让鼠标事件穿透，使下层热区能接收到事件 */
    pointer-events: none;
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

</style>