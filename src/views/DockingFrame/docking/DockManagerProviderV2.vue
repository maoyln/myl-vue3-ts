<template>
  <div ref="containerRef" class="dock-manager-provider">
    <!-- 通过 slot 传递内容 -->
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useDockManager } from './useDockManager';
import type { DockManagerConfig } from './types';

interface Props {
  config?: DockManagerConfig;
}

const props = withDefaults(defineProps<Props>(), {
  config: () => ({
    hotZoneSize: 80,
    minPanelWidth: 200,
    minPanelHeight: 150
  })
});

const containerRef = ref<HTMLElement | null>(null);

// 初始化 DockManager（自动 provide）
const manager = useDockManager(props.config);

// 注册容器
onMounted(() => {
  if (containerRef.value) {
    manager.registerContainer(containerRef.value);
  }
});

onUnmounted(() => {
  // 清理工作
});

// 暴露 manager 实例供外部使用
defineExpose({
  manager
});
</script>

<style scoped>
.dock-manager-provider {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
