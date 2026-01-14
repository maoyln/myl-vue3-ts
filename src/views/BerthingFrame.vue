<template>
  <div class="berthing-frame-page">
    <DockContainer ref="dockContainerRef" :config="dockConfig">
      <!-- 简化的主内容区 -->
      <div class="main-content">
        <div class="content-header">
          <h2>🎨 停泊吸附系统演示</h2>
          <p>类似 Photoshop 的面板停泊功能</p>
        </div>

        <div class="control-section">
          <div class="btn-group">
            <button @click="addToolPanel" class="btn">工具面板</button>
            <button @click="addPropertiesPanel" class="btn">属性面板</button>
            <button @click="addLayersPanel" class="btn">图层面板</button>
            <button @click="addHistoryPanel" class="btn">历史面板</button>
            <button @click="resetAll" class="btn btn-reset">重置</button>
          </div>

          <div class="stats">
            <span>面板: {{ panelCount }}</span>
            <span>状态: {{ isDragging ? '拖拽中' : '空闲' }}</span>
          </div>
        </div>

        <div class="tips">
          <p>💡 拖拽面板到边缘或其他面板附近可自动吸附停靠</p>
        </div>
      </div>
    </DockContainer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { DockContainer } from '@/components/docking';
import type { DockManagerConfig } from '@/components/docking';

// Dock 容器引用
const dockContainerRef = ref<InstanceType<typeof DockContainer>>();

// Dock 配置
const dockConfig: DockManagerConfig = {
  snapThreshold: 30,
  hotZoneSize: 50,
  minPanelWidth: 200,
  minPanelHeight: 150,
};

// 面板计数器
let panelIdCounter = 0;

// 获取管理器
const getManager = () => dockContainerRef.value?.manager;

// 计算属性
const panelCount = computed(() => {
  const manager = getManager();
  return manager?.panelList.value.length ?? 0;
});

const isDragging = computed(() => {
  const manager = getManager();
  return manager?.dragInfo.value !== null;
});

// 添加工具面板
function addToolPanel() {
  const manager = getManager();
  if (!manager) return;

  manager.addPanel({
    id: `tools-${++panelIdCounter}`,
    title: `工具箱 ${panelIdCounter}`,
    width: 250,
    height: 400,
    defaultPosition: 'float',
    closable: true,
    resizable: true,
  });
}

// 添加属性面板
function addPropertiesPanel() {
  const manager = getManager();
  if (!manager) return;

  manager.addPanel({
    id: `properties-${++panelIdCounter}`,
    title: `属性 ${panelIdCounter}`,
    width: 300,
    height: 350,
    defaultPosition: 'float',
    closable: true,
    resizable: true,
  });
}

// 添加图层面板
function addLayersPanel() {
  const manager = getManager();
  if (!manager) return;

  manager.addPanel({
    id: `layers-${++panelIdCounter}`,
    title: `图层 ${panelIdCounter}`,
    width: 280,
    height: 450,
    defaultPosition: 'right',
    closable: true,
    resizable: true,
  });
}

// 添加历史面板
function addHistoryPanel() {
  const manager = getManager();
  if (!manager) return;

  manager.addPanel({
    id: `history-${++panelIdCounter}`,
    title: `历史记录 ${panelIdCounter}`,
    width: 250,
    height: 300,
    defaultPosition: 'float',
    closable: true,
    resizable: true,
  });
}

// 重置所有面板
function resetAll() {
  const manager = getManager();
  if (!manager) return;

  // 移除所有面板
  const panels = manager.panelList.value;
  panels.forEach(panel => {
    manager.removePanel(panel.id);
  });

  // 重置计数器
  panelIdCounter = 0;
}
</script>

<style scoped>
.berthing-frame-page {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.main-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
  color: white;
}

.content-header {
  text-align: center;
  margin-bottom: 30px;
}

.content-header h2 {
  margin: 0 0 8px 0;
  font-size: 2rem;
}

.content-header p {
  margin: 0;
  opacity: 0.9;
}

.control-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  background: #fff;
  transform: translateY(-1px);
}

.btn-reset {
  background: rgba(255, 107, 107, 0.9);
  color: white;
}

.btn-reset:hover {
  background: rgba(255, 107, 107, 1);
}

.stats {
  display: flex;
  gap: 20px;
  justify-content: center;
  font-size: 14px;
  opacity: 0.95;
}

.tips {
  text-align: center;
  font-size: 14px;
  opacity: 0.85;
}

.tips p {
  margin: 0;
}
</style>
