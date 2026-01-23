<!-- 容器总容器-所有的拖拽均可在该容器中进行 -->
<template>
    <div ref="containerRef" class="dock-container" @mouseup="handleMouseUp" @mousemove="handleMouseMove">
        <div class="dock-layout">
            <!-- 布局容器 -->
             <div class="dock-left">
                <PanelContainer :container="dockContainers.left" direction="row" containerKey="left" />
             </div>
             <div class="dock-middle">
                <div class="dock-top">
                    <PanelContainer :container="dockContainers.top" direction="column" containerKey="top" />
                </div>
                <div class="dock-content">
                    <slot></slot>
                </div>
                <div class="dock-bottom">
                    <PanelContainer :container="dockContainers.bottom" direction="column" containerKey="bottom" />
                </div>
             </div>
             <div class="dock-right">
                <PanelContainer :container="dockContainers.right" direction="row" containerKey="right" />
             </div>        
        </div>

        <div class="dock-float">
            <PanelContainer :container="floatPanelGroups" direction="column" containerKey="float" />
        </div>
    </div>
</template>

<script setup lang="ts">
import PanelContainer from './PanelContainer.vue';

const props = defineProps<{
    dockContainers: any;
    floatPanelGroups: any;
}>();
function handleMouseMove(e: MouseEvent) {
    // 如果有拖拽的内容，这需要实时定位
    // console.log('handleMouseMove', e);

}

function handleMouseUp(e: MouseEvent) {
    // 如果有拖拽的内容，鼠标抬起的时候需要做的事情
    // console.log('handleMouseUp', e);
}
</script>

<style scoped>
.dock-container {
    width: 100%;
    height: 100%;
}

.dock-layout {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100%;
}

.dock-float {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    pointer-events: none; /* 允许点击穿透到下层 */
}

.dock-float :deep(.float-item) {
    pointer-events: auto; /* 浮动窗体本身可以响应点击 */
}

.dock-left {
    /* 宽度由内容撑开（PanelGroup 的 width） */
    height: 100%;
    border: 1px solid red;
    flex-shrink: 0; /* 防止被压缩 */
}

.dock-middle {
    display: flex;
    flex-direction: column;
    flex: 1;
    border: 1px solid blue;
    min-width: 0; /* 允许 flex 子元素缩小 */
}

.dock-right {
    /* 宽度由内容撑开（PanelGroup 的 width） */
    height: 100%;
    border: 1px solid green;
    flex-shrink: 0; /* 防止被压缩 */
}

.dock-top {
    /* 高度由内容撑开（PanelGroup 的 height） */
    border: 1px solid yellow;
    flex-shrink: 0; /* 防止被压缩 */
}

.dock-content {
    flex: 1;
    border: 1px solid purple;
    background: #f0f0f0;
    min-height: 0; /* 允许 flex 子元素缩小 */
}

.dock-bottom {
    /* 高度由内容撑开（PanelGroup 的 height） */
    border: 1px solid orange;
    flex-shrink: 0; /* 防止被压缩 */
}

</style>