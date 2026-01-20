<!-- 这是一个基础的面板组件面板中可以有多个tabs，每个tabs可以有多个内容 -->
<template>
    <div @mousedown="handlePanelClick"  class="panel">
        {{ panel.name }}
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    panel: any;
}>();

const handlePanelClick = () => {
    console.log('handlePanelClick', props.panel);
}

</script>

<style scoped>
    .panel {
        width: 40px;
        height: 60px;
        border: 1px solid red;
        margin: 10px;
    }

</style>