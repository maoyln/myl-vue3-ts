<template>
  <div class="docking-demo-page">
    <DockContainer ref="dockContainerRef" :config="dockConfig">
      <!-- 主内容区 -->
      <div class="demo-content">
        <div class="demo-header">
          <div class="header-left">
            <h1>🎨 PS 风格停泊吸附系统</h1>
            <p class="subtitle">完整的拖拽、吸附、停泊演示</p>
          </div>
          <div class="header-right">
            <div class="stats-card">
              <div class="stat-item">
                <span class="stat-label">面板数量</span>
                <span class="stat-value">{{ panelCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">状态</span>
                <span class="stat-value" :class="isDragging ? 'dragging' : ''">
                  {{ isDragging ? '拖拽中' : '空闲' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="demo-controls">
          <div class="control-section">
            <h3>快速添加面板</h3>
            <div class="btn-group">
              <button @click="addPanel('tools')" class="btn btn-primary">
                <span class="btn-icon">🔧</span>
                工具面板
              </button>
              <button @click="addPanel('properties')" class="btn btn-primary">
                <span class="btn-icon">⚙️</span>
                属性面板
              </button>
              <button @click="addPanel('layers')" class="btn btn-primary">
                <span class="btn-icon">📚</span>
                图层面板
              </button>
              <button @click="addPanel('history')" class="btn btn-primary">
                <span class="btn-icon">⏱️</span>
                历史面板
              </button>
              <button @click="addPanel('color')" class="btn btn-primary">
                <span class="btn-icon">🎨</span>
                颜色面板
              </button>
            </div>
          </div>

          <div class="control-section">
            <h3>预设布局</h3>
            <div class="btn-group">
              <button @click="loadPreset('default')" class="btn btn-secondary">
                默认布局
              </button>
              <button @click="loadPreset('design')" class="btn btn-secondary">
                设计布局
              </button>
              <button @click="loadPreset('code')" class="btn btn-secondary">
                代码布局
              </button>
              <button @click="resetAll" class="btn btn-danger">
                重置全部
              </button>
            </div>
          </div>

          <div class="control-section">
            <h3>功能说明</h3>
            <div class="tips-list">
              <div class="tip-item">
                <span class="tip-icon">💡</span>
                <span>拖拽面板标题栏可移动面板</span>
              </div>
              <div class="tip-item">
                <span class="tip-icon">🧲</span>
                <span>靠近边缘或其他面板时自动吸附对齐</span>
              </div>
              <div class="tip-item">
                <span class="tip-icon">📌</span>
                <span>拖到容器边缘热区可停泊固定</span>
              </div>
              <div class="tip-item">
                <span class="tip-icon">⌨️</span>
                <span>按住 Alt 键禁用吸附，按 Esc 取消拖拽</span>
              </div>
              <div class="tip-item">
                <span class="tip-icon">📏</span>
                <span>拖拽时蓝色辅助线显示对齐位置</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 自定义面板内容 -->
      <template #panel-content="{ panel }">
        <div class="custom-panel-content">
          <div class="panel-info">
            <div class="info-row">
              <span class="info-label">ID:</span>
              <span class="info-value">{{ panel.id }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">标题:</span>
              <span class="info-value">{{ panel.title }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">状态:</span>
              <span class="info-value" :class="`state-${panel.state}`">
                {{ getStateName(panel.state) }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">位置:</span>
              <span class="info-value">{{ getPositionName(panel.position) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">尺寸:</span>
              <span class="info-value">{{ panel.width }} × {{ panel.height }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">坐标:</span>
              <span class="info-value">({{ Math.round(panel.x) }}, {{ Math.round(panel.y) }})</span>
            </div>
          </div>
        </div>
      </template>
    </DockContainer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { DockContainer } from '@/components/docking';
import type { DockManagerConfig, PanelState, DockPosition } from '@/components/docking';

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

// 面板配置模板
const panelTemplates = {
  tools: {
    title: '工具箱',
    width: 250,
    height: 400,
    icon: '🔧',
  },
  properties: {
    title: '属性',
    width: 300,
    height: 350,
    icon: '⚙️',
  },
  layers: {
    title: '图层',
    width: 280,
    height: 450,
    icon: '📚',
  },
  history: {
    title: '历史记录',
    width: 250,
    height: 300,
    icon: '⏱️',
  },
  color: {
    title: '颜色',
    width: 220,
    height: 280,
    icon: '🎨',
  },
};

// 添加面板
function addPanel(type: keyof typeof panelTemplates) {
  const manager = getManager();
  if (!manager) return;

  const template = panelTemplates[type];
  const id = `${type}-${++panelIdCounter}`;

  manager.addPanel({
    id,
    title: `${template.icon} ${template.title} ${panelIdCounter}`,
    width: template.width,
    height: template.height,
    defaultPosition: 'float',
    closable: true,
    resizable: true,
  });
}

// 加载预设布局
function loadPreset(preset: string) {
  const manager = getManager();
  if (!manager) return;

  // 先清空
  resetAll();

  switch (preset) {
    case 'default':
      // 默认布局：左侧工具，右侧图层
      manager.addPanel({
        id: `tools-${++panelIdCounter}`,
        title: '🔧 工具箱',
        width: 250,
        height: 400,
        defaultPosition: 'left',
        closable: true,
        resizable: true,
      });
      manager.addPanel({
        id: `layers-${++panelIdCounter}`,
        title: '📚 图层',
        width: 280,
        height: 450,
        defaultPosition: 'right',
        closable: true,
        resizable: true,
      });
      break;

    case 'design':
      // 设计布局：左侧工具和颜色，右侧图层和属性
      manager.addPanel({
        id: `tools-${++panelIdCounter}`,
        title: '🔧 工具箱',
        width: 250,
        height: 350,
        defaultPosition: 'left',
        closable: true,
        resizable: true,
      });
      manager.addPanel({
        id: `color-${++panelIdCounter}`,
        title: '🎨 颜色',
        width: 250,
        height: 250,
        defaultPosition: 'left',
        closable: true,
        resizable: true,
      });
      manager.addPanel({
        id: `layers-${++panelIdCounter}`,
        title: '📚 图层',
        width: 280,
        height: 350,
        defaultPosition: 'right',
        closable: true,
        resizable: true,
      });
      manager.addPanel({
        id: `properties-${++panelIdCounter}`,
        title: '⚙️ 属性',
        width: 280,
        height: 300,
        defaultPosition: 'right',
        closable: true,
        resizable: true,
      });
      break;

    case 'code':
      // 代码布局：顶部工具栏，底部历史和属性
      manager.addPanel({
        id: `tools-${++panelIdCounter}`,
        title: '🔧 工具箱',
        width: 250,
        height: 200,
        defaultPosition: 'top',
        closable: true,
        resizable: true,
      });
      manager.addPanel({
        id: `history-${++panelIdCounter}`,
        title: '⏱️ 历史记录',
        width: 300,
        height: 200,
        defaultPosition: 'bottom',
        closable: true,
        resizable: true,
      });
      manager.addPanel({
        id: `properties-${++panelIdCounter}`,
        title: '⚙️ 属性',
        width: 280,
        height: 200,
        defaultPosition: 'bottom',
        closable: true,
        resizable: true,
      });
      break;
  }
}

// 重置所有面板
function resetAll() {
  const manager = getManager();
  if (!manager) return;

  // 移除所有面板
  const panels = manager.panelList.value;
  [...panels].forEach(panel => {
    manager.removePanel(panel.id);
  });

  // 重置计数器
  panelIdCounter = 0;
}

// 获取状态名称
function getStateName(state: PanelState): string {
  const names: Record<PanelState, string> = {
    docked: '已停泊',
    floating: '浮动',
    dragging: '拖拽中',
  };
  return names[state] || state;
}

// 获取位置名称
function getPositionName(position: DockPosition): string {
  const names: Record<DockPosition, string> = {
    left: '左侧',
    right: '右侧',
    top: '顶部',
    bottom: '底部',
    center: '中心',
    float: '浮动',
  };
  return names[position] || position;
}
</script>

<style scoped>
.docking-demo-page {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #1a1a1a;
}

.demo-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px;
  overflow: auto;
  background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
}

/* 头部 */
.demo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.header-left h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #fff;
  font-weight: 600;
}

.subtitle {
  margin: 0;
  color: #aaa;
  font-size: 14px;
}

.header-right {
  flex-shrink: 0;
}

.stats-card {
  display: flex;
  gap: 24px;
  padding: 16px 24px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #4A90E2;
  transition: color 0.3s;
}

.stat-value.dragging {
  color: #f59e0b;
}

/* 控制区 */
.demo-controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 900px;
}

.control-section {
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  backdrop-filter: blur(10px);
}

.control-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #fff;
  font-weight: 500;
}

/* 按钮组 */
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
  background: rgba(255, 255, 255, 0.1);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.btn-danger {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

/* 提示列表 */
.tips-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  color: #ddd;
  font-size: 14px;
}

.tip-icon {
  font-size: 18px;
  flex-shrink: 0;
}

/* 自定义面板内容 */
.custom-panel-content {
  padding: 16px;
}

.panel-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  font-size: 13px;
}

.info-label {
  color: #888;
  font-weight: 500;
}

.info-value {
  color: #ddd;
  font-family: 'Consolas', 'Monaco', monospace;
}

.state-docked {
  color: #4ade80;
}

.state-floating {
  color: #60a5fa;
}

.state-dragging {
  color: #fbbf24;
}
</style>
