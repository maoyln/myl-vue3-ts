<!-- 容器总容器-所有的拖拽均可在该容器中进行 -->
<template>
    <div ref="containerRef" class="dock-container" @mouseup="handleMouseUp" @mousemove="handleMouseMove">
        <div class="dock-layout">
            <!-- 布局容器 -->
             <div class="dock-left">
                <PanelContainer :container="dockContainers.left" direction="row" />
             </div>
             <div class="dock-middle">
                <div class="dock-top">
                    <PanelContainer :container="dockContainers.top" direction="column" />
                </div>
                <div class="dock-content">主内容区</div>
                <div class="dock-bottom">
                    <PanelContainer :container="dockContainers.bottom" direction="column" />
                </div>
             </div>
             <div class="dock-right">
                <!-- 右侧停靠区{{dockContainers.right}} -->
                <PanelContainer :container="dockContainers.right" direction="row" />
             </div>        
        </div>

        <div class="dock-float">
            <PanelContainer :container="floatPanelGroups" direction="row" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PanelContainer from './PanelContainer.vue';
import { mockData } from '../mock'; 
const dockContainers = ref(mockData.containers);
const floatPanelGroups = ref(mockData.floatPanelGroups);
function handleMouseMove(e: MouseEvent) {
    // 如果有拖拽的内容，这需要实时定位
    console.log('handleMouseMove', e);

}

function handleMouseUp(e: MouseEvent) {
    // 如果有拖拽的内容，鼠标抬起的时候需要做的事情
    console.log('handleMouseUp', e);
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
    top: calc(100% - 400px);
    left: calc(100% - 400px);
    width: 300px;
    height: 300px;
    z-index: 999;
    border: 1px solid blue;
    background-color: yellow;
}

.dock-left {
    width: 300px;
    height: 100%;
    border: 1px solid red;
}

.dock-middle {
    display: flex;
    flex-direction: column;
    flex: 1;
    border: 1px solid blue;
}

.dock-right {
    width: 300px;
    height: 100%;
    border: 1px solid green;
}

.dock-top {
    height: 280px;
    border: 1px solid yellow;
}

.dock-content {
    flex: 1;
    border: 1px solid purple;
    background: #f0f0f0;
}

.dock-bottom {
    height: 280px;
    border: 1px solid orange;
}

</style>