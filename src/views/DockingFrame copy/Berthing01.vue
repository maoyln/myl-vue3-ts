<template>
  <div class="berthing-demo-page">
    <DockContainer ref="dockContainerRef" :config="dockConfig">
      <!-- 主内容区 -->
      <div class="demo-content">
        <div class="demo-controls">
          <div class="control-section">
            <div class="btn-group">
              <button @click="addPanel('tools')" class="btn btn-primary">
                <span class="btn-icon">🔧</span>
                工具面板
              </button>
            </div>
          </div>

          <div class="control-section">
            <div class="btn-group">
              <button @click="loadPreset('default')" class="btn btn-secondary">
                默认布局
              </button>
              <button @click="resetAll" class="btn btn-danger">
                重置全部
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 自定义面板组内容 -->
      <template #panel-group-content="{ group, activeTab }">
        <div class="custom-panel-content">
          <div class="panel-info">
            <h3>{{ activeTab?.title || '未选中' }}</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">面板组 ID:</span>
                <span class="value">{{ group.id }}</span>
              </div>
              <div class="info-item">
                <span class="label">标签页数:</span>
                <span class="value">{{ group.tabs.length }}</span>
              </div>
              <div class="info-item">
                <span class="label">状态:</span>
                <span class="value">{{ getStateName(group.state) }}</span>
              </div>
              <div class="info-item">
                <span class="label">位置:</span>
                <span class="value">{{ getPositionName(group.position) }}</span>
              </div>
            </div>

            <div class="tabs-list">
              <h4>所有标签页:</h4>
              <ul>
                <li
                  v-for="tab in group.tabs"
                  :key="tab.id"
                  :class="{ active: tab.id === group.activeTabId }"
                >
                  {{ tab.icon }} {{ tab.title }}
                  <span v-if="tab.id === group.activeTabId" class="badge">当前</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </template>
    </DockContainer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { DockContainer } from './docking';
import type { DockManagerConfig, PanelState, DockPosition } from './docking';

const dockContainerRef = ref<InstanceType<typeof DockContainer>>();

const dockConfig: DockManagerConfig = {
  hotZoneSize: 50,
  minPanelWidth: 250,
  minPanelHeight: 200,
};

let panelIdCounter = 0;

const getManager = () => dockContainerRef.value?.manager;

const panelTemplates = {
  tools: {
    title: '自定义面板',
    icon: '🔧',
    width: 280,
    height: 400,
  }
};

function addPanel(type: keyof typeof panelTemplates) {
  const manager = getManager();
  if (!manager) return;

  const template = panelTemplates[type];
  const id = `${type}-${++panelIdCounter}`;

  manager.addPanelGroup({
    id,
    title: `${template.title} ${panelIdCounter}`,
    icon: template.icon,
    width: template.width,
    height: template.height,
    defaultPosition: 'float',
    closable: true,
    resizable: true,
  });
}

function loadPreset(preset: string) {
  const manager = getManager();
  if (!manager) return;

  resetAll();

  if (preset === 'default') {
    manager.addPanelGroup({
      id: `tools-${++panelIdCounter}`,
      title: '工具箱1',
      icon: '🔧',
      width: 280,
      height: 400,
      defaultPosition: 'left',
      closable: true,
      resizable: true,
    });

    manager.addPanelGroup({
      id: `layers-${++panelIdCounter}`,
      title: '工具箱2',
      icon: '🔧',
      width: 280,
      height: 350,
      defaultPosition: 'right',
      closable: true,
      resizable: true,
    });

    manager.addPanelGroup({
      id: `properties-${++panelIdCounter}`,
      title: '工具箱3',
      icon: '🔧',
      width: 280,
      height: 300,
      defaultPosition: 'right',
      closable: true,
      resizable: true,
    });

    manager.addPanelGroup({
      id: `properties-${++panelIdCounter}`,
      title: '工具箱3',
      icon: '🔧',
      width: 280,
      height: 300,
      defaultPosition: 'bottom',
      closable: true,
      resizable: true,
    });
  }
}

function resetAll() {
  const manager = getManager();
  if (!manager) return;

  const groups = manager.panelGroupList.value;
  [...groups].forEach(group => {
    manager.removePanelGroup(group.id);
  });

  panelIdCounter = 0;
}

function getStateName(state: PanelState): string {
  const names: Record<PanelState, string> = {
    docked: '已停靠',
    floating: '浮动',
    dragging: '拖拽中',
  };
  return names[state] || state;
}

function getPositionName(position: DockPosition): string {
  const names: Record<DockPosition, string> = {
    left: '左侧',
    right: '右侧',
    top: '顶部',
    bottom: '底部',
    float: '浮动',
  };
  return names[position] || position;
}
</script>

<style scoped>
.berthing-demo-page {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.demo-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
  box-sizing: border-box;
  border: 1px solid #86909C;
}

.demo-controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 900px;
}

.control-section {
  padding: 20px;
  border-radius: 10px;
}

.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
}

.btn-icon {
  font-size: 16px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 80%);
  transform: translateY(-1px);
}

.btn-danger {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

.custom-panel-content {
  padding: 16px;
  /* height: 100%; */
  overflow: auto;
}

.panel-info h3 {
  margin: 0 0 16px 0;
  color: #000000;
  font-size: 18px;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.info-item .label {
  font-size: 11px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item .value {
  font-size: 14px;
}

.tabs-list {
  margin-top: 20px;
}

.tabs-list h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
}

.tabs-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tabs-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 4px;
  font-size: 13px;
  transition: background-color 0.2s;
}

.tabs-list li:hover {
  background: rgba(255, 255, 255, 0.05);
}

.tabs-list li.active {
  background: rgba(74, 144, 226, 0.2);
  border-left: 3px solid #4A90E2;
}

.badge {
  padding: 2px 8px;
  background: #4A90E2;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  text-transform: uppercase;
}
</style>
