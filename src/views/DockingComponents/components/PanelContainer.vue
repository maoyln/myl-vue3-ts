<!-- 容器布局壳子 -->
<!-- 存在布局方式：direction -->
<!-- 如果是泊靠在左侧或者右侧，是水平布局 -->
<!-- 如果是泊靠在顶部或者底部，是竖直布局 -->
<!-- 内部是PanelGroup的容器-可以包含多个PanelGroup -->
<template>
    <div class="dock-layout">
        <div v-if="Array.isArray(container)" class="dock-layout-item" :style="layoutDirectionStyle">
            <!-- 浮动窗体可能会有多个 -->
            <div v-for="item in container" :key="item.id">
                <PanelGroup v-for="group in item.groups" :key="group.id" :group="group" :direction="direction" />
            </div>
        </div>
        <div v-else class="dock-layout-item" :style="layoutDirectionStyle">
            <PanelGroup v-for="group in container.groups" :key="group.id" :group="group" :direction="direction" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import PanelGroup from './PanelGroup.vue';

const props = defineProps<{
    direction: 'row' | 'column';
    container: any;
}>();
const layoutDirectionStyle = computed(() => {
    return props.direction === 'row' ? 'flex-direction: row;' : 'flex-direction: column;';
});
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

</style>