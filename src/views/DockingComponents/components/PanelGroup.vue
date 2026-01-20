<!-- 这是一组面板的容器-存在布局方式 -->
<template>
    <div class="panel-group" :style="layoutDirectionStyle">
        <Panel v-for="panel in group.panels" :key="panel.id" :panel="panel" />
    </div>
</template>

<script setup lang="ts">
import Panel from './Panel.vue';
import { computed } from 'vue';
const props = defineProps<{
    direction: 'row' | 'column';
    group: any;
}>();
const layoutDirectionStyle = computed(() => {
    return props.direction === 'row' ? 'flex-direction: column;' : 'flex-direction: row;';
});
</script>

<style scoped>

.panel-group {
    display: flex;
    border: 1px solid blue;
    /* margin: 10px; */
    width: 100%;
    height: 100%;
}

</style>