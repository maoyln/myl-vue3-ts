<template>
  <div class="docking-group-demo-page">
    <DockContainer ref="dockContainerRef" :config="dockConfig">
      <!-- 主内容区 -->
      <div class="demo-content">
        <div class="demo-header">
          <div class="header-left">
            <h1>🎯 面板组 Tabs 演示</h1>
            <p class="subtitle">支持标签页拖拽、合并与拆分</p>
          </div>
          <div class="header-right">
            <div class="stats-card">
              <div class="stat-item">
                <span class="stat-label">面板组</span>
                <span class="stat-value">{{ panelGroupCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">标签总数</span>
                <span class="stat-value">{{ totalTabCount }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="demo-controls">
          <div class="control-section">
            <h3>快速添加面板</h3>
            <div class="btn-group">
              <button @click="addPanelGroup('tools')" class="btn btn-primary">
                <span class="btn-icon">🔧</span>
                工具面板
              </button>
              <button @click="addPanelGroup('properties')" class="btn btn-primary">
                <span class="btn-icon">⚙️</span>
                属性面板
              </button>
              <button @click="addPanelGroup('layers')" class="btn btn-primary">
                <span class="btn-icon">📚</span>
                图层面板
              </button>
              <button @click="addPanelGroup('history')" class="btn btn-primary">
                <span class="btn-icon">⏱️</span>
                历史面板
              </button>
              <button @click="addPanelGroup('color')" class="btn btn-primary">
                <span class="btn-icon">🎨</span>
                颜色面板
              </button>
            </div>
          </div>

          <div class="control-section">
            <h3>操作说明</h3>
            <div class="tips-list">
              <div class="tip-item">
                <span class="tip-icon">👆</span>
                <span><strong>点击</strong>标签页切换内容（不移动鼠标）</span>
              </div>
              <div class="tip-item">
                <span class="tip-icon">🖱️</span>
                <span><strong>拖拽</strong>标签页（移动>5px）可以拆分成独立面板</span>
              </div>
              <div class="tip-item">
                <span class="tip-icon">🔗</span>
                <span>拖拽标签页到其他面板的<strong>标签栏</strong>可以合并</span>
              </div>
              <div class="tip-item">
                <span class="tip-icon">✨</span>
                <span>合并时会显示<strong>蓝色高亮预览</strong>和提示文字</span>
              </div>
              <div class="tip-item">
                <span class="tip-icon">📏</span>
                <span>标签页有<strong>最小宽度120px</strong>，面板会自动扩展</span>
              </div>
              <div class="tip-item">
                <span class="tip-icon">✕</span>
                <span>点击标签页上的 ✕ 关闭标签（至少保留一个标签）</span>
              </div>
              <div class="tip-item">
                <span class="tip-icon">📋</span>
                <span>拖拽标签栏<strong>空白区域</strong>可以移动整个面板组</span>
              </div>
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
import { ref, computed } from 'vue';
import { DockContainer } from '@/components/docking';
import type { DockManagerConfig, PanelState, DockPosition } from '@/components/docking';

// Dock 容器引用
const dockContainerRef = ref<InstanceType<typeof DockContainer>>();

// Dock 配置
const dockConfig: DockManagerConfig = {
  snapThreshold: 30,
  hotZoneSize: 50,
  minPanelWidth: 250,
  minPanelHeight: 200,
};

// 面板计数器
let panelIdCounter = 0;

// 获取管理器
const getManager = () => dockContainerRef.value?.manager;

// 计算属性
const panelGroupCount = computed(() => {
  const manager = getManager();
  return manager?.panelGroupList.value.length ?? 0;
});

const totalTabCount = computed(() => {
  const manager = getManager();
  const groups = manager?.panelGroupList.value || [];
  return groups.reduce((sum, group) => sum + group.tabs.length, 0);
});

// 面板配置模板
const panelTemplates = {
  tools: {
    title: '工具箱',
    icon: '🔧',
    width: 280,
    height: 400,
  },
  properties: {
    title: '属性',
    icon: '⚙️',
    width: 300,
    height: 350,
  },
  layers: {
    title: '图层',
    icon: '📚',
    width: 280,
    height: 450,
  },
  history: {
    title: '历史记录',
    icon: '⏱️',
    width: 250,
    height: 300,
  },
  color: {
    title: '颜色',
    icon: '🎨',
    width: 220,
    height: 280,
  },
};

// 添加面板组
function addPanelGroup(type: keyof typeof panelTemplates) {
  const manager = getManager();
  if (!manager) return;

  const template = panelTemplates[type];
  const id = `${type}-${++panelIdCounter}`;

  manager.addPanelGroup?.({
    id,
    title: `${template.icon} ${template.title} ${panelIdCounter}`,
    icon: template.icon,
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
      // 默认布局：左侧工具，右侧图层和属性
      manager.addPanelGroup?.({
        id: `tools-${++panelIdCounter}`,
        title: '🔧 工具箱',
        icon: '🔧',
        width: 280,
        height: 400,
        defaultPosition: 'left',
        closable: true,
        resizable: true,
      });
      
      manager.addPanelGroup?.({
        id: `layers-${++panelIdCounter}`,
        title: '📚 图层',
        icon: '📚',
        width: 280,
        height: 350,
        defaultPosition: 'right',
        closable: true,
        resizable: true,
      });
      
      manager.addPanelGroup?.({
        id: `properties-${++panelIdCounter}`,
        title: '⚙️ 属性',
        icon: '⚙️',
        width: 280,
        height: 300,
        defaultPosition: 'right',
        closable: true,
        resizable: true,
      });
      break;

    case 'design':
      // 设计布局：创建组合面板
      const group1 = manager.addPanelGroup?.({
        id: `tools-${++panelIdCounter}`,
        title: '🔧 工具箱',
        icon: '🔧',
        width: 280,
        height: 400,
        defaultPosition: 'left',
        closable: true,
        resizable: true,
      });

      // 添加第二个标签到第一个组
      if (group1) {
        group1.tabs.push({
          id: `color-${++panelIdCounter}`,
          title: '颜色',
          icon: '🎨',
          closable: true,
        });
      }

      const group2 = manager.addPanelGroup?.({
        id: `layers-${++panelIdCounter}`,
        title: '📚 图层',
        icon: '📚',
        width: 280,
        height: 350,
        defaultPosition: 'right',
        closable: true,
        resizable: true,
      });

      // 添加标签到第二个组
      if (group2) {
        group2.tabs.push({
          id: `properties-${++panelIdCounter}`,
          title: '属性',
          icon: '⚙️',
          closable: true,
        });
        group2.tabs.push({
          id: `history-${++panelIdCounter}`,
          title: '历史记录',
          icon: '⏱️',
          closable: true,
        });
      }
      break;
  }
}

// 重置所有面板
function resetAll() {
  const manager = getManager();
  if (!manager) return;

  // 移除所有面板组
  const groups = manager.panelGroupList.value;
  [...groups].forEach(group => {
    manager.removePanelGroup?.(group.id);
  });

  // 重置计数器
  panelIdCounter = 0;
}

// 获取状态名称
function getStateName(state: PanelState): string {
  const names: Record<PanelState, string> = {
    docked: '已停靠',
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
.docking-group-demo-page {
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
  height: 100%;
  overflow: auto;
}

.panel-info h3 {
  margin: 0 0 16px 0;
  color: #fff;
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
  color: #ddd;
  font-family: 'Consolas', 'Monaco', monospace;
}

.tabs-list {
  margin-top: 20px;
}

.tabs-list h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #aaa;
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
  color: #ddd;
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
