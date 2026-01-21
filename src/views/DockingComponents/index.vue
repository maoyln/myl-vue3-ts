<template>
    <div class="docking-components">
        <DockContainer :dockContainers="dockContainers" :floatPanelGroups="floatPanelGroups" >
            主内容区域
        </DockContainer>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import DockContainer from './components/DockContainer.vue';
import { useDockStore } from './useDockStore';
const dockStore = useDockStore();
const dockContainers = computed(() => dockStore.dockContainers);
const floatPanelGroups = computed(() => dockStore.floatPanelGroups);

onMounted(() => {
    console.log(dockContainers.value);
    console.log(floatPanelGroups.value);
    (window as any).dockContainers = dockContainers.value;
    (window as any).floatPanelGroups = floatPanelGroups.value;
});

</script>

<style scoped>

.docking-components {
    width: 100%;
    height: 100%;
}
</style>