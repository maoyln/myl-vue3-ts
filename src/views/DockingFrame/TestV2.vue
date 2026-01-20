<template>
  <div class="test-v2">
    <h1>V2测试页面</h1>
    <p>用于测试 DockManager provide/inject</p>
    
    <!-- 直接使用原有的 useDockManager -->
    <div ref="containerRef" class="test-container">
      <DockablePanelGroup
        :group="testPanel"
      />
    </div>

    <pre>{{ JSON.stringify(testPanel, null, 2) }}</pre>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useDockManager } from './docking/useDockManager';
import DockablePanelGroup from './docking/DockablePanelGroup.vue';
import type { PanelGroup } from './docking/types';

const containerRef = ref<HTMLElement | null>(null);

// 初始化 DockManager（会自动 provide）
const manager = useDockManager({
  hotZoneSize: 80,
  minPanelWidth: 200,
  minPanelHeight: 150
});

// 注册容器
onMounted(() => {
  if (containerRef.value) {
    manager.registerContainer(containerRef.value);
  }
});

// 测试面板
const testPanel: PanelGroup = {
  id: 'test_panel',
  tabs: [
    { id: 'tab1', title: '测试标签', icon: '📄', closable: true }
  ],
  activeTabId: 'tab1',
  width: 400,
  height: 300,
  originalWidth: 400,
  originalHeight: 300,
  x: 100,
  y: 100,
  zIndex: 1000,
  state: 'floating',
  position: 'float',
  resizable: true
};
</script>

<style scoped>
.test-v2 {
  padding: 20px;
  background: #1e1e1e;
  color: #cccccc;
  min-height: 100vh;
}

.test-container {
  position: relative;
  width: 100%;
  height: 600px;
  background: #252526;
  border: 1px solid #3e3e42;
  margin: 20px 0;
}

h1 {
  color: #4A90E2;
}

pre {
  background: #2d2d30;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
}
</style>
